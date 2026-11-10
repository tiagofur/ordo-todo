package dev.creapolis.ordotodo.hoy

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.SnackbarResult
import androidx.compose.material3.Text
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
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import dev.creapolis.ordotodo.R
import dev.creapolis.ordotodo.data.HabitToday
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
    val updatedText = stringResource(R.string.detail_updated)
    val errorText = stringResource(R.string.auth_error_network)
    val addLabel = stringResource(R.string.actions_add_task)
    var showSheet by remember { mutableStateOf(false) }
    val creating by viewModel.creating.collectAsState()
    val projects by viewModel.projects.collectAsState()
    val detail by viewModel.detail.collectAsState()
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
    val habitsState by viewModel.habitsState.collectAsState()
    val focusCompletedText = stringResource(R.string.timer_completed)
    val focusStoppedText = stringResource(R.string.timer_stopped)
    LaunchedEffect(showSheet) {
        if (showSheet) viewModel.ensureProjects()
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
                    R.string.detail_updated -> updatedText
                    R.string.habits_done -> habitDoneText
                    R.string.habits_undone -> habitUndoneText
                    R.string.auth_error_network -> errorText
                    else -> doneText
                }
            if (snack.message == R.string.today_task_created) showSheet = false
            if (snack.message == R.string.detail_updated) viewModel.closeDetail()
            val result =
                snackbar.showSnackbar(
                    message = text,
                    actionLabel = if (snack.undoTaskId != null) undoLabel else null,
                )
            if (result == SnackbarResult.ActionPerformed && snack.undoTaskId != null) {
                viewModel.toggle(snack.undoTaskId)
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
                    focusActive = focusState != null,
                    onEdit = viewModel::updateDetail,
                    onSave = viewModel::saveDetail,
                    onRetry = viewModel::retryDetail,
                    onClose = viewModel::closeDetail,
                    onStartFocus = { focusSheet = open.taskId to open.title },
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
                        DayList(
                            current,
                            habits = habitsState.habits,
                            habitsOffline = habitsState.isOffline,
                            onToggle = viewModel::toggle,
                            onOpen = viewModel::openDetail,
                            onToggleHabit = viewModel::toggleHabit,
                        )
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
                onSave = { viewModel.createTask(it) },
                onDismiss = { if (!creating) showSheet = false },
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
    onToggle: (String) -> Unit,
    onOpen: (TodayTask) -> Unit,
    onToggleHabit: (String) -> Unit,
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
                TaskRow(task, onToggle = onToggle, onOpen = onOpen)
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
                HabitRow(habit = habit, onToggle = onToggleHabit)
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
private fun HabitsHeader(count: Int, offline: Boolean) {
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
private fun HabitRow(habit: HabitToday, onToggle: (String) -> Unit) {
    val scheme = MaterialTheme.colorScheme
    val done = habit.doneToday
    val streakLabel = stringResource(R.string.habits_streak, habit.currentStreak)
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
            Column(Modifier.weight(1f)) {
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

@Composable
private fun TaskRow(task: TodayTask, onToggle: (String) -> Unit, onOpen: (TodayTask) -> Unit) {
    val scheme = MaterialTheme.colorScheme
    val openLabel = stringResource(R.string.detail_open)
    Card(
        colors =
            CardDefaults.cardColors(
                containerColor = scheme.surfaceContainerLow,
            ),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            CheckDot(done = task.isDone, onToggle = { onToggle(task.id) })
            Spacer(Modifier.width(12.dp))
            Column(
                Modifier.weight(1f).clickable(
                    role = Role.Button,
                    onClickLabel = openLabel,
                    onClick = { onOpen(task) },
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
                Spacer(Modifier.width(12.dp))
                Text(
                    text = task.scheduledTime,
                    style = OrdoNumerals.Inline,
                    color = scheme.onSurfaceVariant,
                )
            }
        }
    }
}

@Composable
private fun TaskMeta(task: TodayTask) {
    val scheme = MaterialTheme.colorScheme
    val bits = mutableListOf<String>()
    task.project?.let { bits.add(it.name) }
    if (task.subTasks.isNotEmpty()) bits.add("${task.doneSubTasks}/${task.subTasks.size}")
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
private fun CheckDot(done: Boolean, onToggle: () -> Unit) {
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
