package dev.creapolis.ordotodo.hoy

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dev.creapolis.ordotodo.R
import dev.creapolis.ordotodo.data.ApiException
import dev.creapolis.ordotodo.data.DayStore
import dev.creapolis.ordotodo.data.HabitToday
import dev.creapolis.ordotodo.data.HabitsRepository
import dev.creapolis.ordotodo.data.HabitsTodayResponse
import dev.creapolis.ordotodo.data.NativeProject
import dev.creapolis.ordotodo.data.NetworkException
import dev.creapolis.ordotodo.data.SessionStore
import dev.creapolis.ordotodo.data.TasksRepository
import dev.creapolis.ordotodo.data.TodayResponse
import dev.creapolis.ordotodo.data.TodayTask
import dev.creapolis.ordotodo.data.UnauthorizedException
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.launch

sealed interface HoyUiState {
    data object Loading : HoyUiState

    data object Offline : HoyUiState

    data class Content(
        val sections: List<DaySection>,
        val done: Int,
        val total: Int,
        val isOffline: Boolean = false,
    ) : HoyUiState
}

data class Snack(val message: Int, val undoTaskId: String? = null)

/** Pure flip for tests: toggles one habit's completion without Android deps. */
fun flipHabitList(habits: List<HabitToday>, habitId: String, done: Boolean): List<HabitToday> =
    habits.map { habit ->
        if (habit.id != habitId) habit
        else if (done) habit.copy(completions = listOf(dev.creapolis.ordotodo.data.HabitCompletion()))
        else habit.copy(completions = emptyList())
    }

data class HabitsUiState(
    val habits: List<HabitToday> = emptyList(),
    val done: Int = 0,
    val total: Int = 0,
    val isOffline: Boolean = false,
)

class HoyViewModel(
    private val tasks: TasksRepository,
    private val habits: HabitsRepository? = null,
    private val day: DayStore,
    private val session: SessionStore,
    private val sync: SyncEngine = SyncEngine(tasks),
) : ViewModel() {
    private val _state = MutableStateFlow<HoyUiState>(HoyUiState.Loading)
    val state: StateFlow<HoyUiState> = _state

    private val _events = Channel<Snack>(Channel.BUFFERED)
    val events = _events.receiveAsFlow()

    private val _creating = MutableStateFlow(false)
    val creating: StateFlow<Boolean> = _creating

    private val _projects = MutableStateFlow<List<NativeProject>>(emptyList())
    val projects: StateFlow<List<NativeProject>> = _projects
    private var projectsLoaded = false

    private val _detail = MutableStateFlow<TaskEditState?>(null)
    val detail: StateFlow<TaskEditState?> = _detail

    private val _habitsState = MutableStateFlow(HabitsUiState())
    val habitsState: StateFlow<HabitsUiState> = _habitsState

    init {
        refresh()
    }

    fun refresh() {
        _state.value = HoyUiState.Loading
        viewModelScope.launch {
            val cached = day.loadDay()
            if (cached != null) show(cached, isOffline = false)
            when (pushOutbox()) {
                SyncOutcome.Unauthorized -> {
                    session.clear()
                    return@launch
                }
                SyncOutcome.WaitingForNetwork -> {
                    if (cached != null) show(cached, isOffline = true)
                    else _state.value = HoyUiState.Offline
                    return@launch
                }
                SyncOutcome.Drained -> Unit
            }
            pullDay(cached != null)
        }
    }

    /** Project list for pickers; loaded once, empty stays express on failure. */
    fun ensureProjects() {
        viewModelScope.launch { loadProjectsOnce() }
    }

    private suspend fun loadProjectsOnce(): List<NativeProject> {
        if (!projectsLoaded) {
            _projects.value =
                try {
                    tasks.projects()
                } catch (_: UnauthorizedException) {
                    session.clear()
                    return _projects.value
                } catch (_: Exception) {
                    _projects.value
                }
            projectsLoaded = true
        }
        return _projects.value
    }

    /**
     * Express capture (F1c + `#project` in F1d): parse locally, resolve the
     * hint against the project list, POST once, re-pull the day.
     * Offline creates are NOT queued (documented F1c limit): the sheet stays
     * open on network failure so nothing is silently lost.
     *
     * @return true when the POST was attempted (parsed title non-blank).
     */
    fun createTask(raw: String): Boolean {
        val parsed = parseCapture(raw)
        if (parsed.title.isBlank() || _creating.value) return false
        _creating.value = true
        viewModelScope.launch {
            try {
                val known = loadProjectsOnce()
                val projectId = resolveProjectId(parsed.projectHint, known)
                tasks.createTask(
                    parsed.title,
                    parsed.scheduledDate,
                    parsed.scheduledTime,
                    parsed.priority,
                    projectId,
                )
                _events.send(Snack(R.string.today_task_created))
                pullDay(hasCache = true)
            } catch (_: UnauthorizedException) {
                session.clear()
            } catch (_: NetworkException) {
                _events.send(Snack(R.string.auth_error_network))
            } catch (_: ApiException) {
                _events.send(Snack(R.string.auth_error_network))
            } finally {
                _creating.value = false
            }
        }
        return true
    }

    private var lastOpenedTask: TodayTask? = null

    /** Opens the detail screen, prefilled from cache, then completed from the server. */
    fun openDetail(task: TodayTask) {
        lastOpenedTask = task
        _detail.value =
            TaskEditState(
                taskId = task.id,
                title = task.title,
                scheduledDate = task.scheduledDate?.substringBefore('T').orEmpty(),
                scheduledTime = task.scheduledTime.orEmpty(),
                dueDate = task.dueDate?.substringBefore('T').orEmpty(),
                priority = task.priority,
                projectId = task.project?.id,
            )
        viewModelScope.launch {
            ensureProjects()
            try {
                val full = tasks.taskDetail(task.id)
                _detail.value =
                    _detail.value?.copy(
                        loading = false,
                        original = full,
                        title = full.title,
                        description = full.description.orEmpty(),
                        scheduledDate = full.scheduledDate?.substringBefore('T').orEmpty(),
                        scheduledTime = full.scheduledTime.orEmpty(),
                        dueDate = full.dueDate?.substringBefore('T').orEmpty(),
                        priority = full.priority,
                        projectId = full.projectId ?: full.project?.id,
                    )
            } catch (_: UnauthorizedException) {
                session.clear()
            } catch (_: NetworkException) {
                _detail.value = _detail.value?.copy(loading = false, loadError = true)
            } catch (_: ApiException) {
                _detail.value = _detail.value?.copy(loading = false, loadError = true)
            }
        }
    }

    fun closeDetail() {
        _detail.value = null
    }

    fun retryDetail() {
        lastOpenedTask?.let(::openDetail)
    }

    fun updateDetail(edit: (TaskEditState) -> TaskEditState) {
        _detail.value = _detail.value?.let(edit)
    }

    /** Saves the detail form: validates, PATCHes only the diff, re-pulls the day. */
    fun saveDetail() {
        val current = _detail.value ?: return
        val original = current.original ?: return
        if (current.saving) return
        if (current.title.isBlank()) return
        if (current.scheduledDate.isNotBlank() && parseDateText(current.scheduledDate) == null) return
        if (current.scheduledTime.isNotBlank() && parseTimeText(current.scheduledTime) == null) return
        if (current.dueDate.isNotBlank() && parseDateText(current.dueDate) == null) return
        val patch = buildTaskPatch(original, current.edited()) ?: return
        _detail.value = current.copy(saving = true)
        viewModelScope.launch {
            try {
                tasks.updateTask(current.taskId, patch)
                _events.send(Snack(R.string.detail_updated))
                pullDay(hasCache = true)
            } catch (_: UnauthorizedException) {
                session.clear()
                _detail.value = _detail.value?.copy(saving = false)
            } catch (_: NetworkException) {
                _events.send(Snack(R.string.auth_error_network))
                _detail.value = _detail.value?.copy(saving = false)
            } catch (_: ApiException) {
                _events.send(Snack(R.string.auth_error_network))
                _detail.value = _detail.value?.copy(saving = false)
            }
        }
    }

    /** Optimistic flip: UI + cache + outbox now, server when possible. */
    fun toggle(taskId: String) {
        val content = _state.value as? HoyUiState.Content ?: return
        val current = content.sections.flatMap { it.tasks }.firstOrNull { it.id == taskId } ?: return
        applyFlip(current, !current.isDone)
    }

    private fun applyFlip(task: TodayTask, done: Boolean) {
        viewModelScope.launch {
            val updated = updateCached(task.id, done) ?: return@launch
            show(updated, isOffline = false)
            day.enqueue(StatusOp(task.id, done))
            _events.send(
                Snack(
                    message = if (done) R.string.today_marked_done else R.string.today_marked_pending,
                    undoTaskId = task.id,
                ),
            )
            when (pushOutbox()) {
                SyncOutcome.Unauthorized -> session.clear()
                SyncOutcome.WaitingForNetwork -> show(updated, isOffline = true)
                SyncOutcome.Drained -> pullDay(hasCache = true)
            }
        }
    }

    private suspend fun pushOutbox(): SyncOutcome = sync.sync(day)

    /** Habits check-in (F3a): optimistic flip, server authoritative, no queue yet. */
    fun toggleHabit(habitId: String) {
        val repo = habits ?: return
        val current = _habitsState.value.habits.firstOrNull { it.id == habitId } ?: return
        val done = !current.doneToday
        applyHabitFlip(current, done, repo)
    }

    private fun applyHabitFlip(habit: HabitToday, done: Boolean, repo: HabitsRepository) {
        val before = _habitsState.value.habits
        _habitsState.value = HabitsUiState(
            habits = flipHabitList(before, habit.id, done),
            done = before.count { if (it.id == habit.id) done else it.doneToday },
            total = before.size,
        )
        viewModelScope.launch {
            try {
                if (done) repo.complete(habit.id) else repo.uncomplete(habit.id)
                pullHabits()
                _events.send(Snack(if (done) R.string.habits_done else R.string.habits_undone))
            } catch (_: UnauthorizedException) {
                session.clear()
            } catch (_: Exception) {
                _habitsState.value = HabitsUiState(
                    habits = before,
                    done = before.count(HabitToday::doneToday),
                    total = before.size,
                    isOffline = true,
                )
                _events.send(Snack(R.string.auth_error_network))
            }
        }
    }

    private suspend fun pullHabits() {
        val repo = habits ?: return
        try {
            val response = repo.today()
            showHabits(response, isOffline = false)
        } catch (_: UnauthorizedException) {
            session.clear()
        } catch (_: NetworkException) {
            _habitsState.value = _habitsState.value.copy(isOffline = true)
        } catch (_: ApiException) {
            // Keep last good habits; F3b adds cached copy.
        }
    }

    private fun showHabits(response: HabitsTodayResponse, isOffline: Boolean) {
        val all = response.habits.ifEmpty { response.grouped.all() }
        _habitsState.value = HabitsUiState(
            habits = all,
            done = all.count(HabitToday::doneToday),
            total = all.size,
            isOffline = isOffline,
        )
    }

    private suspend fun pullDay(hasCache: Boolean) {
        try {
            val response = tasks.today()
            day.saveDay(response)
            show(response, isOffline = false)
            pullHabits()
        } catch (_: UnauthorizedException) {
            session.clear()
        } catch (_: NetworkException) {
            val cached = day.loadDay()
            if (cached != null) show(cached, isOffline = true)
            else if (!hasCache) _state.value = HoyUiState.Offline
        } catch (_: ApiException) {
            if (!hasCache) _state.value = HoyUiState.Offline
        }
    }

    private fun show(response: TodayResponse, isOffline: Boolean) {
        val sections = sectionToday(response)
        val all = sections.flatMap { it.tasks }
        _state.value =
            HoyUiState.Content(
                sections = sections,
                done = all.count(TodayTask::isDone),
                total = all.size,
                isOffline = isOffline,
            )
    }

    private suspend fun updateCached(taskId: String, done: Boolean): TodayResponse? {
        val cached = day.loadDay() ?: return null
        fun flip(task: TodayTask): TodayTask =
            if (task.id == taskId) task.copy(status = if (done) "COMPLETED" else "TODO") else task

        val updated =
            cached.copy(
                overdue = cached.overdue.map(::flip),
                dueToday = cached.dueToday.map(::flip),
                scheduledToday = cached.scheduledToday.map(::flip),
                available = cached.available.map(::flip),
                notYetAvailable = cached.notYetAvailable.map(::flip),
            )
        day.saveDay(updated)
        return updated
    }
}
