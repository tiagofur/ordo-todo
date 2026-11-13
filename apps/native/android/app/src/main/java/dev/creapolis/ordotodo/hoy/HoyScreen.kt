package dev.creapolis.ordotodo.hoy

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MediumTopAppBar
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.material3.SnackbarResult
import androidx.compose.material3.Surface
import androidx.compose.material3.SwipeToDismissBox
import androidx.compose.material3.SwipeToDismissBoxValue
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.material3.rememberSwipeToDismissBoxState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.CustomAccessibilityAction
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.customActions
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import dev.creapolis.ordotodo.R
import dev.creapolis.ordotodo.data.HabitToday
import dev.creapolis.ordotodo.data.NativeProject
import dev.creapolis.ordotodo.data.TodayTask
import dev.creapolis.ordotodo.focus.FocusMiniPlayer
import dev.creapolis.ordotodo.focus.FocusStartSheet
import dev.creapolis.ordotodo.focus.FocusSwitchTaskSheet
import dev.creapolis.ordotodo.focus.FocusViewModel
import dev.creapolis.ordotodo.habits.last7Stations
import dev.creapolis.ordotodo.ritual.EveningRitualSheet
import dev.creapolis.ordotodo.ritual.MorningRitualSheet
import dev.creapolis.ordotodo.ritual.RitualBannerCard
import dev.creapolis.ordotodo.ritual.RitualPhase
import dev.creapolis.ordotodo.ritual.RitualStreak
import dev.creapolis.ordotodo.ui.theme.OrdoNumerals
import dev.creapolis.ordotodo.ui.theme.OrdoSectionColors
import java.time.LocalDate
import java.util.Locale

internal data class AgendaGroup(
    val kind: DaySectionKind,
    val tasks: List<TodayTask>,
    val habits: List<HabitToday>,
)

/**
 * Weaves Today's tasks and habits into the canonical moment sections
 * (`Mañana`, `Tarde`, `Noche`, `Cuando sea`, plus `Vencidas` and `Hechas`)
 * per ODD 050 («la agenda serena») and `apps/native/design/lista-del-dia.html`.
 */
internal fun buildAgendaGroups(
    sections: List<DaySection>,
    habits: List<HabitToday>,
    hasTriageCard: Boolean,
): List<AgendaGroup> {
    val tasksByKind = sections.associate { it.kind to it.tasks }
    val habitsByKind = habits.groupBy { habit ->
        when (habit.timeOfDay) {
            "MORNING" -> DaySectionKind.MORNING
            "AFTERNOON" -> DaySectionKind.AFTERNOON
            "EVENING" -> DaySectionKind.EVENING
            else -> DaySectionKind.ANYTIME
        }
    }
    return DaySectionKind.entries.mapNotNull { kind ->
        if (kind == DaySectionKind.OVERDUE && hasTriageCard) return@mapNotNull null
        val t = tasksByKind[kind].orEmpty()
        val h = habitsByKind[kind].orEmpty()
        if (t.isEmpty() && h.isEmpty()) null else AgendaGroup(kind, t, h)
    }
}

/**
 * Computes the 7-day station booleans (oldest left, today right) for a [HabitToday].
 * Uses explicit completion dates when multi-day history is present, falling back to
 * [HabitToday.currentStreak] + [HabitToday.doneToday] for the compact `/habits/today` payload.
 */
internal fun resolveHabitStations(habit: HabitToday, today: LocalDate = LocalDate.now()): List<Boolean> {
    val dates = habit.completions.mapNotNull { it.completedDate ?: it.completedAt }
    val distinctDays = dates.map { it.take(10) }.distinct()
    if (distinctDays.size > 1) {
        return last7Stations(dates, today)
    }
    val streak = habit.currentStreak.coerceAtLeast(0)
    val done = habit.doneToday
    return List(7) { index ->
        if (index == 6) {
            done
        } else {
            val daysAgo = 6 - index
            val pastStreak = if (done) (streak - 1).coerceAtLeast(0) else streak
            daysAgo <= pastStreak
        }
    }
}

/**
 * Lista del Día — «la agenda serena» (ODD 050 & ODD 051 S20).
 * Grouped sectional containers with woven habits, 7-station emerald streak lines,
 * time-block rows with blue calendar bar, and bottom-anchored `inverseSurface` FocusMiniPlayer.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HoyScreen(viewModel: HoyViewModel, focusViewModel: FocusViewModel) {
    val state by viewModel.state.collectAsState()
    val snackbar = remember { SnackbarHostState() }
    val undoLabel = stringResource(R.string.actions_undo)
    val doneText = stringResource(R.string.today_marked_done)
    val pendingText = stringResource(R.string.today_marked_pending)
    val createdText = stringResource(R.string.today_task_created)
    val deletedText = stringResource(R.string.today_task_deleted)
    val restoredText = stringResource(R.string.today_task_restored)
    val rescheduledTomorrowText = stringResource(R.string.today_rescheduled_tomorrow)
    val savedOfflineText = stringResource(R.string.today_saved_offline)
    val pendingSyncText = stringResource(R.string.today_pending_sync)
    val updatedText = stringResource(R.string.detail_updated)
    val errorText = stringResource(R.string.auth_error_network)
    val addLabel = stringResource(R.string.actions_add_task)
    // Saveable: rotation must neither reopen a phantom sheet (the request flow
    // is one-shot and already consumed) nor drop an open one with typed text.
    var showSheet by rememberSaveable { mutableStateOf(false) }
    var capturePrefill by rememberSaveable { mutableStateOf("") }
    val creating by viewModel.creating.collectAsState()
    val enhancing by viewModel.enhancing.collectAsState()
    val enhanced by viewModel.enhanced.collectAsState()
    val projects by viewModel.projects.collectAsState()
    val detail by viewModel.detail.collectAsState()
    val captureRequest by viewModel.captureRequest.collectAsState()
    val focusRequest by viewModel.focusRequest.collectAsState()
    val focusState by focusViewModel.focus.collectAsState()
    val focusTick by focusViewModel.tick.collectAsState()
    val focusStarting by focusViewModel.starting.collectAsState()
    val focusConfig by focusViewModel.config.collectAsState()
    val todayStats by focusViewModel.todayStats.collectAsState()
    var focusSheet by remember { mutableStateOf<Pair<String, String>?>(null) }
    var showSwitchTaskSheet by remember { mutableStateOf(false) }
    val ctx = LocalContext.current
    val notifPermission =
        rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) {
        }
    val habitDoneText = stringResource(R.string.habits_done)
    val habitUndoneText = stringResource(R.string.habits_undone)
    val habitCreatedText = stringResource(R.string.habits_created)
    val habitUpdatedText = stringResource(R.string.habits_updated)
    val habitDeletedText = stringResource(R.string.habits_deleted)
    val habitsState by viewModel.habitsState.collectAsState()
    val refreshing by viewModel.refreshing.collectAsState()
    val replanOpen by viewModel.replanOpen.collectAsState()
    val replanPlan by viewModel.replanPlan.collectAsState()
    val replanLoading by viewModel.replanLoading.collectAsState()
    val ritualStreak by viewModel.ritualStreak.collectAsState()
    val activeRitualPhase by viewModel.activeRitualPhase.collectAsState()
    val morningRitualView by viewModel.morningRitualView.collectAsState()
    val eveningRitualView by viewModel.eveningRitualView.collectAsState()
    val ritualSheetOpen by viewModel.ritualSheetOpen.collectAsState()
    val ritualLoading by viewModel.ritualLoading.collectAsState()
    val focusCompletedText = stringResource(R.string.timer_completed)
    val focusStoppedText = stringResource(R.string.timer_stopped)

    LaunchedEffect(showSheet) {
        if (showSheet) viewModel.ensureProjects()
    }
    LaunchedEffect(captureRequest) {
        captureRequest?.let { request ->
            capturePrefill = request.prefill
            showSheet = true
            viewModel.consumeCaptureRequest()
        }
    }
    LaunchedEffect(focusRequest) {
        focusRequest?.let { req ->
            focusSheet = req
            viewModel.consumeFocusRequest()
        }
    }
    LaunchedEffect(focusViewModel) {
        focusViewModel.events.collect { snack ->
            val text =
                when (snack.message) {
                    R.string.timer_completed -> focusCompletedText
                    R.string.timer_stopped -> focusStoppedText
                    else -> errorText
                }
            snackbar.showSnackbar(message = text)
        }
    }
    LaunchedEffect(viewModel) {
        viewModel.events.collect { snack ->
            val text =
                when (snack.message) {
                    R.string.today_marked_pending -> pendingText
                    R.string.today_task_created -> createdText
                    R.string.today_task_deleted -> deletedText
                    R.string.today_task_restored -> restoredText
                    R.string.today_rescheduled_tomorrow -> rescheduledTomorrowText
                    R.string.today_saved_offline -> savedOfflineText
                    R.string.today_pending_sync -> pendingSyncText
                    R.string.detail_updated -> updatedText
                    R.string.habits_done -> habitDoneText
                    R.string.habits_undone -> habitUndoneText
                    R.string.habits_created -> habitCreatedText
                    R.string.habits_updated -> habitUpdatedText
                    R.string.habits_deleted -> habitDeletedText
                    R.string.auth_error_network -> errorText
                    else -> doneText
                }
            if (snack.message == R.string.today_task_created ||
                snack.message == R.string.today_saved_offline
            ) {
                showSheet = false
            }
            if (snack.message == R.string.detail_updated || snack.message == R.string.today_task_deleted) {
                viewModel.closeDetail()
            }
            val hasUndo = snack.undoTaskId != null || snack.undoDeleteTaskId != null || snack.undoReschedule != null
            val result =
                snackbar.showSnackbar(
                    message = text,
                    actionLabel = if (hasUndo) undoLabel else null,
                )
            if (result == SnackbarResult.ActionPerformed) {
                if (snack.undoDeleteTaskId != null) {
                    viewModel.restoreTask(snack.undoDeleteTaskId)
                } else if (snack.undoReschedule != null) {
                    viewModel.undoReschedule(snack.undoReschedule.first, snack.undoReschedule.second)
                } else if (snack.undoTaskId != null) {
                    viewModel.toggle(snack.undoTaskId)
                }
            }
        }
    }

    val scrollBehavior = TopAppBarDefaults.exitUntilCollapsedScrollBehavior()
    val systemLocale = LocalContext.current.resources.configuration.locales.get(0)
    val dateSubtitle = remember(systemLocale) {
        formatDaySubtitle(LocalDate.now(), systemLocale)
    }

    Scaffold(
        modifier = Modifier.nestedScroll(scrollBehavior.nestedScrollConnection),
        containerColor = MaterialTheme.colorScheme.surfaceContainerLow,
        snackbarHost = { SnackbarHost(snackbar) },
        topBar = {
            MediumTopAppBar(
                title = {
                    Column {
                        Text(
                            text = stringResource(R.string.tabs_today),
                            style = MaterialTheme.typography.headlineSmall,
                        )
                        Text(
                            text = dateSubtitle,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                },
                actions = {
                    (state as? HoyUiState.Content)?.let { content ->
                        DayRing(done = content.done, total = content.total)
                        Spacer(Modifier.width(12.dp))
                    }
                },
                scrollBehavior = scrollBehavior,
            )
        },
        floatingActionButton = {
            if (state is HoyUiState.Content && detail == null && focusState == null) {
                FloatingActionButton(
                    onClick = { showSheet = true },
                ) {
                    Icon(Icons.Default.Add, contentDescription = addLabel)
                }
            }
        },
    ) { inner ->
        Box(Modifier.fillMaxSize().padding(inner)) {
            when (val current = state) {
                is HoyUiState.Loading -> LoadingDay()
                is HoyUiState.Offline -> OfflineDay(onRetry = viewModel::refresh)
                is HoyUiState.Content -> {
                    PullToRefreshBox(
                        isRefreshing = refreshing,
                        onRefresh = viewModel::pullToRefresh,
                        modifier = Modifier.fillMaxSize(),
                    ) {
                        DayList(
                            content = current,
                            habits = habitsState.habits,
                            habitsOffline = habitsState.isOffline,
                            projects = projects,
                            focusBarVisible = focusState != null,
                            onAddClick = { showSheet = true },
                            onToggle = viewModel::toggle,
                            onOpen = viewModel::openDetail,
                            onRescheduleTomorrow = viewModel::rescheduleTaskToTomorrow,
                            onChangePriority = viewModel::updateTaskPriority,
                            onMoveProject = viewModel::moveTaskToProject,
                            onDelete = viewModel::deleteTaskWithUndo,
                            onToggleHabit = viewModel::toggleHabit,
                            onOpenHabit = viewModel::openHabitEdit,
                            onTriageTask = viewModel::triageOverdueTask,
                            onTriageAllToTomorrow = viewModel::triageAllOverdueToTomorrow,
                            onReplan = viewModel::openReplan,
                            streak = ritualStreak,
                            activeRitualPhase = activeRitualPhase,
                            onStartRitual = { viewModel.openRitual(activeRitualPhase) },
                            onSkipRitual = viewModel::skipCurrentRitual,
                        )
                    }

                    // Bottom-anchored FocusMiniPlayer right above the NavigationBar (.mini in lista-del-dia.html)
                    val running = focusState
                    if (running != null) {
                        Box(
                            modifier = Modifier
                                .align(Alignment.BottomCenter)
                                .fillMaxWidth(),
                        ) {
                            FocusMiniPlayer(
                                state = running,
                                nowEpoch = focusTick,
                                todayStats = todayStats,
                                onPause = focusViewModel::pause,
                                onResume = focusViewModel::resume,
                                onSkip = focusViewModel::skip,
                                onSwitchTask = { showSwitchTaskSheet = true },
                                onStop = { focusViewModel.stop(completed = false) },
                            )
                        }
                    }
                }
            }
        }

        val sheet = focusSheet
        if (sheet != null) {
            FocusStartSheet(
                taskTitle = sheet.second,
                starting = focusStarting,
                canExact = focusViewModel.canScheduleExact(),
                config = focusConfig,
                onStart = { plannedMs, mode ->
                    if (Build.VERSION.SDK_INT >= 33 &&
                        ContextCompat.checkSelfPermission(
                            ctx,
                            Manifest.permission.POST_NOTIFICATIONS,
                        ) != PackageManager.PERMISSION_GRANTED
                    ) {
                        notifPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
                    }
                    focusViewModel.start(sheet.first, sheet.second, plannedMs, mode)
                    focusSheet = null
                },
                onDismiss = { if (!focusStarting) focusSheet = null },
            )
        }
        if (showSwitchTaskSheet && state is HoyUiState.Content) {
            val pendingTasks =
                (state as HoyUiState.Content).sections
                    .flatMap { it.tasks }
                    .filter { !it.isDone }
                    .map { dev.creapolis.ordotodo.focus.FocusTaskItem(it.id, it.title) }
            FocusSwitchTaskSheet(
                tasks = pendingTasks,
                onSelectTask = { taskId, taskTitle ->
                    focusViewModel.switchTask(taskId, taskTitle)
                    showSwitchTaskSheet = false
                },
                onDismiss = { showSwitchTaskSheet = false },
            )
        }
        if (showSheet) {
            CaptureSheet(
                creating = creating,
                projects = projects,
                initialText = capturePrefill,
                enhancing = enhancing,
                enhanced = enhanced,
                onEnhance = viewModel::enhanceCapture,
                onConsumeEnhanced = viewModel::consumeEnhanced,
                onSave = { viewModel.createTask(it) },
                onDismiss = {
                    if (!creating) {
                        showSheet = false
                        capturePrefill = ""
                    }
                },
            )
        }
        if (replanOpen) {
            DayPlanSheet(
                plan = replanPlan,
                loading = replanLoading,
                onApply = viewModel::applyReplan,
                onDismiss = viewModel::dismissReplan,
                onClose = viewModel::closeReplan,
            )
        }
        if (ritualSheetOpen == RitualPhase.MORNING) {
            MorningRitualSheet(
                todayTasks = (state as? HoyUiState.Content)?.sections?.flatMap { it.tasks }.orEmpty(),
                suggestedTop3 = morningRitualView?.suggestedTop3.orEmpty(),
                loading = ritualLoading,
                onComplete = viewModel::completeMorningRitual,
                onSkip = viewModel::skipCurrentRitual,
                onClose = viewModel::closeRitual,
            )
        } else if (ritualSheetOpen == RitualPhase.EVENING) {
            EveningRitualSheet(
                eveningView = eveningRitualView,
                loading = ritualLoading,
                onComplete = viewModel::completeEveningRitual,
                onSkip = viewModel::skipCurrentRitual,
                onClose = viewModel::closeRitual,
            )
        }
    }
}

@Composable
private fun LoadingDay() {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        CircularProgressIndicator()
    }
}

@Composable
private fun OfflineDay(onRetry: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = stringResource(R.string.auth_error_network),
            style = MaterialTheme.typography.bodyLarge,
        )
        Spacer(Modifier.height(16.dp))
        Button(onClick = onRetry) {
            Text(stringResource(R.string.today_empty_retry))
        }
    }
}

@Composable
private fun DayList(
    content: HoyUiState.Content,
    habits: List<HabitToday>,
    habitsOffline: Boolean,
    projects: List<NativeProject> = emptyList(),
    focusBarVisible: Boolean = false,
    onAddClick: () -> Unit = {},
    onToggle: (String) -> Unit,
    onOpen: (TodayTask) -> Unit,
    onRescheduleTomorrow: (TodayTask) -> Unit = {},
    onChangePriority: (String, String) -> Unit = { _, _ -> },
    onMoveProject: (String, String?) -> Unit = { _, _ -> },
    onDelete: (String) -> Unit = {},
    onToggleHabit: (String) -> Unit,
    onOpenHabit: (HabitToday) -> Unit,
    onTriageTask: (String, TriageTarget) -> Unit = { _, _ -> },
    onTriageAllToTomorrow: () -> Unit = {},
    onReplan: () -> Unit = {},
    streak: RitualStreak = RitualStreak(),
    activeRitualPhase: RitualPhase = RitualPhase.NONE,
    onStartRitual: () -> Unit = {},
    onSkipRitual: () -> Unit = {},
) {
    val hasTriageCard = content.overdueTasks.isNotEmpty()
    val agendaGroups =
        remember(content.sections, habits, hasTriageCard) {
            buildAgendaGroups(content.sections, habits, hasTriageCard)
        }

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 8.dp, bottom = if (focusBarVisible) 96.dp else 88.dp),
    ) {
        // Only show ritual banner when an active morning/evening ritual awaits action
        if (activeRitualPhase != RitualPhase.NONE) {
            item(key = "ritual_banner") {
                Box(Modifier.padding(bottom = 8.dp)) {
                    RitualBannerCard(
                        streak = streak,
                        activePhase = activeRitualPhase,
                        onStart = onStartRitual,
                        onSkip = onSkipRitual,
                    )
                }
            }
        }

        if (content.isOffline || habitsOffline) {
            item(key = "offline") {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                ) {
                    Text(
                        text = stringResource(R.string.today_offline),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onErrorContainer,
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                    )
                }
            }
        }

        if (content.overdueTasks.isNotEmpty()) {
            item(key = "overdue_triage") {
                Box(Modifier.padding(bottom = 8.dp)) {
                    OverdueTriageCard(
                        tasks = content.overdueTasks,
                        onTriageTask = onTriageTask,
                        onTriageAllToTomorrow = onTriageAllToTomorrow,
                    )
                }
            }
        }

        // Only surface capacity card when overloaded so normal days stay serene
        if (content.capacity.isOverloaded) {
            item(key = "day_capacity") {
                Box(Modifier.padding(bottom = 8.dp)) {
                    DayCapacityCard(
                        capacity = content.capacity,
                        onReplan = onReplan,
                    )
                }
            }
        }

        if (agendaGroups.isEmpty()) {
            item(key = "empty_day") {
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = MaterialTheme.colorScheme.surfaceContainerLowest,
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.45f)),
                    modifier = Modifier.fillMaxWidth().padding(top = 16.dp),
                ) {
                    Column(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 36.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        Text(
                            text = stringResource(R.string.today_empty_title),
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold,
                        )
                        Spacer(Modifier.height(4.dp))
                        Text(
                            text = stringResource(R.string.today_empty_body),
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }
        }

        // Grouped sections (.label + .group in lista-del-dia.html)
        for (group in agendaGroups) {
            item(key = "section-${group.kind}") {
                SectionHeader(kind = group.kind, count = group.tasks.size + group.habits.size)
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = MaterialTheme.colorScheme.surfaceContainerLowest,
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.45f)),
                    modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)),
                ) {
                    Column(Modifier.fillMaxWidth()) {
                        var hasEmittedRow = false
                        for (task in group.tasks) {
                            if (hasEmittedRow) {
                                HorizontalDivider(
                                    thickness = 0.75.dp,
                                    color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.35f),
                                )
                            }
                            TaskRow(
                                task = task,
                                onToggle = onToggle,
                                onOpen = onOpen,
                                onRescheduleTomorrow = onRescheduleTomorrow,
                                onChangePriority = onChangePriority,
                                onMoveProject = onMoveProject,
                                onDelete = onDelete,
                                projects = projects,
                                grouped = true,
                            )
                            hasEmittedRow = true
                        }
                        for (habit in group.habits) {
                            if (hasEmittedRow) {
                                HorizontalDivider(
                                    thickness = 0.75.dp,
                                    color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.35f),
                                )
                            }
                            HabitRow(
                                habit = habit,
                                onToggle = onToggleHabit,
                                onOpen = onOpenHabit,
                                grouped = true,
                            )
                            hasEmittedRow = true
                        }
                    }
                }
            }
        }
    }
}

/**
 * 40.dp progress ring with the `done/total` counter centered inside (.ring in lista-del-dia.html).
 */
@Composable
private fun DayRing(done: Int, total: Int) {
    val progress = if (total == 0) 0f else (done.toFloat() / total.toFloat()).coerceIn(0f, 1f)
    val track = MaterialTheme.colorScheme.primaryContainer
    val bar = MaterialTheme.colorScheme.primary
    Box(
        modifier = Modifier.size(40.dp),
        contentAlignment = Alignment.Center,
    ) {
        Canvas(Modifier.fillMaxSize()) {
            val strokeW = 4.dp.toPx()
            val inset = strokeW / 2f
            val arcSize = Size(size.width - strokeW, size.height - strokeW)
            drawArc(
                color = track,
                startAngle = 0f,
                sweepAngle = 360f,
                useCenter = false,
                topLeft = Offset(inset, inset),
                size = arcSize,
                style = Stroke(width = strokeW, cap = StrokeCap.Round),
            )
            if (progress > 0f) {
                drawArc(
                    color = bar,
                    startAngle = -90f,
                    sweepAngle = 360f * progress,
                    useCenter = false,
                    topLeft = Offset(inset, inset),
                    size = arcSize,
                    style = Stroke(width = strokeW, cap = StrokeCap.Round),
                )
            }
        }
        Text(
            text = "$done/$total",
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary,
        )
    }
}

@Composable
private fun SectionHeader(kind: DaySectionKind, count: Int) {
    val name =
        when (kind) {
            DaySectionKind.OVERDUE -> stringResource(R.string.today_sections_overdue)
            DaySectionKind.MORNING -> stringResource(R.string.today_sections_morning)
            DaySectionKind.AFTERNOON -> stringResource(R.string.today_sections_afternoon)
            DaySectionKind.EVENING -> stringResource(R.string.today_sections_evening)
            DaySectionKind.ANYTIME -> stringResource(R.string.today_sections_anytime)
            DaySectionKind.DONE -> stringResource(R.string.today_sections_done, count)
        }
    Text(
        text = name.uppercase(Locale.getDefault()),
        fontSize = 12.sp,
        fontWeight = FontWeight.SemiBold,
        letterSpacing = 0.6.sp,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        modifier = Modifier.padding(start = 8.dp, end = 8.dp, top = 16.dp, bottom = 6.dp),
    )
}

@Composable
internal fun HabitsHeader(count: Int, offline: Boolean) {
    Column(Modifier.padding(top = 12.dp, bottom = 4.dp)) {
        Text(
            text = stringResource(R.string.habits_title).uppercase(Locale.getDefault()),
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            letterSpacing = 0.6.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        if (offline) {
            Text(
                text = stringResource(R.string.habits_offline),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

/**
 * Habit row with emerald check control and the signature 7-station streak line (.ck.hab + .line in lista-del-dia.html).
 */
@Composable
internal fun HabitRow(
    habit: HabitToday,
    onToggle: (String) -> Unit,
    onOpen: (HabitToday) -> Unit = {},
    grouped: Boolean = false,
) {
    val scheme = MaterialTheme.colorScheme
    val haptics = LocalHapticFeedback.current
    val done = habit.doneToday
    val streakCount = if (habit.currentStreak > 0) habit.currentStreak else if (done) 1 else 0
    val streakLabel = pluralStringResource(R.plurals.habits_streak, streakCount, streakCount)
    val stations = remember(habit) { resolveHabitStations(habit) }

    val rowContent: @Composable () -> Unit = {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 52.dp)
                .padding(horizontal = 14.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            HabitCheckDot(done = done, onToggle = {
                haptics.performHapticFeedback(HapticFeedbackType.LongPress)
                onToggle(habit.id)
            })
            Spacer(Modifier.width(12.dp))
            Column(
                Modifier
                    .weight(1f)
                    .clickable(
                        onClickLabel = stringResource(R.string.habits_edit_title),
                        onClick = {
                            haptics.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                            onOpen(habit)
                        },
                    ),
                verticalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                Text(
                    text = habit.name,
                    fontSize = 15.sp,
                    color = if (done) scheme.onSurfaceVariant else scheme.onSurface,
                    textDecoration = if (done) TextDecoration.LineThrough else null,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                HabitStreakLine(stations = stations, streakLabel = streakLabel)
            }
            if (habit.preferredTime != null) {
                Spacer(Modifier.width(8.dp))
                Text(
                    text = habit.preferredTime,
                    style = OrdoNumerals.Inline,
                    color = scheme.onSurfaceVariant,
                )
            }
        }
    }

    if (grouped) {
        rowContent()
    } else {
        Surface(
            shape = RoundedCornerShape(14.dp),
            color = scheme.surfaceContainerLowest,
            border = BorderStroke(1.dp, scheme.outlineVariant.copy(alpha = 0.45f)),
            modifier = Modifier.fillMaxWidth(),
        ) {
            rowContent()
        }
    }
}

/**
 * Signature 7-station emerald streak line (.line in lista-del-dia.html):
 * 7 circular stations connected by horizontal segments, followed by the emerald streak count.
 */
@Composable
private fun HabitStreakLine(
    stations: List<Boolean>,
    streakLabel: String,
) {
    val emerald = OrdoSectionColors.Habits
    val emeraldText = Color(0xFF059669)
    val segmentOff = emerald.copy(alpha = 0.22f)
    val surfaceBg = MaterialTheme.colorScheme.surfaceContainerLowest

    Row(verticalAlignment = Alignment.CenterVertically) {
        Canvas(
            modifier = Modifier
                .width((stations.size * 10 + (stations.size - 1) * 14).dp)
                .height(10.dp),
        ) {
            val stationDiameter = 10.dp.toPx()
            val stationRadius = stationDiameter / 2f
            val segWidth = 14.dp.toPx()
            val segHeight = 2.5.dp.toPx()
            val borderStroke = 2.dp.toPx()
            val cy = size.height / 2f

            // Draw connecting segments first
            for (i in 0 until stations.size - 1) {
                val segOn = stations[i] && stations[i + 1]
                val xStart = i * (stationDiameter + segWidth) + stationDiameter
                drawRect(
                    color = if (segOn) emerald else segmentOff,
                    topLeft = Offset(xStart, cy - segHeight / 2f),
                    size = Size(segWidth, segHeight),
                )
            }

            // Draw stations
            for (i in stations.indices) {
                val cx = i * (stationDiameter + segWidth) + stationRadius
                val isOn = stations[i]
                if (isOn) {
                    drawCircle(
                        color = emerald,
                        radius = stationRadius,
                        center = Offset(cx, cy),
                    )
                } else {
                    drawCircle(
                        color = surfaceBg,
                        radius = stationRadius,
                        center = Offset(cx, cy),
                    )
                    drawCircle(
                        color = emerald,
                        radius = stationRadius - borderStroke / 2f,
                        center = Offset(cx, cy),
                        style = Stroke(width = borderStroke),
                    )
                }
            }
        }
        Spacer(Modifier.width(8.dp))
        Text(
            text = streakLabel,
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            color = emeraldText,
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalFoundationApi::class)
@Composable
internal fun TaskRow(
    task: TodayTask,
    onToggle: (String) -> Unit,
    onOpen: (TodayTask) -> Unit,
    onRescheduleTomorrow: (TodayTask) -> Unit = {},
    onChangePriority: (String, String) -> Unit = { _, _ -> },
    onMoveProject: (String, String?) -> Unit = { _, _ -> },
    onDelete: (String) -> Unit = {},
    projects: List<NativeProject> = emptyList(),
    grouped: Boolean = false,
) {
    val scheme = MaterialTheme.colorScheme
    val haptics = LocalHapticFeedback.current
    val isDark = isSystemInDarkTheme()
    val openLabel = stringResource(R.string.detail_open)
    val completeLabel = stringResource(if (task.isDone) R.string.actions_undo else R.string.actions_complete)
    val tomorrowLabel = stringResource(R.string.actions_move_to_tomorrow)
    val moreOptionsLabel = stringResource(R.string.actions_more_options)
    val deleteLabel = stringResource(R.string.actions_delete)

    var showMenu by remember { mutableStateOf(false) }
    var showPriorityDialog by remember { mutableStateOf(false) }
    var showProjectDialog by remember { mutableStateOf(false) }

    @Suppress("DEPRECATION")
    val dismissState =
        rememberSwipeToDismissBoxState(
            confirmValueChange = { value ->
                when (value) {
                    SwipeToDismissBoxValue.StartToEnd -> {
                        haptics.performHapticFeedback(HapticFeedbackType.LongPress)
                        onToggle(task.id)
                        false
                    }
                    SwipeToDismissBoxValue.EndToStart -> {
                        haptics.performHapticFeedback(HapticFeedbackType.LongPress)
                        onRescheduleTomorrow(task)
                        false
                    }
                    SwipeToDismissBoxValue.Settled -> false
                }
            },
        )

    SwipeToDismissBox(
        state = dismissState,
        backgroundContent = {
            val direction = dismissState.dismissDirection
            val color by animateColorAsState(
                targetValue =
                    when (dismissState.targetValue) {
                        SwipeToDismissBoxValue.StartToEnd -> MaterialTheme.colorScheme.primaryContainer
                        SwipeToDismissBoxValue.EndToStart -> MaterialTheme.colorScheme.tertiaryContainer
                        SwipeToDismissBoxValue.Settled -> Color.Transparent
                    },
                label = "swipeBg",
            )
            val alignment =
                when (direction) {
                    SwipeToDismissBoxValue.StartToEnd -> Alignment.CenterStart
                    SwipeToDismissBoxValue.EndToStart -> Alignment.CenterEnd
                    else -> Alignment.Center
                }
            val text =
                when (direction) {
                    SwipeToDismissBoxValue.StartToEnd -> completeLabel
                    SwipeToDismissBoxValue.EndToStart -> tomorrowLabel
                    else -> ""
                }
            val textColor =
                when (direction) {
                    SwipeToDismissBoxValue.StartToEnd -> MaterialTheme.colorScheme.onPrimaryContainer
                    SwipeToDismissBoxValue.EndToStart -> MaterialTheme.colorScheme.onTertiaryContainer
                    else -> Color.Transparent
                }
            Box(
                modifier =
                    Modifier
                        .fillMaxSize()
                        .background(
                            color,
                            shape = if (grouped) RoundedCornerShape(0.dp) else RoundedCornerShape(14.dp),
                        )
                        .padding(horizontal = 20.dp),
                contentAlignment = alignment,
            ) {
                if (text.isNotEmpty()) {
                    Text(
                        text = text,
                        style = MaterialTheme.typography.labelLarge,
                        color = textColor,
                    )
                }
            }
        },
        content = {
            // D7 Time-block styling (.block in lista-del-dia.html) when task has scheduledTime + estimate
            val isTimeBlock = task.scheduledTime != null && (task.estimatedMinutes ?: 0) > 0 && !task.isDone
            val blockBg = if (isDark) Color(0xFF3B82F6).copy(alpha = 0.16f) else Color(0xFFEFF6FF)
            val blockText = if (isDark) Color(0xFF93C5FD) else Color(0xFF1E3A8A)
            val blockAccent = Color(0xFF3B82F6)

            val rowBg = when {
                isTimeBlock -> blockBg
                else -> scheme.surfaceContainerLowest
            }

            val innerRow: @Composable () -> Unit = {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(rowBg)
                        .semantics {
                            customActions =
                                listOf(
                                    CustomAccessibilityAction(label = completeLabel) {
                                        onToggle(task.id)
                                        true
                                    },
                                    CustomAccessibilityAction(label = tomorrowLabel) {
                                        onRescheduleTomorrow(task)
                                        true
                                    },
                                    CustomAccessibilityAction(label = moreOptionsLabel) {
                                        showMenu = true
                                        true
                                    },
                                    CustomAccessibilityAction(label = deleteLabel) {
                                        onDelete(task.id)
                                        true
                                    },
                                )
                        },
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(IntrinsicSize.Min)
                            .heightIn(min = 50.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        if (isTimeBlock) {
                            Box(
                                modifier = Modifier
                                    .width(4.dp)
                                    .fillMaxHeight()
                                    .background(blockAccent),
                            )
                        }
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(
                                    start = if (isTimeBlock) 10.dp else 14.dp,
                                    end = 14.dp,
                                    top = 10.dp,
                                    bottom = 10.dp,
                                ),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            CheckDot(done = task.isDone, onToggle = {
                                haptics.performHapticFeedback(HapticFeedbackType.LongPress)
                                onToggle(task.id)
                            })
                            Spacer(Modifier.width(12.dp))
                            Column(
                                Modifier
                                    .weight(1f)
                                    .combinedClickable(
                                        role = Role.Button,
                                        onClickLabel = openLabel,
                                        onClick = {
                                            haptics.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                            onOpen(task)
                                        },
                                        onLongClick = {
                                            haptics.performHapticFeedback(HapticFeedbackType.LongPress)
                                            showMenu = true
                                        },
                                    ),
                                verticalArrangement = Arrangement.spacedBy(2.dp),
                            ) {
                                Text(
                                    text = task.title,
                                    fontSize = 15.sp,
                                    fontWeight = if (isTimeBlock) FontWeight.Medium else FontWeight.Normal,
                                    maxLines = 2,
                                    overflow = TextOverflow.Ellipsis,
                                    textDecoration = if (task.isDone) TextDecoration.LineThrough else null,
                                    color = when {
                                        task.isDone -> scheme.onSurfaceVariant.copy(alpha = 0.6f)
                                        isTimeBlock -> blockText
                                        else -> scheme.onSurface
                                    },
                                )
                                TaskMeta(task)
                            }
                            if (task.scheduledTime != null) {
                                val timeLabel = formatTimeBlockRange(task.scheduledTime, task.estimatedMinutes)
                                Spacer(Modifier.width(10.dp))
                                Text(
                                    text = timeLabel,
                                    fontSize = 13.sp,
                                    color = if (isTimeBlock) blockAccent else scheme.onSurfaceVariant,
                                    fontWeight = if (isTimeBlock) FontWeight.Medium else FontWeight.Normal,
                                )
                            }
                        }
                    }

                    DropdownMenu(expanded = showMenu, onDismissRequest = { showMenu = false }) {
                        DropdownMenuItem(
                            text = { Text(tomorrowLabel) },
                            onClick = {
                                showMenu = false
                                onRescheduleTomorrow(task)
                            },
                        )
                        DropdownMenuItem(
                            text = { Text(stringResource(R.string.actions_change_priority)) },
                            onClick = {
                                showMenu = false
                                showPriorityDialog = true
                            },
                        )
                        DropdownMenuItem(
                            text = { Text(stringResource(R.string.actions_change_project)) },
                            onClick = {
                                showMenu = false
                                showProjectDialog = true
                            },
                        )
                        DropdownMenuItem(
                            text = { Text(deleteLabel, color = MaterialTheme.colorScheme.error) },
                            onClick = {
                                showMenu = false
                                onDelete(task.id)
                            },
                        )
                    }
                }
            }

            if (grouped) {
                innerRow()
            } else {
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = rowBg,
                    border = BorderStroke(1.dp, scheme.outlineVariant.copy(alpha = 0.45f)),
                    modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)),
                ) {
                    innerRow()
                }
            }
        },
    )

    if (showPriorityDialog) {
        AlertDialog(
            onDismissRequest = { showPriorityDialog = false },
            title = { Text(stringResource(R.string.actions_change_priority)) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    listOf("LOW", "MEDIUM", "HIGH", "URGENT").forEach { p ->
                        TextButton(
                            onClick = {
                                onChangePriority(task.id, p)
                                showPriorityDialog = false
                            },
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            val label =
                                when (p) {
                                    "LOW" -> stringResource(R.string.detail_priority_low)
                                    "MEDIUM" -> stringResource(R.string.detail_priority_medium)
                                    "HIGH" -> stringResource(R.string.detail_priority_high)
                                    "URGENT" -> stringResource(R.string.detail_priority_urgent)
                                    else -> p
                                }
                            Text(label)
                        }
                    }
                }
            },
            confirmButton = {},
            dismissButton = {
                TextButton(onClick = { showPriorityDialog = false }) {
                    Text(stringResource(R.string.actions_cancel))
                }
            },
        )
    }

    if (showProjectDialog) {
        AlertDialog(
            onDismissRequest = { showProjectDialog = false },
            title = { Text(stringResource(R.string.actions_change_project)) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    TextButton(
                        onClick = {
                            onMoveProject(task.id, null)
                            showProjectDialog = false
                        },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text(stringResource(R.string.detail_no_project))
                    }
                    projects.forEach { proj ->
                        TextButton(
                            onClick = {
                                onMoveProject(task.id, proj.id)
                                showProjectDialog = false
                            },
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Text(proj.name)
                        }
                    }
                }
            },
            confirmButton = {},
            dismissButton = {
                TextButton(onClick = { showProjectDialog = false }) {
                    Text(stringResource(R.string.actions_cancel))
                }
            },
        )
    }
}

@Composable
private fun TaskMeta(task: TodayTask) {
    val scheme = MaterialTheme.colorScheme
    val bits = mutableListOf<String>()
    task.project?.let { bits.add(it.name) }
    if (task.subTasks.isNotEmpty()) bits.add("${task.doneSubTasks}/${task.subTasks.size}")
    if (task.pendingSync) bits.add(stringResource(R.string.today_pending_sync))
    if (bits.isEmpty()) return
    Row(verticalAlignment = Alignment.CenterVertically) {
        task.project?.color?.let { hex ->
            ProjectDot(hex)
            Spacer(Modifier.width(5.dp))
        } ?: run {
            if (task.project != null) {
                Canvas(Modifier.size(7.dp)) { drawCircle(OrdoSectionColors.Projects) }
                Spacer(Modifier.width(5.dp))
            }
        }
        Text(
            text = bits.joinToString(" · "),
            fontSize = 12.sp,
            color = scheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun ProjectDot(hex: String) {
    val color =
        try {
            Color(android.graphics.Color.parseColor(hex))
        } catch (_: IllegalArgumentException) {
            OrdoSectionColors.Projects
        }
    Canvas(Modifier.size(7.dp)) { drawCircle(color) }
}

/**
 * Task check control (ODD 050: Android speaks M3, so the task row uses the
 * system `Checkbox` — rounded square — while the hand-drawn circle lives
 * only in the shared habit-station signature and on iOS).
 */
@Composable
internal fun CheckDot(done: Boolean, onToggle: () -> Unit) {
    val description =
        stringResource(if (done) R.string.actions_undo else R.string.actions_complete)

    Checkbox(
        checked = done,
        onCheckedChange = { onToggle() },
        modifier = Modifier.semantics { contentDescription = description },
    )
}

/**
 * Crisp 20.dp habit check control in emerald (.ck.hab in lista-del-dia.html).
 */
@Composable
private fun HabitCheckDot(done: Boolean, onToggle: () -> Unit) {
    val emerald = OrdoSectionColors.Habits
    val description =
        stringResource(if (done) R.string.habits_uncheck else R.string.habits_check)

    Box(
        modifier = Modifier
            .size(28.dp)
            .clip(CircleShape)
            .clickable(role = Role.Checkbox, onClickLabel = description, onClick = onToggle),
        contentAlignment = Alignment.Center,
    ) {
        Canvas(Modifier.size(20.dp)) {
            val strokeW = 2.dp.toPx()
            val r = (size.minDimension - strokeW) / 2f
            if (done) {
                drawCircle(color = emerald, radius = size.minDimension / 2f)
                val path = Path().apply {
                    moveTo(size.width * 0.28f, size.height * 0.52f)
                    lineTo(size.width * 0.44f, size.height * 0.68f)
                    lineTo(size.width * 0.74f, size.height * 0.34f)
                }
                drawPath(
                    path = path,
                    color = Color.White,
                    style = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round),
                )
            } else {
                drawCircle(
                    color = emerald,
                    radius = r,
                    style = Stroke(width = strokeW),
                )
            }
        }
    }
}
