package dev.creapolis.ordotodo.focus

import android.content.Intent
import android.os.Build
import android.provider.Settings
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.net.toUri
import dev.creapolis.ordotodo.R

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
 * pause/resume, skip with ODD 016 confirmation, and stop.
 */
@Composable
fun FocusMiniPlayer(
    state: FocusState,
    nowEpoch: Long,
    onPause: () -> Unit,
    onResume: () -> Unit,
    onSkip: () -> Unit,
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

    Card(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 6.dp),
        colors = CardDefaults.cardColors(
            containerColor = when (state.mode) {
                PomodoroMode.WORK -> MaterialTheme.colorScheme.primaryContainer
                PomodoroMode.SHORT_BREAK -> MaterialTheme.colorScheme.secondaryContainer
                PomodoroMode.LONG_BREAK -> MaterialTheme.colorScheme.tertiaryContainer
            },
        ),
    ) {
        Column(Modifier.fillMaxWidth().padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                val modeLabel = when (state.mode) {
                    PomodoroMode.WORK -> stringResource(R.string.timer_mode_work)
                    PomodoroMode.SHORT_BREAK -> stringResource(R.string.timer_mode_short_break)
                    PomodoroMode.LONG_BREAK -> stringResource(R.string.timer_mode_long_break)
                }
                SuggestionChip(
                    onClick = {},
                    label = { Text(modeLabel, fontWeight = FontWeight.Bold) },
                )
                if (state.completedPomodoros > 0) {
                    Text(
                        text = "🍅 ${state.completedPomodoros}",
                        style = MaterialTheme.typography.labelMedium,
                    )
                }
            }

            Spacer(Modifier.height(4.dp))
            Text(
                text = state.taskTitle,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
            )
            Text(
                text = line,
                style = MaterialTheme.typography.headlineMedium,
            )

            Spacer(Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                if (state.isPaused) {
                    Button(onClick = onResume) {
                        Text(stringResource(R.string.timer_resume))
                    }
                } else {
                    Button(onClick = onPause) {
                        Text(stringResource(R.string.timer_pause))
                    }
                }

                OutlinedButton(
                    onClick = {
                        val elapsedNow = elapsedMs(state, nowEpoch)
                        if (PomodoroCycle.isCredited(elapsedNow, state.plannedDurationMs)) {
                            onSkip()
                        } else {
                            showSkipDialog = true
                        }
                    },
                ) {
                    Text(stringResource(R.string.timer_skip))
                }

                Spacer(Modifier.weight(1f))
                TextButton(onClick = onStop) {
                    Text(stringResource(R.string.timer_stop))
                }
            }
        }
    }
}
