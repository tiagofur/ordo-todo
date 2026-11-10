package dev.creapolis.ordotodo.hoy

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TimePicker
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.material3.rememberTimePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import dev.creapolis.ordotodo.R
import java.time.DayOfWeek
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneOffset
import java.time.format.DateTimeParseException
import java.time.temporal.TemporalAdjusters
import java.util.Locale

enum class DateShortcut {
    TODAY,
    TOMORROW,
    NEXT_MONDAY,
    CLEAR,
}

fun calculateShortcutDate(shortcut: DateShortcut, reference: LocalDate = LocalDate.now()): LocalDate? =
    when (shortcut) {
        DateShortcut.TODAY -> reference
        DateShortcut.TOMORROW -> reference.plusDays(1)
        DateShortcut.NEXT_MONDAY -> reference.with(TemporalAdjusters.next(DayOfWeek.MONDAY))
        DateShortcut.CLEAR -> null
    }

fun formatTimeIso(hour: Int, minute: Int): String =
    String.format(Locale.ROOT, "%02d:%02d", hour, minute)

fun parseDateIso(text: String): LocalDate? =
    try {
        if (text.isBlank()) null else LocalDate.parse(text)
    } catch (_: DateTimeParseException) {
        null
    }

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrdoDatePickerDialog(
    initialDate: LocalDate? = null,
    onDateSelected: (LocalDate) -> Unit,
    onDismiss: () -> Unit,
) {
    val initialMillis = initialDate?.atStartOfDay(ZoneOffset.UTC)?.toInstant()?.toEpochMilli()
    val datePickerState =
        rememberDatePickerState(
            initialSelectedDateMillis = initialMillis ?: System.currentTimeMillis(),
        )

    DatePickerDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            TextButton(
                onClick = {
                    datePickerState.selectedDateMillis?.let { millis ->
                        val date = Instant.ofEpochMilli(millis).atZone(ZoneOffset.UTC).toLocalDate()
                        onDateSelected(date)
                    }
                    onDismiss()
                },
            ) {
                Text(stringResource(R.string.actions_save))
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text(stringResource(R.string.actions_cancel))
            }
        },
    ) {
        DatePicker(state = datePickerState)
    }
}

fun parseHourMinute(text: String): Pair<Int, Int>? {
    val norm = parseTimeText(text) ?: return null
    val parts = norm.split(':')
    if (parts.size != 2) return null
    val h = parts[0].toIntOrNull() ?: return null
    val m = parts[1].toIntOrNull() ?: return null
    return h to m
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrdoTimePickerDialog(
    initialTime: String? = null,
    onTimeSelected: (String) -> Unit,
    onDismiss: () -> Unit,
) {
    val parsed = parseHourMinute(initialTime.orEmpty())
    val state =
        rememberTimePickerState(
            initialHour = parsed?.first ?: 12,
            initialMinute = parsed?.second ?: 0,
            is24Hour = true,
        )

    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            TextButton(
                onClick = {
                    onTimeSelected(formatTimeIso(state.hour, state.minute))
                    onDismiss()
                },
            ) {
                Text(stringResource(R.string.actions_save))
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text(stringResource(R.string.actions_cancel))
            }
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                TimePicker(state = state)
            }
        },
    )
}

/**
 * Material 3 Date Picker with shortcut chips (Hoy, Mañana, Próximo lunes, Sin fecha, Elegir fecha...).
 * Eliminates text-based date entry (ODD 051 S6).
 */
@Composable
fun DateFieldWithShortcuts(
    label: String,
    currentDate: String,
    onDateChange: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    var showDialog by remember { mutableStateOf(false) }
    val today = remember { LocalDate.now() }
    val todayStr = remember(today) { today.toString() }
    val tomorrowStr = remember(today) { today.plusDays(1).toString() }
    val nextMondayStr = remember(today) { today.with(TemporalAdjusters.next(DayOfWeek.MONDAY)).toString() }

    Column(modifier = modifier.fillMaxWidth()) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(4.dp))
        Row(
            modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            FilterChip(
                selected = currentDate == todayStr,
                onClick = { onDateChange(todayStr) },
                label = { Text(stringResource(R.string.detail_shortcut_today)) },
            )
            FilterChip(
                selected = currentDate == tomorrowStr,
                onClick = { onDateChange(tomorrowStr) },
                label = { Text(stringResource(R.string.detail_shortcut_tomorrow)) },
            )
            FilterChip(
                selected = currentDate == nextMondayStr,
                onClick = { onDateChange(nextMondayStr) },
                label = { Text(stringResource(R.string.detail_shortcut_next_monday)) },
            )
            FilterChip(
                selected = currentDate.isBlank(),
                onClick = { onDateChange("") },
                label = { Text(stringResource(R.string.detail_shortcut_no_date)) },
            )
            val isCustomDate =
                currentDate.isNotBlank() &&
                    currentDate != todayStr &&
                    currentDate != tomorrowStr &&
                    currentDate != nextMondayStr
            FilterChip(
                selected = isCustomDate,
                onClick = { showDialog = true },
                label = {
                    Text(if (isCustomDate) currentDate else stringResource(R.string.detail_pick_date))
                },
            )
        }
    }

    if (showDialog) {
        OrdoDatePickerDialog(
            initialDate = parseDateIso(currentDate),
            onDateSelected = { date -> onDateChange(date.toString()) },
            onDismiss = { showDialog = false },
        )
    }
}

/**
 * Material 3 Time Picker button (Elegir hora / Quitar hora).
 * Eliminates text-based time entry (ODD 051 S6).
 */
@Composable
fun TimeFieldSelector(
    label: String,
    currentTime: String,
    onTimeChange: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    var showDialog by remember { mutableStateOf(false) }

    Column(modifier = modifier.fillMaxWidth()) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(4.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            OutlinedButton(
                onClick = { showDialog = true },
                modifier = Modifier.weight(1f),
            ) {
                Text(currentTime.ifBlank { stringResource(R.string.detail_pick_time) })
            }
            if (currentTime.isNotBlank()) {
                TextButton(onClick = { onTimeChange("") }) {
                    Text(stringResource(R.string.detail_clear_time))
                }
            }
        }
    }

    if (showDialog) {
        OrdoTimePickerDialog(
            initialTime = currentTime,
            onTimeSelected = onTimeChange,
            onDismiss = { showDialog = false },
        )
    }
}
