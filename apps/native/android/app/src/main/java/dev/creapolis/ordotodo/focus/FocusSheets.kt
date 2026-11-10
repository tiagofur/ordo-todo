package dev.creapolis.ordotodo.focus

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import dev.creapolis.ordotodo.R

private val PRESETS_MINUTES = listOf(15, 25, 50)

/**
 * Duration picker + start (F2). `canExact=false` shows the honest
 * inexact-alarm note; the session runs either way.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FocusStartSheet(
    taskTitle: String,
    starting: Boolean,
    canExact: Boolean,
    onStart: (plannedMs: Long?) -> Unit,
    onDismiss: () -> Unit,
) {
    var minutes by remember { mutableStateOf(25) }
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
            }
            Spacer(Modifier.height(12.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                TextButton(onClick = onDismiss, enabled = !starting) {
                    Text(stringResource(R.string.actions_cancel))
                }
                Spacer(Modifier.width(8.dp))
                Button(
                    onClick = {
                        onStart(if (openEnded) null else minutes * 60_000L)
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

/** Compact ongoing-session card: title, countdown, pause/resume + stop. */
@Composable
fun FocusMiniPlayer(
    state: FocusState,
    nowEpoch: Long,
    onPause: () -> Unit,
    onResume: () -> Unit,
    onStop: () -> Unit,
) {
    val elapsed = formatElapsed(elapsedMs(state, nowEpoch))
    val left = remainingMs(state, nowEpoch)
    val line =
        if (left == null) elapsed else "$elapsed · −${formatElapsed(left)}"
    androidx.compose.material3.Card(
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 10.dp)) {
            Text(
                text = state.taskTitle,
                style = MaterialTheme.typography.titleSmall,
            )
            Text(
                text = line,
                style = MaterialTheme.typography.headlineSmall,
            )
            Spacer(Modifier.height(4.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                if (state.isPaused) {
                    Button(onClick = onResume) {
                        Text(stringResource(R.string.timer_resume))
                    }
                } else {
                    Button(onClick = onPause) {
                        Text(stringResource(R.string.timer_pause))
                    }
                }
                TextButton(onClick = onStop) {
                    Text(stringResource(R.string.timer_stop))
                }
            }
        }
    }
}
