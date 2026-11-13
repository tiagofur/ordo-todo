package dev.creapolis.ordotodo.hoy

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dev.creapolis.ordotodo.R
import dev.creapolis.ordotodo.data.AiRepository
import dev.creapolis.ordotodo.data.ApiException
import dev.creapolis.ordotodo.data.renderEnhancedText
import dev.creapolis.ordotodo.data.DayPlanView
import dev.creapolis.ordotodo.data.DayStore
import dev.creapolis.ordotodo.data.DefaultOutboxApi
import dev.creapolis.ordotodo.data.HabitToday
import dev.creapolis.ordotodo.data.HabitsRepository
import dev.creapolis.ordotodo.data.HabitsTodayResponse
import dev.creapolis.ordotodo.data.NativeProject
import dev.creapolis.ordotodo.data.NetworkException
import dev.creapolis.ordotodo.data.OutboxOp
import dev.creapolis.ordotodo.data.OutboxSyncEngine
import dev.creapolis.ordotodo.data.SessionStore
import dev.creapolis.ordotodo.data.TasksRepository
import dev.creapolis.ordotodo.data.SubtaskItem
import dev.creapolis.ordotodo.data.TaskTag
import dev.creapolis.ordotodo.data.TodayResponse
import dev.creapolis.ordotodo.data.TodayTask
import dev.creapolis.ordotodo.data.UnauthorizedException
import dev.creapolis.ordotodo.ritual.RitualEveningMove
import dev.creapolis.ordotodo.ritual.RitualEveningView
import dev.creapolis.ordotodo.ritual.RitualMorningView
import dev.creapolis.ordotodo.ritual.RitualPhase
import dev.creapolis.ordotodo.ritual.RitualRepository
import dev.creapolis.ordotodo.ritual.RitualStreak
import dev.creapolis.ordotodo.ritual.activeRitualPhase
import java.time.LocalDate
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.channels.Channel
import dev.creapolis.ordotodo.habits.last7Stations
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
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
        val capacity: DayCapacity = DayCapacity(0, 480),
        val overdueTasks: List<TodayTask> = emptyList(),
    ) : HoyUiState
}

data class Snack(
    val message: Int,
    val undoTaskId: String? = null,
    val undoDeleteTaskId: String? = null,
    val undoReschedule: Pair<String, String?>? = null,
)

/** One-shot order to open capture with prefilled text (F4a). */
data class CaptureRequest(val prefill: String)

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
    val loaded: Boolean = false,
    /** Last pull failed for a reason other than the network; the list offers retry. */
    val failed: Boolean = false,
) {
    /** An empty list that comes from a failed pull must not wipe the reminders. */
    val canScheduleReminders: Boolean
        get() = loaded && !(habits.isEmpty() && (failed || isOffline))
}

/** State after a failed habits pull (ODD 051 S1): loading always ends, shown habits stay. */
fun habitsAfterFailedPull(state: HabitsUiState, network: Boolean): HabitsUiState =
    state.copy(isOffline = network, failed = !network, loaded = true)

/** Habit create/edit form. `habitId = null` opens the create sheet. */
data class HabitEditState(
    val habitId: String? = null,
    val name: String = "",
    val timeOfDay: String? = null,
    val time: String = "",
    val count: String = "",
    val saving: Boolean = false,
    /** Last-7 stations, oldest first; null while loading (F3d). */
    val stations: List<Boolean>? = null,
)

class HoyViewModel(
    private val tasks: TasksRepository,
    private val habits: HabitsRepository? = null,
    private val day: DayStore,
    private val session: SessionStore,
    private val sync: SyncEngine = SyncEngine(tasks),
    ritual: RitualRepository? = null,
    private val settings: dev.creapolis.ordotodo.settings.AppSettings? = null,
) : ViewModel() {
    private val ritualRepo: RitualRepository = ritual ?: RitualRepository(tasks.api)

    /** Tells the Tareas tab that the offline capture queue changed. */
    var onQueueChanged: () -> Unit = {}

    private val _state = MutableStateFlow<HoyUiState>(HoyUiState.Loading)
    val state: StateFlow<HoyUiState> = _state

    private val _events = Channel<Snack>(Channel.BUFFERED)
    val events = _events.receiveAsFlow()

    private val _creating = MutableStateFlow(false)
    val creating: StateFlow<Boolean> = _creating

    private val _projects = MutableStateFlow<List<NativeProject>>(emptyList())
    val projects: StateFlow<List<NativeProject>> = _projects
    private var projectsLoaded = false

    private val _availableTags = MutableStateFlow<List<TaskTag>>(emptyList())
    val availableTags: StateFlow<List<TaskTag>> = _availableTags.asStateFlow()

    private val _detail = MutableStateFlow<TaskEditState?>(null)
    val detail: StateFlow<TaskEditState?> = _detail

    private val _habitsState = MutableStateFlow(HabitsUiState())
    val habitsState: StateFlow<HabitsUiState> = _habitsState

    private val _habitEdit = MutableStateFlow<HabitEditState?>(null)
    val habitEdit: StateFlow<HabitEditState?> = _habitEdit

    private val _captureRequest = MutableStateFlow<CaptureRequest?>(null)
    val captureRequest: StateFlow<CaptureRequest?> = _captureRequest

    private val _focusRequest = MutableStateFlow<Pair<String, String>?>(null)
    val focusRequest: StateFlow<Pair<String, String>?> = _focusRequest.asStateFlow()

    private val _replanOpen = MutableStateFlow(false)
    val replanOpen: StateFlow<Boolean> = _replanOpen.asStateFlow()

    private val _replanPlan = MutableStateFlow<DayPlanView?>(null)
    val replanPlan: StateFlow<DayPlanView?> = _replanPlan.asStateFlow()

    private val _replanLoading = MutableStateFlow(false)
    val replanLoading: StateFlow<Boolean> = _replanLoading.asStateFlow()

    private val _ritualStreak = MutableStateFlow(RitualStreak())
    val ritualStreak: StateFlow<RitualStreak> = _ritualStreak.asStateFlow()

    private val _activeRitualPhase = MutableStateFlow(RitualPhase.NONE)
    val activeRitualPhase: StateFlow<RitualPhase> = _activeRitualPhase.asStateFlow()

    private val _morningRitualView = MutableStateFlow<RitualMorningView?>(null)
    val morningRitualView: StateFlow<RitualMorningView?> = _morningRitualView.asStateFlow()

    private val _eveningRitualView = MutableStateFlow<RitualEveningView?>(null)
    val eveningRitualView: StateFlow<RitualEveningView?> = _eveningRitualView.asStateFlow()

    private val _ritualSheetOpen = MutableStateFlow(RitualPhase.NONE)
    val ritualSheetOpen: StateFlow<RitualPhase> = _ritualSheetOpen.asStateFlow()

    private val _ritualLoading = MutableStateFlow(false)
    val ritualLoading: StateFlow<Boolean> = _ritualLoading.asStateFlow()

    /** Daily capacity window from Settings (S19); 480 min until the store answers. */
    private var availableMinutes: Int = 480

    init {
        refresh()
        val store = settings
        if (store != null) {
            viewModelScope.launch {
                var first = true
                store.availableMinutes.collect { minutes ->
                    if (first) {
                        first = false
                        availableMinutes = minutes
                    } else if (minutes != availableMinutes) {
                        availableMinutes = minutes
                        refresh()
                    }
                }
            }
        }
    }

    /** Opens capture from outside the app (tile, shortcut, share) (F4a). */
    fun requestCapture(prefill: String) {
        _captureRequest.value = CaptureRequest(prefill)
    }

    fun consumeCaptureRequest() {
        _captureRequest.value = null
    }

    /** AI-refined capture text, one-shot for the sheet (S16). */
    private val _enhanced = MutableStateFlow<String?>(null)
    val enhanced: StateFlow<String?> = _enhanced

    private val _enhancing = MutableStateFlow(false)
    val enhancing: StateFlow<Boolean> = _enhancing

    /** Refines the typed text with `POST /ai/parse-task`; failures surface the network error. */
    fun enhanceCapture(text: String) {
        if (text.isBlank() || _enhancing.value) return
        viewModelScope.launch {
            _enhancing.value = true
            try {
                val parsed = ai.parseTask(text)
                if (parsed != null) {
                    _enhanced.value = renderEnhancedText(parsed)
                } else {
                    _events.send(Snack(R.string.auth_error_network))
                }
            } catch (_: Exception) {
                _events.send(Snack(R.string.auth_error_network))
            } finally {
                _enhancing.value = false
            }
        }
    }

    fun consumeEnhanced() {
        _enhanced.value = null
    }

    fun requestFocusSheet(taskId: String, title: String) {
        _focusRequest.value = taskId to title
    }

    fun consumeFocusRequest() {
        _focusRequest.value = null
    }

    /** True only while a pull-to-refresh runs; the list stays on screen (ODD 051 S5). */
    private val _refreshing = MutableStateFlow(false)
    val refreshing: StateFlow<Boolean> = _refreshing

    fun pullToRefresh() {
        if (_refreshing.value) return
        _refreshing.value = true
        refresh(showLoading = false)
    }

    fun refresh(showLoading: Boolean = true) {
        if (showLoading) _state.value = HoyUiState.Loading
        viewModelScope.launch {
            try {
                reload()
            } finally {
                _refreshing.value = false
            }
        }
    }

    /** Captures still waiting for the network; merged into every paint of the day. */
    private var pendingCreates: List<CreateOp> = emptyList()

    private val outboxEngine: OutboxSyncEngine =
        OutboxSyncEngine(
            api = DefaultOutboxApi(tasks, habits),
            onTaskCreated = { localId, serverId ->
                day.reconcileLocalId(localId, serverId)
                onQueueChanged()
            },
        )

    private suspend fun syncOutbox(): SyncOutcome {
        val outcome = outboxEngine.sync(day)
        val outbox = day.outboxPending()
        pendingCreates = outbox.filterIsInstance<OutboxOp.CreateTask>().map {
            CreateOp(it.localId, it.title, it.date, it.time, it.priority, it.projectId, it.at)
        }
        return outcome
    }

    private suspend fun reload() {
        val outbox = day.outboxPending()
        pendingCreates = outbox.filterIsInstance<OutboxOp.CreateTask>().map {
            CreateOp(it.localId, it.title, it.date, it.time, it.priority, it.projectId, it.at)
        }
        val cached = day.loadDay()
        if (cached != null) show(cached, isOffline = false)
        showCachedHabits()
        val hadCreates = pendingCreates.isNotEmpty()
        when (syncOutbox()) {
            SyncOutcome.Unauthorized -> {
                session.clear()
                return
            }
            SyncOutcome.WaitingForNetwork -> {
                if (cached != null) show(cached, isOffline = true)
                else _state.value = HoyUiState.Offline
                _habitsState.value = habitsAfterFailedPull(_habitsState.value, network = true)
                return
            }
            SyncOutcome.Drained -> {
                if (hadCreates) onQueueChanged()
            }
        }
        pullDay(cached != null)
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
                // Nothing is lost offline: queue it and show it at once (ODD 051 S4).
                val projectId = resolveProjectId(parsed.projectHint, _projects.value)
                val localId = "local-" + java.util.UUID.randomUUID()
                val op =
                    OutboxOp.CreateTask(
                        localId = localId,
                        title = parsed.title,
                        date = parsed.scheduledDate?.toString(),
                        time = parsed.scheduledTime,
                        priority = parsed.priority,
                        projectId = projectId,
                        at = System.currentTimeMillis(),
                    )
                day.enqueueOp(op)
                val outbox = day.outboxPending()
                pendingCreates = outbox.filterIsInstance<OutboxOp.CreateTask>().map {
                    CreateOp(it.localId, it.title, it.date, it.time, it.priority, it.projectId, it.at)
                }
                show(day.loadDay() ?: TodayResponse(), isOffline = true)
                onQueueChanged()
                _events.send(Snack(R.string.today_saved_offline))
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
        if (task.pendingSync) {
            _detail.value = _detail.value?.copy(loading = false)
            return
        }
        viewModelScope.launch {
            ensureProjects()
            try {
                val full = tasks.taskDetail(task.id)
                val fullTags = if (full.tags.isNotEmpty()) full.tags else tasks.taskTags(task.id)
                val fullComments =
                    try {
                        tasks.taskComments(task.id)
                    } catch (_: Exception) {
                        emptyList()
                    }
                val taskWithTags = full.copy(tags = fullTags)
                _detail.value =
                    _detail.value?.copy(
                        loading = false,
                        original = taskWithTags,
                        title = full.title,
                        description = full.description.orEmpty(),
                        scheduledDate = full.scheduledDate?.substringBefore('T').orEmpty(),
                        scheduledTime = full.scheduledTime.orEmpty(),
                        dueDate = full.dueDate?.substringBefore('T').orEmpty(),
                        priority = full.priority,
                        projectId = full.projectId ?: full.project?.id,
                        estimatedMinutes = full.estimatedMinutes,
                        recurrence = full.recurrence,
                        subTasks = full.subTasks,
                        tags = fullTags,
                        comments = fullComments,
                    )
                loadAvailableTags()
            } catch (_: UnauthorizedException) {
                session.clear()
            } catch (_: NetworkException) {
                _detail.value = _detail.value?.copy(loading = false, loadError = true)
            } catch (_: ApiException) {
                _detail.value = _detail.value?.copy(loading = false, loadError = true)
            }
        }
    }

    fun loadAvailableTags() {
        val current = _detail.value ?: return
        val workspaceId = current.tags.firstOrNull()?.workspaceId
            ?: _projects.value.firstOrNull { it.id == current.projectId }?.workspaceId
            ?: _projects.value.firstOrNull { it.workspaceId != null }?.workspaceId
        viewModelScope.launch {
            _availableTags.value = tasks.allTags(workspaceId)
        }
    }

    fun addSubtask(title: String) {
        val current = _detail.value ?: return
        if (title.isBlank()) return
        viewModelScope.launch {
            try {
                val created = tasks.createSubtask(current.taskId, title.trim())
                val newSubTasks = current.subTasks + created
                _detail.value = current.copy(
                    subTasks = newSubTasks,
                    original = current.original?.copy(subTasks = newSubTasks),
                )
            } catch (_: Exception) {
                _events.send(Snack(R.string.auth_error_network))
            }
        }
    }

    private val ai = AiRepository(tasks.api)

    /** AI-proposed subtask titles, or null when no proposal is showing (S16). */
    private val _suggestions = MutableStateFlow<List<String>?>(null)
    val suggestions: StateFlow<List<String>?> = _suggestions

    private val _decomposing = MutableStateFlow(false)
    val decomposing: StateFlow<Boolean> = _decomposing

    /** Asks the AI to split the open task; failures surface the network error. */
    fun suggestSubtasks() {
        val current = _detail.value ?: return
        if (current.title.isBlank() || _decomposing.value) return
        viewModelScope.launch {
            _decomposing.value = true
            try {
                _suggestions.value = ai.decompose(current.title, current.description)
            } catch (_: Exception) {
                _events.send(Snack(R.string.auth_error_network))
            } finally {
                _decomposing.value = false
            }
        }
    }

    /** Adds a suggestion as a real subtask and removes it from the proposal. */
    fun acceptSuggestion(title: String) {
        addSubtask(title)
        val remaining = _suggestions.value.orEmpty() - title
        _suggestions.value = remaining.ifEmpty { null }
    }

    fun dismissSuggestions() {
        _suggestions.value = null
    }

    fun toggleSubtask(subtaskId: String) {
        val current = _detail.value ?: return
        val item = current.subTasks.firstOrNull { it.id == subtaskId } ?: return
        val newDone = !item.isDone
        val newStatus = if (newDone) "COMPLETED" else "TODO"
        val updatedList = current.subTasks.map {
            if (it.id == subtaskId) it.copy(status = newStatus) else it
        }
        _detail.value = current.copy(
            subTasks = updatedList,
            original = current.original?.copy(subTasks = updatedList),
        )
        viewModelScope.launch {
            try {
                if (newDone) tasks.completeSubtask(subtaskId)
                else tasks.reopenSubtask(subtaskId)
            } catch (_: Exception) {
                _detail.value = current
            }
        }
    }

    fun deleteSubtask(subtaskId: String) {
        val current = _detail.value ?: return
        val updatedList = current.subTasks.filter { it.id != subtaskId }
        _detail.value = current.copy(
            subTasks = updatedList,
            original = current.original?.copy(subTasks = updatedList),
        )
        viewModelScope.launch {
            try {
                tasks.deleteSubtask(subtaskId)
            } catch (_: Exception) {
                _detail.value = current
            }
        }
    }

    fun assignTag(tag: TaskTag) {
        val current = _detail.value ?: return
        if (current.tags.any { it.id == tag.id }) return
        val updated = current.tags + tag
        _detail.value = current.copy(
            tags = updated,
            original = current.original?.copy(tags = updated),
        )
        viewModelScope.launch {
            try {
                tasks.assignTag(tag.id, current.taskId)
            } catch (_: Exception) {
                _detail.value = current
            }
        }
    }

    fun removeTag(tagId: String) {
        val current = _detail.value ?: return
        val updated = current.tags.filter { it.id != tagId }
        _detail.value = current.copy(
            tags = updated,
            original = current.original?.copy(tags = updated),
        )
        viewModelScope.launch {
            try {
                tasks.removeTag(tagId, current.taskId)
            } catch (_: Exception) {
                _detail.value = current
            }
        }
    }

    fun createAndAssignTag(name: String) {
        val current = _detail.value ?: return
        if (name.isBlank()) return
        val workspaceId = current.tags.firstOrNull()?.workspaceId
            ?: _projects.value.firstOrNull { it.id == current.projectId }?.workspaceId
            ?: _projects.value.firstOrNull { it.workspaceId != null }?.workspaceId
        if (workspaceId == null) return
        viewModelScope.launch {
            try {
                val created = tasks.createTag(name = name.trim(), workspaceId = workspaceId)
                assignTag(created)
                _availableTags.value = _availableTags.value + created
            } catch (_: Exception) {
                _events.send(Snack(R.string.auth_error_network))
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
        if (current.saving) return
        if (current.title.isBlank()) return
        if (current.scheduledDate.isNotBlank() && parseDateText(current.scheduledDate) == null) return
        if (current.scheduledTime.isNotBlank() && parseTimeText(current.scheduledTime) == null) return
        if (current.dueDate.isNotBlank() && parseDateText(current.dueDate) == null) return

        if (current.original == null) {
            // Local task capture edited before it synced to the server
            _detail.value = current.copy(saving = true)
            viewModelScope.launch {
                day.updateOutbox { ops ->
                    ops.map { op ->
                        if (op is OutboxOp.CreateTask && op.localId == current.taskId) {
                            op.copy(
                                title = current.title,
                                date = current.scheduledDate.ifBlank { null },
                                time = current.scheduledTime.ifBlank { null },
                                priority = current.priority,
                                projectId = current.projectId,
                            )
                        } else op
                    }
                }
                day.loadDay()?.let { d ->
                    fun List<TodayTask>.patchLocal() = map {
                        if (it.id == current.taskId) it.copy(
                            title = current.title,
                            scheduledDate = current.scheduledDate.ifBlank { null },
                            scheduledTime = current.scheduledTime.ifBlank { null },
                            priority = current.priority,
                        ) else it
                    }
                    val updated = d.copy(
                        overdue = d.overdue.patchLocal(),
                        dueToday = d.dueToday.patchLocal(),
                        scheduledToday = d.scheduledToday.patchLocal(),
                        available = d.available.patchLocal(),
                        notYetAvailable = d.notYetAvailable.patchLocal(),
                    )
                    day.saveDay(updated)
                    show(updated, isOffline = false)
                }
                _events.send(Snack(R.string.detail_updated))
                closeDetail()
            }
            return
        }

        val original = current.original
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
                val patchMap = patch.mapValues { (_, value) ->
                    if (value is kotlinx.serialization.json.JsonPrimitive && value.isString) value.content else value.toString()
                }
                day.enqueueOp(OutboxOp.EditTask(current.taskId, patchMap, System.currentTimeMillis()))
                _events.send(Snack(R.string.today_saved_offline))
                _detail.value = _detail.value?.copy(saving = false)
                closeDetail()
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
            day.enqueueOp(OutboxOp.StatusFlip(task.id, done, System.currentTimeMillis()))
            _events.send(
                Snack(
                    message = if (done) R.string.today_marked_done else R.string.today_marked_pending,
                    undoTaskId = task.id,
                ),
            )
            when (syncOutbox()) {
                SyncOutcome.Unauthorized -> session.clear()
                SyncOutcome.WaitingForNetwork -> show(updated, isOffline = true)
                SyncOutcome.Drained -> pullDay(hasCache = true)
            }
        }
    }

    /** Habits check-in (F3c): optimistic flip + durable outbox, drained on every pull. */
    fun toggleHabit(habitId: String) {
        val current = _habitsState.value.habits.firstOrNull { it.id == habitId } ?: return
        val done = !current.doneToday
        applyHabitFlip(current, done)
    }

    private fun applyHabitFlip(habit: HabitToday, done: Boolean) {
        val before = _habitsState.value.habits
        _habitsState.value = HabitsUiState(
            habits = flipHabitList(before, habit.id, done),
            done = before.count { if (it.id == habit.id) done else it.doneToday },
            total = before.size,
            loaded = true,
        )
        viewModelScope.launch {
            day.saveHabits(HabitsTodayResponse(habits = _habitsState.value.habits))
            day.enqueueOp(OutboxOp.HabitCheck(habit.id, done, System.currentTimeMillis()))
            when (syncOutbox()) {
                SyncOutcome.Unauthorized -> session.clear()
                SyncOutcome.WaitingForNetwork -> {
                    _habitsState.value = _habitsState.value.copy(isOffline = true)
                    _events.send(Snack(R.string.auth_error_network))
                }
                SyncOutcome.Drained -> {
                    pullHabits()
                    _events.send(Snack(if (done) R.string.habits_done else R.string.habits_undone))
                }
            }
        }
    }

    fun deleteTask(taskId: String) {
        viewModelScope.launch {
            day.enqueueOp(OutboxOp.DeleteTask(taskId, System.currentTimeMillis()))
            day.loadDay()?.let { d ->
                fun List<TodayTask>.removeTask() = filter { it.id != taskId }
                val updated = d.copy(
                    overdue = d.overdue.removeTask(),
                    dueToday = d.dueToday.removeTask(),
                    scheduledToday = d.scheduledToday.removeTask(),
                    available = d.available.removeTask(),
                    notYetAvailable = d.notYetAvailable.removeTask(),
                )
                day.saveDay(updated)
                show(updated, isOffline = false)
            }
            day.loadTasks()?.let { t ->
                day.saveTasks(t.filter { it.id != taskId })
            }
            onQueueChanged()
            when (syncOutbox()) {
                SyncOutcome.Unauthorized -> session.clear()
                SyncOutcome.WaitingForNetwork -> Unit
                SyncOutcome.Drained -> pullDay(hasCache = true)
            }
        }
    }

    fun deleteTaskWithUndo(taskId: String) {
        closeDetail()
        deleteTask(taskId)
        viewModelScope.launch {
            _events.send(
                Snack(
                    message = R.string.today_task_deleted,
                    undoDeleteTaskId = taskId,
                ),
            )
        }
    }

    fun restoreTask(taskId: String) {
        viewModelScope.launch {
            var wasPending = false
            day.updateOutbox { ops ->
                val hasDelete = ops.filterIsInstance<OutboxOp.DeleteTask>().any { it.taskId == taskId }
                if (hasDelete) {
                    wasPending = true
                    ops.filterNot { it is OutboxOp.DeleteTask && it.taskId == taskId }
                } else {
                    ops
                }
            }
            if (!wasPending) {
                try {
                    tasks.restoreTask(taskId)
                } catch (_: Exception) {
                    // best effort
                }
            }
            pullDay(hasCache = true)
            _events.send(Snack(R.string.today_task_restored))
        }
    }

    fun rescheduleTaskToTomorrow(task: TodayTask) {
        val tomorrow = LocalDate.now().plusDays(1).toString()
        val originalDate = task.scheduledDate
        viewModelScope.launch {
            day.loadDay()?.let { d ->
                fun List<TodayTask>.filterOut() = filter { it.id != task.id }
                val updated = d.copy(
                    overdue = d.overdue.filterOut(),
                    dueToday = d.dueToday.filterOut(),
                    scheduledToday = d.scheduledToday.filterOut(),
                    available = d.available.filterOut(),
                    notYetAvailable = d.notYetAvailable.filterOut(),
                )
                day.saveDay(updated)
                show(updated, isOffline = false)
            }
            val patch = mapOf("scheduledDate" to tomorrow)
            try {
                tasks.updateTask(task.id, patch)
            } catch (_: NetworkException) {
                day.enqueueOp(OutboxOp.EditTask(task.id, patch, System.currentTimeMillis()))
            } catch (_: Exception) {
                // best effort
            }
            _events.send(
                Snack(
                    message = R.string.today_rescheduled_tomorrow,
                    undoReschedule = task.id to originalDate,
                ),
            )
            when (syncOutbox()) {
                SyncOutcome.Unauthorized -> session.clear()
                SyncOutcome.WaitingForNetwork -> Unit
                SyncOutcome.Drained -> pullDay(hasCache = true)
            }
        }
    }

    fun undoReschedule(taskId: String, previousDate: String?) {
        viewModelScope.launch {
            val patch = mapOf("scheduledDate" to previousDate)
            try {
                tasks.updateTask(taskId, patch)
            } catch (_: NetworkException) {
                day.enqueueOp(OutboxOp.EditTask(taskId, patch, System.currentTimeMillis()))
            } catch (_: Exception) {
                // best effort
            }
            pullDay(hasCache = true)
        }
    }

    fun updateTaskPriority(taskId: String, priority: String) {
        viewModelScope.launch {
            val patch = mapOf("priority" to priority)
            day.loadDay()?.let { d ->
                fun List<TodayTask>.patchPrio() = map {
                    if (it.id == taskId) it.copy(priority = priority) else it
                }
                val updated = d.copy(
                    overdue = d.overdue.patchPrio(),
                    dueToday = d.dueToday.patchPrio(),
                    scheduledToday = d.scheduledToday.patchPrio(),
                    available = d.available.patchPrio(),
                    notYetAvailable = d.notYetAvailable.patchPrio(),
                )
                day.saveDay(updated)
                show(updated, isOffline = false)
            }
            try {
                tasks.updateTask(taskId, patch)
            } catch (_: NetworkException) {
                day.enqueueOp(OutboxOp.EditTask(taskId, patch, System.currentTimeMillis()))
            } catch (_: Exception) {
                // best effort
            }
            when (syncOutbox()) {
                SyncOutcome.Unauthorized -> session.clear()
                SyncOutcome.WaitingForNetwork -> Unit
                SyncOutcome.Drained -> pullDay(hasCache = true)
            }
        }
    }

    fun moveTaskToProject(taskId: String, projectId: String?) {
        viewModelScope.launch {
            val patch = mapOf("projectId" to projectId)
            val project = _projects.value.firstOrNull { it.id == projectId }?.let {
                dev.creapolis.ordotodo.data.TodayProject(it.id, it.name, it.color, it.workspaceId)
            }
            day.loadDay()?.let { d ->
                fun List<TodayTask>.patchProj() = map {
                    if (it.id == taskId) it.copy(project = project) else it
                }
                val updated = d.copy(
                    overdue = d.overdue.patchProj(),
                    dueToday = d.dueToday.patchProj(),
                    scheduledToday = d.scheduledToday.patchProj(),
                    available = d.available.patchProj(),
                    notYetAvailable = d.notYetAvailable.patchProj(),
                )
                day.saveDay(updated)
                show(updated, isOffline = false)
            }
            try {
                tasks.updateTask(taskId, patch)
            } catch (_: NetworkException) {
                day.enqueueOp(OutboxOp.EditTask(taskId, patch, System.currentTimeMillis()))
            } catch (_: Exception) {
                // best effort
            }
            when (syncOutbox()) {
                SyncOutcome.Unauthorized -> session.clear()
                SyncOutcome.WaitingForNetwork -> Unit
                SyncOutcome.Drained -> pullDay(hasCache = true)
            }
        }
    }

    private suspend fun pullHabits() {
        val repo = habits ?: return
        when (syncOutbox()) {
            SyncOutcome.Unauthorized -> {
                session.clear()
                return
            }
            SyncOutcome.WaitingForNetwork -> {
                _habitsState.value = _habitsState.value.copy(isOffline = true, loaded = true)
                return
            }
            SyncOutcome.Drained -> Unit
        }
        try {
            val response = repo.today()
            showHabits(response, isOffline = false)
        } catch (_: UnauthorizedException) {
            session.clear()
        } catch (_: NetworkException) {
            _habitsState.value = habitsAfterFailedPull(_habitsState.value, network = true)
        } catch (e: Exception) {
            // Keep last good habits; the outbox already drained.
            if (e is CancellationException) throw e
            _habitsState.value = habitsAfterFailedPull(_habitsState.value, network = false)
        }
    }

    /** Paints the last good habits before the network answers. */
    private suspend fun showCachedHabits() {
        if (_habitsState.value.loaded) return
        val cached = day.loadHabits() ?: return
        val all = cached.habits.ifEmpty { cached.grouped.all() }
        _habitsState.value = HabitsUiState(
            habits = all,
            done = all.count(HabitToday::doneToday),
            total = all.size,
            loaded = true,
        )
    }

    private suspend fun showHabits(response: HabitsTodayResponse, isOffline: Boolean) {
        day.saveHabits(response)
        val all = response.habits.ifEmpty { response.grouped.all() }
        _habitsState.value = HabitsUiState(
            habits = all,
            done = all.count(HabitToday::doneToday),
            total = all.size,
            isOffline = isOffline,
            loaded = true,
        )
    }

    private suspend fun pullDay(hasCache: Boolean) {
        try {
            val response = tasks.today()
            day.saveDay(response)
            show(response, isOffline = false)
        } catch (_: UnauthorizedException) {
            session.clear()
            return
        } catch (_: NetworkException) {
            val cached = day.loadDay()
            if (cached != null) show(cached, isOffline = true)
            else if (!hasCache) _state.value = HoyUiState.Offline
        } catch (e: Exception) {
            if (e is CancellationException) throw e
            val cached = day.loadDay()
            if (cached != null) show(cached, isOffline = false)
            else _state.value = HoyUiState.Offline
        }
        // Habits load on their own: a failed day pull must not leave them loading (ODD 051 S1).
        pullHabits()
        loadRituals()
    }

    private fun show(response: TodayResponse, isOffline: Boolean) {
        val merged = dayWithPendingCreates(response, pendingCreates, LocalDate.now())
        val sections = sectionToday(merged)
        val all = sections.flatMap { it.tasks }
        val capacity = calculateDayCapacity(all, availableMinutes)
        val overdueTasks = merged.overdue.filter { !it.isDone }
        _state.value =
            HoyUiState.Content(
                sections = sections,
                done = all.count(TodayTask::isDone),
                total = all.size,
                isOffline = isOffline,
                capacity = capacity,
                overdueTasks = overdueTasks,
            )
    }

    /** One-tap triage of a single overdue task (ODD 051 S10). */
    fun triageOverdueTask(taskId: String, target: TriageTarget) {
        viewModelScope.launch {
            try {
                val todayStr = LocalDate.now().toString()
                val tomorrowStr = LocalDate.now().plusDays(1).toString()
                val patch = triageTask(taskId, target, todayStr, tomorrowStr)
                tasks.updateTask(
                    taskId,
                    mapOf(
                        "scheduledDate" to patch.scheduledDate,
                        "dueDate" to patch.dueDate,
                    ),
                )
                _events.send(Snack(R.string.overdue_triaged))
                pullDay(hasCache = true)
            } catch (_: Exception) {
                _events.send(Snack(R.string.auth_error_network))
            }
        }
    }

    /** Batch triage: move all active overdue tasks to tomorrow (ODD 051 S10). */
    fun triageAllOverdueToTomorrow() {
        val content = _state.value as? HoyUiState.Content ?: return
        val overdue = content.overdueTasks
        if (overdue.isEmpty()) return

        viewModelScope.launch {
            try {
                val tomorrowStr = LocalDate.now().plusDays(1).toString()
                val patches = batchTriageToTomorrow(overdue, tomorrowStr)
                for (patch in patches) {
                    tasks.updateTask(
                        patch.taskId,
                        mapOf(
                            "scheduledDate" to patch.scheduledDate,
                            "dueDate" to patch.dueDate,
                        ),
                    )
                }
                _events.send(Snack(R.string.overdue_all_triaged))
                pullDay(hasCache = true)
            } catch (_: Exception) {
                _events.send(Snack(R.string.auth_error_network))
            }
        }
    }

    /** Opens Replan sheet and fetches proposed day-plan (ODD 051 S10). */
    fun openReplan() {
        _replanOpen.value = true
        _replanLoading.value = true
        viewModelScope.launch {
            try {
                val plan = tasks.getDayPlan()
                _replanPlan.value = plan
            } catch (_: Exception) {
                _replanPlan.value = null
            } finally {
                _replanLoading.value = false
            }
        }
    }

    fun closeReplan() {
        _replanOpen.value = false
        _replanPlan.value = null
    }

    fun applyReplan() {
        val plan = _replanPlan.value ?: return
        viewModelScope.launch {
            try {
                tasks.applyDayPlan(plan.proposalId)
                _events.send(Snack(R.string.replan_applied))
                closeReplan()
                pullDay(hasCache = true)
            } catch (_: Exception) {
                _events.send(Snack(R.string.auth_error_network))
            }
        }
    }

    fun dismissReplan() {
        val plan = _replanPlan.value ?: return
        viewModelScope.launch {
            try {
                tasks.dismissDayPlan(plan.proposalId)
                closeReplan()
            } catch (_: Exception) {
                closeReplan()
            }
        }
    }

    private suspend fun loadRituals() {
        try {
            val streak = ritualRepo.getStreak()
            _ritualStreak.value = streak

            val hour = java.time.LocalTime.now().hour
            val morning = ritualRepo.getMorning()
            _morningRitualView.value = morning

            val morningStatus = morning.ritual?.morningStatus ?: "PENDING"
            val eveningStatus = morning.ritual?.eveningStatus ?: "PENDING"
            _activeRitualPhase.value = activeRitualPhase(morningStatus, eveningStatus, hour)

            if (_activeRitualPhase.value == RitualPhase.EVENING) {
                _eveningRitualView.value = ritualRepo.getEvening()
            }
        } catch (_: Exception) {
            // Calm fallback: keeps last state without blocking the day view
        }
    }

    fun openRitual(phase: RitualPhase) {
        _ritualSheetOpen.value = phase
        if (phase == RitualPhase.MORNING && _morningRitualView.value == null) {
            _ritualLoading.value = true
            viewModelScope.launch {
                try {
                    _morningRitualView.value = ritualRepo.getMorning()
                } finally {
                    _ritualLoading.value = false
                }
            }
        } else if (phase == RitualPhase.EVENING && _eveningRitualView.value == null) {
            _ritualLoading.value = true
            viewModelScope.launch {
                try {
                    _eveningRitualView.value = ritualRepo.getEvening()
                } finally {
                    _ritualLoading.value = false
                }
            }
        }
    }

    fun closeRitual() {
        _ritualSheetOpen.value = RitualPhase.NONE
    }

    fun skipCurrentRitual() {
        val phase = _activeRitualPhase.value
        viewModelScope.launch {
            try {
                if (phase == RitualPhase.MORNING) {
                    ritualRepo.skipMorning()
                } else if (phase == RitualPhase.EVENING) {
                    ritualRepo.skipEvening()
                }
                closeRitual()
                loadRituals()
            } catch (_: Exception) {
                closeRitual()
            }
        }
    }

    fun completeMorningRitual(top3: List<String>, acceptTimebox: Boolean) {
        viewModelScope.launch {
            try {
                ritualRepo.completeMorning(top3)
                if (acceptTimebox) {
                    ritualRepo.acceptMorningTimebox()
                }
                _events.send(Snack(R.string.ritual_morning_completed))
                closeRitual()
                pullDay(hasCache = true)
            } catch (_: Exception) {
                _events.send(Snack(R.string.auth_error_network))
            }
        }
    }

    fun completeEveningRitual(moves: List<RitualEveningMove>) {
        viewModelScope.launch {
            try {
                ritualRepo.completeEvening(moves)
                _events.send(Snack(R.string.ritual_evening_completed))
                closeRitual()
                pullDay(hasCache = true)
            } catch (_: Exception) {
                _events.send(Snack(R.string.auth_error_network))
            }
        }
    }

    /** Opens the create sheet (F3c). */
    fun openHabitCreate() {
        _habitEdit.value = HabitEditState()
    }

    /** Opens the edit sheet prefilled from the list, stations follow (F3c/F3d). */
    fun openHabitEdit(habit: HabitToday) {
        _habitEdit.value =
            HabitEditState(
                habitId = habit.id,
                name = habit.name,
                timeOfDay = habit.timeOfDay,
                time = habit.preferredTime.orEmpty(),
                count = habit.targetCount.toString(),
            )
        viewModelScope.launch {
            val repo = habits ?: return@launch
            try {
                val full = repo.detail(habit.id)
                val days = full.completions.mapNotNull { it.day }
                val stations = last7Stations(days, java.time.LocalDate.now())
                _habitEdit.value = _habitEdit.value?.copy(stations = stations)
            } catch (_: Exception) {
                // Sheet works without the strip; list state already covers today.
            }
        }
    }

    fun closeHabitEdit() {
        _habitEdit.value = null
    }

    fun updateHabitEdit(edit: (HabitEditState) -> HabitEditState) {
        _habitEdit.value = _habitEdit.value?.let(edit)
    }

    /** Validates locally, then POSTs or PATCHes only the diff (F3c). */
    fun saveHabitEdit() {
        val repo = habits ?: return
        val current = _habitEdit.value ?: return
        if (current.saving) return
        val id = current.habitId
        viewModelScope.launch {
            try {
                if (id == null) {
                    val body =
                        dev.creapolis.ordotodo.habits.buildHabitCreate(
                            current.name,
                            current.timeOfDay,
                            current.time,
                            current.count,
                        ) ?: return@launch
                    _habitEdit.value = current.copy(saving = true)
                    repo.create(body)
                    _events.send(Snack(R.string.habits_created))
                } else {
                    val original = _habitsState.value.habits.firstOrNull { it.id == id } ?: return@launch
                    val patch =
                        dev.creapolis.ordotodo.habits.buildHabitPatch(
                            original,
                            current.name,
                            current.timeOfDay,
                            current.time,
                            current.count,
                        ) ?: return@launch
                    _habitEdit.value = current.copy(saving = true)
                    if (patch.isNotEmpty()) repo.update(id, patch)
                    _events.send(Snack(R.string.habits_updated))
                }
                _habitEdit.value = null
                pullHabits()
            } catch (_: UnauthorizedException) {
                session.clear()
                _habitEdit.value = _habitEdit.value?.copy(saving = false)
            } catch (_: NetworkException) {
                _events.send(Snack(R.string.auth_error_network))
                _habitEdit.value = _habitEdit.value?.copy(saving = false)
            } catch (_: ApiException) {
                _events.send(Snack(R.string.auth_error_network))
                _habitEdit.value = _habitEdit.value?.copy(saving = false)
            }
        }
    }

    /** Deletes the habit open in the sheet (F3c). */
    fun deleteHabit() {
        val repo = habits ?: return
        val id = _habitEdit.value?.habitId ?: return
        viewModelScope.launch {
            try {
                repo.remove(id)
                _habitEdit.value = null
                _events.send(Snack(R.string.habits_deleted))
                pullHabits()
            } catch (_: UnauthorizedException) {
                session.clear()
            } catch (_: Exception) {
                _events.send(Snack(R.string.auth_error_network))
            }
        }
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
