package dev.creapolis.ordotodo.hoy

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.SnackbarResult
import androidx.compose.material3.SwipeToDismissBox
import androidx.compose.material3.SwipeToDismissBoxValue
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberSwipeToDismissBoxState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.ContextCompat
import dev.creapolis.ordotodo.focus.FocusMiniPlayer
import dev.creapolis.ordotodo.focus.FocusStartSheet
import dev.creapolis.ordotodo.focus.FocusViewModel
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.CustomAccessibilityAction
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.customActions
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import dev.creapolis.ordotodo.R
import dev.creapolis.ordotodo.data.HabitToday
import dev.creapolis.ordotodo.data.NativeProject
import dev.creapolis.ordotodo.data.TodayTask
import dev.creapolis.ordotodo.ui.theme.OrdoNumerals
import dev.creapolis.ordotodo.ui.theme.OrdoSectionColors
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle
import java.util.Locale

/** The Day list: every section in one scroll, done tasks closing it. Circles toggle (F1b). */
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
    var showSheet by remember { mutableStateOf(false) }
    var capturePrefill by remember { mutableStateOf("") }
    val creating by viewModel.creating.collectAsState()
    val projects by viewModel.projects.collectAsState()
    val detail by viewModel.detail.collectAsState()
    val availableTags by viewModel.availableTags.collectAsState()
    val captureRequest by viewModel.captureRequest.collectAsState()
    val focusState by focusViewModel.focus.collectAsState()
    val focusTick by focusViewModel.tick.collectAsState()
    val focusStarting by focusViewModel.starting.collectAsState()
    var focusSheet by remember { mutableStateOf<Pair<String, String>?>(null) }
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
    Scaffold(
        snackbarHost = { SnackbarHost(snackbar) },
        floatingActionButton = {
            if (state is HoyUiState.Content && detail == null) {
                ExtendedFloatingActionButton(
                    text = { Text(addLabel) },
                    icon = { Text("+") },
                    onClick = { showSheet = true },
                )
            }
        },
    ) { inner ->
        Column(Modifier.fillMaxSize().padding(inner)) {
            val open = detail
            if (open != null) {
                TaskDetailScreen(
                    state = open,
                    projects = projects,
                    availableTags = availableTags,
                    focusActive = focusState != null,
                    onEdit = viewModel::updateDetail,
                    onSave = viewModel::saveDetail,
                    onRetry = viewModel::retryDetail,
                    onClose = viewModel::closeDetail,
                    onStartFocus = { focusSheet = open.taskId to open.title },
                    onAddSubtask = viewModel::addSubtask,
                    onToggleSubtask = viewModel::toggleSubtask,
                    onDeleteSubtask = viewModel::deleteSubtask,
                    onAssignTag = viewModel::assignTag,
                    onRemoveTag = viewModel::removeTag,
                    onCreateTag = viewModel::createAndAssignTag,
                    onDeleteTask = { viewModel.deleteTaskWithUndo(open.taskId) },
                )
            } else {
                when (val current = state) {
                    is HoyUiState.Loading -> LoadingDay()
                    is HoyUiState.Offline -> OfflineDay(onRetry = viewModel::refresh)
                    is HoyUiState.Content -> {
                        val running = focusState
                        if (running != null) {
                            FocusMiniPlayer(
                                state = running,
                                nowEpoch = focusTick,
                                onPause = focusViewModel::pause,
                                onResume = focusViewModel::resume,
                                onStop = { focusViewModel.stop(completed = false) },
                            )
                        }
                        PullToRefreshBox(
                            isRefreshing = refreshing,
                            onRefresh = viewModel::pullToRefresh,
                            modifier = Modifier.fillMaxSize(),
                        ) {
                            DayList(
                                current,
                                habits = habitsState.habits,
                                habitsOffline = habitsState.isOffline,
                                projects = projects,
                                onToggle = viewModel::toggle,
                                onOpen = viewModel::openDetail,
                                onRescheduleTomorrow = viewModel::rescheduleTaskToTomorrow,
                                onChangePriority = viewModel::updateTaskPriority,
                                onMoveProject = viewModel::moveTaskToProject,
                                onDelete = viewModel::deleteTaskWithUndo,
                                onToggleHabit = viewModel::toggleHabit,
                                onOpenHabit = viewModel::openHabitEdit,
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
                onStart = { plannedMs ->
                    if (Build.VERSION.SDK_INT >= 33 &&
                        ContextCompat.checkSelfPermission(
                            ctx,
                            Manifest.permission.POST_NOTIFICATIONS,
                        ) != PackageManager.PERMISSION_GRANTED
                    ) {
                        notifPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
                    }
                    focusViewModel.start(sheet.first, sheet.second, plannedMs)
                    focusSheet = null
                },
                onDismiss = { if (!focusStarting) focusSheet = null },
            )
        }
        if (showSheet) {
            CaptureSheet(
                creating = creating,
                projects = projects,
                initialText = capturePrefill,
                onSave = { viewModel.createTask(it) },
                onDismiss = {
                    if (!creating) {
                        showSheet = false
                        capturePrefill = ""
                    }
                },
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
    onToggle: (String) -> Unit,
    onOpen: (TodayTask) -> Unit,
    onRescheduleTomorrow: (TodayTask) -> Unit = {},
    onChangePriority: (String, String) -> Unit = { _, _ -> },
    onMoveProject: (String, String?) -> Unit = { _, _ -> },
    onDelete: (String) -> Unit = {},
    onToggleHabit: (String) -> Unit,
    onOpenHabit: (HabitToday) -> Unit,
) {
    val dateLine =
        LocalDate.now().format(
            DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM).withLocale(Locale.getDefault()),
        )
    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth().padding(top = 16.dp, bottom = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column(Modifier.weight(1f)) {
                    Text(
                        text = dateLine,
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.primary,
                    )
                    Text(
                        text = stringResource(R.string.tabs_today),
                        style = MaterialTheme.typography.headlineLarge,
                    )
                    Text(
                        text = stringResource(R.string.today_progress, content.done, content.total),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                DayRing(done = content.done, total = content.total)
            }
        }
        if (content.isOffline) {
            item(key = "offline") {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
                    modifier = Modifier.fillMaxWidth(),
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
        if (content.sections.isEmpty()) {
            item {
                Column(Modifier.fillMaxWidth().padding(vertical = 48.dp)) {
                    Text(
                        text = stringResource(R.string.today_empty_title),
                        style = MaterialTheme.typography.titleLarge,
                    )
                    Text(
                        text = stringResource(R.string.today_empty_body),
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
            }
        }
        for (section in content.sections) {
            item(key = "header-${section.kind}") {
                SectionHeader(kind = section.kind, count = section.tasks.size)
            }
            items(section.tasks, key = { "task-${it.id}" }) { task ->
                TaskRow(
                    task = task,
                    onToggle = onToggle,
                    onOpen = onOpen,
                    onRescheduleTomorrow = onRescheduleTomorrow,
                    onChangePriority = onChangePriority,
                    onMoveProject = onMoveProject,
                    onDelete = onDelete,
                    projects = projects,
                )
            }
        }
        item(key = "habits-header") {
            HabitsHeader(count = habits.size, offline = habitsOffline)
        }
        if (habits.isEmpty()) {
            item(key = "habits-empty") {
                Text(
                    text = stringResource(R.string.habits_empty),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(vertical = 4.dp),
                )
            }
        } else {
            items(habits, key = { "habit-${it.id}" }) { habit ->
                HabitRow(habit = habit, onToggle = onToggleHabit, onOpen = onOpenHabit)
            }
        }
        item { Spacer(Modifier.height(24.dp)) }
    }
}

@Composable
private fun DayRing(done: Int, total: Int) {
    val progress = if (total == 0) 0f else done.toFloat() / total.toFloat()
    val track = MaterialTheme.colorScheme.surfaceVariant
    val bar = MaterialTheme.colorScheme.primary
    val label = "$done/$total"
    Row(verticalAlignment = Alignment.CenterVertically) {
        Text(
            text = label,
            style = OrdoNumerals.Counter,
            color = MaterialTheme.colorScheme.primary,
        )
        Spacer(Modifier.width(12.dp))
        Canvas(Modifier.size(40.dp)) {
            drawArc(track, 0f, 360f, false, style = Stroke(width = 8f, cap = StrokeCap.Round))
            if (progress > 0f) {
                drawArc(bar, -90f, 360f * progress, false, style = Stroke(width = 8f, cap = StrokeCap.Round))
            }
        }
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
        text = name,
        style = MaterialTheme.typography.labelLarge,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        modifier = Modifier.padding(top = 12.dp, bottom = 2.dp),
    )
}

@Composable
internal fun HabitsHeader(count: Int, offline: Boolean) {
    Column(Modifier.padding(top = 12.dp, bottom = 2.dp)) {
        Text(
            text = stringResource(R.string.habits_title),
            style = MaterialTheme.typography.labelLarge,
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

@Composable
internal fun HabitRow(
    habit: HabitToday,
    onToggle: (String) -> Unit,
    onOpen: (HabitToday) -> Unit = {},
) {
    val scheme = MaterialTheme.colorScheme
    val done = habit.doneToday
    val streakLabel = pluralStringResource(R.plurals.habits_streak, habit.currentStreak, habit.currentStreak)
    Card(
        colors = CardDefaults.cardColors(containerColor = scheme.surfaceContainerLow),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            CheckDot(done = done, onToggle = { onToggle(habit.id) })
            Spacer(Modifier.width(12.dp))
            Column(
                Modifier.weight(1f).clickable(
                    onClickLabel = stringResource(R.string.habits_edit_title),
                    onClick = { onOpen(habit) },
                ),
            ) {
                Text(
                    text = habit.name,
                    style = MaterialTheme.typography.bodyLarge,
                    textDecoration = if (done) TextDecoration.LineThrough else null,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                if (habit.currentStreak > 0) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Canvas(Modifier.size(8.dp)) {
                            drawCircle(OrdoSectionColors.Habits, radius = size.minDimension / 2)
                        }
                        Spacer(Modifier.width(6.dp))
                        Text(
                            text = streakLabel,
                            style = MaterialTheme.typography.bodySmall,
                            color = scheme.onSurfaceVariant,
                        )
                    }
                }
            }
        }
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
) {
    val scheme = MaterialTheme.colorScheme
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
                        onToggle(task.id)
                        false
                    }
                    SwipeToDismissBoxValue.EndToStart -> {
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
                        .background(color, shape = CardDefaults.shape)
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
            Card(
                colors = CardDefaults.cardColors(containerColor = scheme.surfaceContainerLow),
                modifier =
                    Modifier
                        .fillMaxWidth()
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
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    CheckDot(done = task.isDone, onToggle = { onToggle(task.id) })
                    Spacer(Modifier.width(12.dp))
                    Column(
                        Modifier
                            .weight(1f)
                            .combinedClickable(
                                role = Role.Button,
                                onClickLabel = openLabel,
                                onClick = { onOpen(task) },
                                onLongClick = { showMenu = true },
                            ),
                    ) {
                        Text(
                            text = task.title,
                            style = MaterialTheme.typography.bodyLarge,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis,
                            textDecoration = if (task.isDone) TextDecoration.LineThrough else null,
                            color = if (task.isDone) scheme.onSurfaceVariant else scheme.onSurface,
                        )
                        TaskMeta(task)
                    }
                    if (task.scheduledTime != null) {
                        Spacer(Modifier.width(8.dp))
                        Text(
                            text = task.scheduledTime,
                            style = OrdoNumerals.Inline,
                            color = scheme.onSurfaceVariant,
                        )
                    }
                    Box {
                        IconButton(
                            onClick = { showMenu = true },
                            modifier = Modifier.size(32.dp),
                        ) {
                            Text("⋮", style = MaterialTheme.typography.titleMedium, color = scheme.onSurfaceVariant)
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
        }
        Text(
            text = bits.joinToString(" · "),
            style = MaterialTheme.typography.bodySmall,
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
            Color.Gray
        }
    Canvas(Modifier.size(8.dp)) { drawCircle(color) }
}

@Composable
internal fun CheckDot(done: Boolean, onToggle: () -> Unit) {
    val scheme = MaterialTheme.colorScheme
    val ring = if (done) scheme.primary else scheme.primary.copy(alpha = 0.45f)
    val description =
        stringResource(if (done) R.string.actions_undo else R.string.actions_complete)
    Canvas(
        Modifier.size(48.dp).clickable(role = Role.Checkbox, onClickLabel = description, onClick = onToggle),
    ) {
        val r = size.minDimension / 2 - 11 * density
        val c = center
        if (done) drawCircle(ring, r, c) else drawCircle(ring, r, c, style = Stroke(width = 5 * density))
    }
}
