package dev.creapolis.ordotodo.habits

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import dev.creapolis.ordotodo.R
import dev.creapolis.ordotodo.hoy.HabitEditState

private val MOMENTS = listOf("MORNING", "AFTERNOON", "EVENING", null)

/**
 * Habit create/edit sheet (F3c). The ViewModel validates again and closes
 * on success; on failure the sheet stays open with the text kept — same
 * contract as the task capture sheet.
 */
@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun HabitSheet(
    state: HabitEditState,
    onEdit: ((HabitEditState) -> HabitEditState) -> Unit,
    onSave: () -> Unit,
    onDelete: () -> Unit,
    onDismiss: () -> Unit,
) {
    val focus = remember { FocusRequester() }
    LaunchedEffect(Unit) { focus.requestFocus() }
    val timeError = state.time.isNotBlank() && parseHabitTime(state.time) == null
    val countError = state.count.isNotBlank() && parseHabitCount(state.count) == null
    val valid = state.name.isNotBlank() && !timeError && !countError && !state.saving
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
    ) {
        Column(Modifier.fillMaxWidth().padding(horizontal = 20.dp).imePadding()) {
            Text(
                text =
                    stringResource(
                        if (state.habitId == null) R.string.habits_create_title
                        else R.string.habits_edit_title,
                    ),
                style = MaterialTheme.typography.titleLarge,
            )
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(
                value = state.name,
                onValueChange = { value -> onEdit { state -> state.copy(name = value) } },
                modifier = Modifier.fillMaxWidth().focusRequester(focus),
                placeholder = { Text(stringResource(R.string.habits_name_hint)) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                keyboardActions = KeyboardActions(onDone = { if (valid) onSave() }),
            )
            Spacer(Modifier.height(12.dp))
            Text(
                text = stringResource(R.string.habits_moment_label),
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(4.dp))
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                for (moment in MOMENTS) {
                    FilterChip(
                        selected = state.timeOfDay == moment,
                        onClick = { onEdit { it.copy(timeOfDay = moment) } },
                        label = {
                            Text(
                                when (moment) {
                                    "MORNING" -> stringResource(R.string.today_sections_morning)
                                    "AFTERNOON" -> stringResource(R.string.today_sections_afternoon)
                                    "EVENING" -> stringResource(R.string.today_sections_evening)
                                    else -> stringResource(R.string.today_sections_anytime)
                                },
                            )
                        },
                    )
                }
            }
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(
                value = state.time,
                onValueChange = { value -> onEdit { state -> state.copy(time = value) } },
                modifier = Modifier.fillMaxWidth(),
                label = { Text(stringResource(R.string.habits_time_label)) },
                placeholder = { Text(stringResource(R.string.habits_time_hint)) },
                supportingText = {
                    if (timeError) Text(stringResource(R.string.habits_invalid_time))
                },
                isError = timeError,
                singleLine = true,
            )
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = state.count,
                onValueChange = { value -> onEdit { state -> state.copy(count = value) } },
                modifier = Modifier.fillMaxWidth(),
                label = { Text(stringResource(R.string.habits_count_label)) },
                supportingText = {
                    if (countError) Text(stringResource(R.string.habits_invalid_count))
                },
                isError = countError,
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            )
            Spacer(Modifier.height(12.dp))
            Button(
                onClick = onSave,
                enabled = valid,
                modifier = Modifier.fillMaxWidth(),
            ) {
                if (state.saving) {
                    CircularProgressIndicator()
                } else {
                    Text(stringResource(R.string.actions_save))
                }
            }
            if (state.habitId != null) {
                Spacer(Modifier.height(8.dp))
                OutlinedButton(
                    onClick = onDelete,
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text(stringResource(R.string.actions_delete))
                }
            }
            Spacer(Modifier.height(16.dp))
        }
    }
}
