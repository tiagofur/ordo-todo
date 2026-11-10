package dev.creapolis.ordotodo.focus

import android.content.Intent
import android.os.Build
import android.provider.Settings
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledIconButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.SuggestionChip
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.core.net.toUri
import dev.creapolis.ordotodo.R
import dev.creapolis.ordotodo.data.TimerStatsResponse

data class FocusTaskItem(
    val id: String,
    val title: String,
)

private val PRESETS_MINUTES = listOf(15, 25, 50)

/**
 * Duration picker + start (F2, S13). `canExact=false` shows the honest
 * inexact-alarm note; the session runs either way.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FocusStartSheet(
    taskTitle: String,
    starting: Boolean,
    canExact: Boolean,
    config: PomodoroConfig = PomodoroConfig(),
    onStart: (plannedMs: Long?, mode: PomodoroMode) -> Unit,
    onDismiss: () -> Unit,
) {
    var selectedMode by remember { mutableStateOf(PomodoroMode.WORK) }
    var minutes by remember(selectedMode) {
        mutableStateOf(
            when (selectedMode) {
                PomodoroMode.WORK -> config.workDurationMinutes
                PomodoroMode.SHORT_BREAK -> config.shortBreakMinutes
                PomodoroMode.LONG_BREAK -> config.longBreakMinutes
            },
        )
    }
    var openEnded by remember { mutableStateOf(false) }

    ModalBottomSheet(
        onDismissRequest = { if (!starting) onDismiss() },
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
    ) {
        Column(Modifier.fillMaxWidth().padding(horizontal = 20.dp).imePadding()) {
            Text(
                text = stringResource(R.string.timer_title),
                style = MaterialTheme.typography.titleLarge,
            )
            Spacer(Modifier.height(4.dp))
            Text(
                text = taskTitle,
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(12.dp))

            // Mode selector (Foco / Descanso corto / Descanso largo)
            Text(
                text = stringResource(R.string.timer_mode_work),
                style = MaterialTheme.typography.labelLarge,
            )
            Spacer(Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(
                    selected = selectedMode == PomodoroMode.WORK,
                    onClick = { selectedMode = PomodoroMode.WORK },
                    label = { Text(stringResource(R.string.timer_mode_work)) },
                )
                FilterChip(
                    selected = selectedMode == PomodoroMode.SHORT_BREAK,
                    onClick = { selectedMode = PomodoroMode.SHORT_BREAK },
                    label = { Text(stringResource(R.string.timer_mode_short_break)) },
                )
                FilterChip(
                    selected = selectedMode == PomodoroMode.LONG_BREAK,
                    onClick = { selectedMode = PomodoroMode.LONG_BREAK },
                    label = { Text(stringResource(R.string.timer_mode_long_break)) },
                )
            }

            Spacer(Modifier.height(12.dp))
            Text(
                text = stringResource(R.string.timer_duration_label),
                style = MaterialTheme.typography.labelLarge,
            )
            Spacer(Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                for (preset in PRESETS_MINUTES) {
                    FilterChip(
                        selected = !openEnded && minutes == preset,
                        onClick = {
                            minutes = preset
                            openEnded = false
                        },
                        label = { Text(stringResource(R.string.timer_minutes, preset)) },
                    )
                }
                FilterChip(
                    selected = openEnded,
                    onClick = { openEnded = true },
                    label = { Text(stringResource(R.string.timer_open_ended)) },
                )
            }
            if (!canExact) {
                Spacer(Modifier.height(8.dp))
                Text(
                    text = stringResource(R.string.timer_inexact_note),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                if (Build.VERSION.SDK_INT >= 31) {
                    val context = LocalContext.current
                    Spacer(Modifier.height(8.dp))
                    OutlinedButton(
                        onClick = {
                            context.startActivity(
                                Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
                                    data = "package:${context.packageName}".toUri()
                                },
                            )
                        },
                    ) {
                        Text(stringResource(R.string.timer_grant_exact))
                    }
                }
            }
            Spacer(Modifier.height(12.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                TextButton(onClick = onDismiss, enabled = !starting) {
                    Text(stringResource(R.string.actions_cancel))
                }
                Spacer(Modifier.width(8.dp))
                Button(
                    onClick = {
                        onStart(if (openEnded) null else minutes * 60_000L, selectedMode)
                    },
                    enabled = !starting,
                ) {
                    if (starting) {
                        CircularProgressIndicator()
                    } else {
                        Text(stringResource(R.string.timer_start))
                    }
                }
            }
            Spacer(Modifier.height(16.dp))
        }
    }
}

/**
 * Ongoing focus player card: Pomodoro mode badge, task title, countdown,
 * pause/resume, skip with ODD 016 confirmation, switch task (S15), stop, and daily stats summary.
 */
@Composable
fun FocusMiniPlayer(
    state: FocusState,
    nowEpoch: Long,
    todayStats: TimerStatsResponse? = null,
    onPause: () -> Unit,
    onResume: () -> Unit,
    onSkip: () -> Unit,
    onSwitchTask: () -> Unit,
    onStop: () -> Unit,
) {
    val elapsed = formatElapsed(elapsedMs(state, nowEpoch))
    val left = remainingMs(state, nowEpoch)
    val line = if (left == null) elapsed else "$elapsed · −${formatElapsed(left)}"

    var showSkipDialog by remember { mutableStateOf(false) }

    if (showSkipDialog) {
        AlertDialog(
            onDismissRequest = { showSkipDialog = false },
            title = { Text(stringResource(R.string.timer_skip)) },
            text = { Text(stringResource(R.string.timer_skip_confirm_no_credit)) },
            confirmButton = {
                TextButton(
                    onClick = {
                        showSkipDialog = false
                        onSkip()
                    },
                ) {
                    Text(stringResource(R.string.timer_skip))
                }
            },
            dismissButton = {
                TextButton(onClick = { showSkipDialog = false }) {
                    Text(stringResource(R.string.actions_cancel))
                }
            },
        )
    }

    val modeLabel = when (state.mode) {
        PomodoroMode.WORK -> stringResource(R.string.timer_mode_work)
        PomodoroMode.SHORT_BREAK -> stringResource(R.string.timer_mode_short_break)
        PomodoroMode.LONG_BREAK -> stringResource(R.string.timer_mode_long_break)
    }

    val elapsedDuration = elapsedMs(state, nowEpoch)
    val plannedDuration = state.plannedDurationMs
    val progressFraction = if (plannedDuration != null && plannedDuration > 0L) {
        (elapsedDuration.toFloat() / plannedDuration.toFloat()).coerceIn(0f, 1f)
    } else 0f

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 6.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceContainerHigh,
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Column(Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                // Play / Pause round toggle
                FilledIconButton(
                    onClick = if (state.isPaused) onResume else onPause,
                    modifier = Modifier.size(40.dp),
                    colors = IconButtonDefaults.filledIconButtonColors(
                        containerColor = when (state.mode) {
                            PomodoroMode.WORK -> MaterialTheme.colorScheme.primary
                            PomodoroMode.SHORT_BREAK -> MaterialTheme.colorScheme.secondary
                            PomodoroMode.LONG_BREAK -> MaterialTheme.colorScheme.tertiary
                        },
                        contentColor = MaterialTheme.colorScheme.surface,
                    ),
                ) {
                    if (state.isPaused) {
                        Icon(
                            imageVector = Icons.Default.PlayArrow,
                            contentDescription = stringResource(R.string.timer_resume),
                            modifier = Modifier.size(22.dp),
                        )
                    } else {
                        // Clean geometric 2-bar Pause mark
                        val pauseColor = MaterialTheme.colorScheme.surface
                        Canvas(Modifier.size(14.dp)) {
                            val w = 3.5.dp.toPx()
                            val h = size.height
                            drawRoundRect(pauseColor, topLeft = Offset(0f, 0f), size = androidx.compose.ui.geometry.Size(w, h), cornerRadius = androidx.compose.ui.geometry.CornerRadius(1.dp.toPx(), 1.dp.toPx()))
                            drawRoundRect(pauseColor, topLeft = Offset(size.width - w, 0f), size = androidx.compose.ui.geometry.Size(w, h), cornerRadius = androidx.compose.ui.geometry.CornerRadius(1.dp.toPx(), 1.dp.toPx()))
                        }
                    }
                }

                // Title + Subtitle
                Column(Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = state.taskTitle,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.weight(1f, fill = false),
                        )
                        if (state.completedPomodoros > 0) {
                            Text(
                                text = " 🍅${state.completedPomodoros}",
                                style = MaterialTheme.typography.labelSmall,
                            )
                        }
                    }
                    Text(
                        text = "$modeLabel · $line",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }

                // Actions: Switch task, Skip, Stop
                IconButton(onClick = onSwitchTask, modifier = Modifier.size(36.dp)) {
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = stringResource(R.string.timer_switch_task),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(20.dp),
                    )
                }

                IconButton(
                    onClick = {
                        val elapsedNow = elapsedMs(state, nowEpoch)
                        if (PomodoroCycle.isCredited(elapsedNow, state.plannedDurationMs)) {
                            onSkip()
                        } else {
                            showSkipDialog = true
                        }
                    },
                    modifier = Modifier.size(36.dp),
                ) {
                    Text(
                        text = "⏭",
                        style = MaterialTheme.typography.titleSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }

                IconButton(onClick = onStop, modifier = Modifier.size(36.dp)) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = stringResource(R.string.timer_stop),
                        tint = MaterialTheme.colorScheme.error,
                        modifier = Modifier.size(20.dp),
                    )
                }
            }

            // Today's stats if present
            if (todayStats != null && (todayStats.completedPomodoros > 0 || todayStats.totalWorkMinutes > 0)) {
                val pomodorosStr = pluralStringResource(
                    R.plurals.timer_stats_pomodoros,
                    todayStats.completedPomodoros,
                    todayStats.completedPomodoros,
                )
                val minutesStr = pluralStringResource(
                    R.plurals.timer_stats_minutes,
                    todayStats.totalWorkMinutes,
                    todayStats.totalWorkMinutes,
                )
                Text(
                    text = "${stringResource(R.string.timer_stats_title)}: $pomodorosStr · $minutesStr",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(start = 14.dp, end = 14.dp, bottom = 6.dp),
                )
            }

            // Sleek bottom progress indicator
            if (plannedDuration != null && plannedDuration > 0L) {
                LinearProgressIndicator(
                    progress = { progressFraction },
                    modifier = Modifier.fillMaxWidth().height(3.dp),
                    color = MaterialTheme.colorScheme.primary,
                    trackColor = Color.Transparent,
                )
            }
        }
    }
}

/**
 * Task picker sheet to switch the active timer to another task (S15).
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FocusSwitchTaskSheet(
    tasks: List<FocusTaskItem>,
    onSelectTask: (taskId: String, taskTitle: String) -> Unit,
    onDismiss: () -> Unit,
) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
    ) {
        Column(
            Modifier.fillMaxWidth().padding(horizontal = 20.dp).imePadding(),
        ) {
            Text(
                text = stringResource(R.string.timer_switch_task),
                style = MaterialTheme.typography.titleLarge,
            )
            Spacer(Modifier.height(12.dp))
            if (tasks.isEmpty()) {
                Text(
                    text = stringResource(R.string.tasks_empty),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxWidth().height(280.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    items(tasks, key = { it.id }) { task ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    onSelectTask(task.id, task.title)
                                    onDismiss()
                                },
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.surfaceVariant,
                            ),
                        ) {
                            Text(
                                text = task.title,
                                modifier = Modifier.padding(14.dp),
                                style = MaterialTheme.typography.bodyLarge,
                            )
                        }
                    }
                }
            }
            Spacer(Modifier.height(12.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                TextButton(onClick = onDismiss) {
                    Text(stringResource(R.string.actions_cancel))
                }
            }
            Spacer(Modifier.height(16.dp))
        }
    }
}
