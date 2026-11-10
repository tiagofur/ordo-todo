package dev.creapolis.ordotodo.tasks

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dev.creapolis.ordotodo.R
import dev.creapolis.ordotodo.data.ApiException
import dev.creapolis.ordotodo.data.DayStore
import dev.creapolis.ordotodo.data.NativeProject
import dev.creapolis.ordotodo.data.NetworkException
import dev.creapolis.ordotodo.data.OutboxOp
import dev.creapolis.ordotodo.data.SessionStore
import dev.creapolis.ordotodo.data.TasksRepository
import dev.creapolis.ordotodo.data.TodayTask
import dev.creapolis.ordotodo.data.UnauthorizedException
import dev.creapolis.ordotodo.hoy.CreateOp
import dev.creapolis.ordotodo.hoy.Snack
import dev.creapolis.ordotodo.hoy.tasksWithPendingCreates
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.launch

sealed interface TasksUiState {
    data object Loading : TasksUiState

    data object Offline : TasksUiState

    data class Content(
        val sections: List<TasksSection>,
        val total: Int,
        val isOffline: Boolean = false,
    ) : TasksUiState
}

/**
 * Tareas tab (F3b): one pull (`GET /tasks`, optional server project
 * filter) feeds every section, search and project grouping client-side.
 * Toggle is optimistic and server-authoritative like habits (F3a): no
 * outbox yet — the Day queue stays Hoy-only until F5 unifies it.
 */
class TasksViewModel(
    private val tasks: TasksRepository,
    private val session: SessionStore? = null,
    private val day: DayStore? = null,
    private val onChanged: () -> Unit = {},
) : ViewModel() {
    private val _state = MutableStateFlow<TasksUiState>(TasksUiState.Loading)
    val state: StateFlow<TasksUiState> = _state

    private val _query = MutableStateFlow("")
    val query: StateFlow<String> = _query

    private val _projectFilter = MutableStateFlow<String?>(null)
    val projectFilter: StateFlow<String?> = _projectFilter

    private val _projects = MutableStateFlow<List<NativeProject>>(emptyList())
    val projects: StateFlow<List<NativeProject>> = _projects

    private val _events = Channel<Snack>(Channel.BUFFERED)
    val events = _events.receiveAsFlow()

    private var all: List<TodayTask> = emptyList()

    /** Captures queued offline; shown as rows until they sync (ODD 051 S4). */
    private var pendingCreates: List<CreateOp> = emptyList()

    private suspend fun readPendingCreates(): List<CreateOp> =
        day?.outboxPending()?.filterIsInstance<OutboxOp.CreateTask>()?.map {
            CreateOp(it.localId, it.title, it.date, it.time, it.priority, it.projectId, it.at)
        } ?: day?.createPending().orEmpty()

    init {
        viewModelScope.launch {
            // Cached rows first: the tab opens without a spinner.
            pendingCreates = readPendingCreates()
            val cached = day?.loadTasks()
            if (cached != null) {
                all = cached
                show()
            }
            pull()
        }
    }

    /** Re-reads the offline queue and the server without the full-screen spinner. */
    fun reloadQuietly() {
        viewModelScope.launch {
            pendingCreates = readPendingCreates()
            if (_state.value is TasksUiState.Content) show()
            pull()
        }
    }

    /** True only while a pull-to-refresh runs; the list stays on screen (ODD 051 S5). */
    private val _refreshing = MutableStateFlow(false)
    val refreshing: StateFlow<Boolean> = _refreshing

    fun pullToRefresh() {
        if (_refreshing.value) return
        _refreshing.value = true
        viewModelScope.launch {
            try {
                pull()
            } finally {
                _refreshing.value = false
            }
        }
    }

    fun refresh() {
        _state.value = TasksUiState.Loading
        viewModelScope.launch { pull() }
    }

    fun setQuery(value: String) {
        _query.value = value
        show()
    }

    fun setProject(projectId: String?) {
        if (_projectFilter.value == projectId) return
        _projectFilter.value = projectId
        refresh()
    }

    /** Optimistic flip with durable queue; Hoy refreshes through [onChanged]. */
    fun toggle(taskId: String) {
        val current = all.firstOrNull { it.id == taskId }
        val done = !(current?.isDone ?: false)
        all = flipTaskList(all, taskId, done)
        show()
        viewModelScope.launch {
            day?.enqueueOp(OutboxOp.StatusFlip(taskId, done, System.currentTimeMillis()))
            _events.send(
                Snack(if (done) R.string.today_marked_done else R.string.today_marked_pending),
            )
            onChanged()
            if (current != null && !current.pendingSync) {
                try {
                    if (done) tasks.complete(taskId) else tasks.reopen(taskId)
                    pull()
                } catch (_: UnauthorizedException) {
                    session?.clear()
                } catch (_: NetworkException) {
                    show(isOffline = true)
                } catch (_: ApiException) {
                    show()
                }
            }
        }
    }

    private suspend fun pull() {
        try {
            all = tasks.all(_projectFilter.value)
            if (_projectFilter.value == null) day?.saveTasks(all)
            pendingCreates = readPendingCreates()
            _projects.value =
                try {
                    tasks.projects()
                } catch (_: Exception) {
                    _projects.value
                }
            show()
        } catch (_: UnauthorizedException) {
            session?.clear()
        } catch (_: NetworkException) {
            _state.value = tasksStateAfterFailedPull(visible(), _query.value, network = true)
        } catch (e: Exception) {
            // API errors and undecodable payloads alike: never stay on Loading (ODD 051 S1).
            if (e is CancellationException) throw e
            _state.value = tasksStateAfterFailedPull(visible(), _query.value, network = false)
        }
    }

    private fun visible(): List<TodayTask> {
        val project = _projectFilter.value
        val queued = if (project == null) pendingCreates else pendingCreates.filter { it.projectId == project }
        return tasksWithPendingCreates(all, queued)
    }

    private fun show(isOffline: Boolean = false) {
        _state.value = tasksContent(visible(), _query.value, isOffline)
    }
}

private fun tasksContent(all: List<TodayTask>, query: String, isOffline: Boolean): TasksUiState.Content {
    val sections = sectionTasks(all, query, projectFilter = null)
    return TasksUiState.Content(
        sections = sections,
        total = sections.flatMap { it.tasks }.size,
        isOffline = isOffline,
    )
}

/**
 * State after a pull that failed (ODD 051 S1): rows already loaded stay
 * visible, an empty list becomes the retryable error. Never Loading.
 */
fun tasksStateAfterFailedPull(all: List<TodayTask>, query: String, network: Boolean): TasksUiState =
    if (all.isEmpty()) TasksUiState.Offline else tasksContent(all, query, isOffline = network)

/** Pure flip for tests: toggles one task's status without Android deps. */
fun flipTaskList(tasks: List<TodayTask>, taskId: String, done: Boolean): List<TodayTask> =
    tasks.map { task ->
        if (task.id != taskId) task
        else task.copy(status = if (done) "COMPLETED" else "TODO")
    }
