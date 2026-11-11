package dev.creapolis.ordotodo.hoy

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import dev.creapolis.ordotodo.R
import dev.creapolis.ordotodo.data.NativeProject
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.temporal.TemporalAdjusters

/**
 * Express capture sheet (F1c + `#project` in F1d): fluid borderless input,
 * local ES/EN/PT parsing with live preview badge, quick-schedule chips, and
 * compact action bar.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CaptureSheet(
    creating: Boolean,
    projects: List<NativeProject>,
    initialText: String = "",
    onSave: (String) -> Unit,
    onDismiss: () -> Unit,
) {
    var text by remember(initialText) { mutableStateOf(initialText) }
    val parsed = remember(text) { parseCapture(text) }
    val projectName =
        remember(parsed, projects) {
            resolveProjectId(parsed.projectHint, projects)?.let { id ->
                projects.firstOrNull { it.id == id }?.name
            }
        }
    val preview =
        remember(parsed, projectName) {
            listOfNotNull(
                parsed.scheduledDate?.toString(),
                parsed.scheduledTime,
                parsed.priority,
                projectName,
            ).joinToString(" · ")
        }
    val focus = remember { FocusRequester() }
    LaunchedEffect(Unit) { focus.requestFocus() }
    var showDatePicker by remember { mutableStateOf(false) }
    var showTimePicker by remember { mutableStateOf(false) }
    val today = remember { LocalDate.now() }
    val tomorrow = remember(today) { today.plusDays(1) }
    val nextMonday = remember(today) { today.with(TemporalAdjusters.next(DayOfWeek.MONDAY)) }
    val scheme = MaterialTheme.colorScheme

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        containerColor = scheme.surfaceContainerLowest,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .imePadding(),
        ) {
            TextField(
                value = text,
                onValueChange = { text = it },
                modifier = Modifier.fillMaxWidth().focusRequester(focus),
                placeholder = {
                    Text(
                        text = stringResource(R.string.today_capture_hint),
                        style = MaterialTheme.typography.titleMedium.copy(fontSize = 18.sp),
                        color = scheme.onSurfaceVariant.copy(alpha = 0.55f),
                    )
                },
                textStyle = MaterialTheme.typography.titleMedium.copy(
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Medium,
                    color = scheme.onSurface,
                ),
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = Color.Transparent,
                    unfocusedContainerColor = Color.Transparent,
                    disabledContainerColor = Color.Transparent,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent,
                    disabledIndicatorColor = Color.Transparent,
                ),
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                keyboardActions =
                    KeyboardActions(
                        onDone = { if (text.isNotBlank() && !creating) onSave(text) },
                    ),
            )

            if (preview.isNotEmpty()) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = scheme.primaryContainer.copy(alpha = 0.45f),
                    border = BorderStroke(0.75.dp, scheme.primary.copy(alpha = 0.25f)),
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 2.dp),
                ) {
                    Text(
                        text = preview,
                        style = MaterialTheme.typography.labelMedium,
                        color = scheme.primary,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                    )
                }
                Spacer(Modifier.height(6.dp))
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                FilterChip(
                    selected = parsed.scheduledDate == today,
                    onClick = {
                        text = if (parsed.scheduledDate == today) text else "$text hoy".trim()
                    },
                    label = { Text(stringResource(R.string.detail_shortcut_today)) },
                )
                FilterChip(
                    selected = parsed.scheduledDate == tomorrow,
                    onClick = {
                        text = if (parsed.scheduledDate == tomorrow) text else "$text mañana".trim()
                    },
                    label = { Text(stringResource(R.string.detail_shortcut_tomorrow)) },
                )
                FilterChip(
                    selected = parsed.scheduledDate == nextMonday,
                    onClick = {
                        text = if (parsed.scheduledDate == nextMonday) text else "$text $nextMonday".trim()
                    },
                    label = { Text(stringResource(R.string.detail_shortcut_next_monday)) },
                )
                FilterChip(
                    selected = parsed.scheduledDate != null &&
                        parsed.scheduledDate != today &&
                        parsed.scheduledDate != tomorrow &&
                        parsed.scheduledDate != nextMonday,
                    onClick = { showDatePicker = true },
                    label = {
                        Text(
                            parsed.scheduledDate?.toString()
                                ?: stringResource(R.string.detail_pick_date),
                        )
                    },
                )
                FilterChip(
                    selected = parsed.scheduledTime != null,
                    onClick = { showTimePicker = true },
                    label = {
                        Text(parsed.scheduledTime ?: stringResource(R.string.detail_pick_time))
                    },
                )
            }

            Spacer(Modifier.height(10.dp))
            HorizontalDivider(
                thickness = 0.75.dp,
                color = scheme.outlineVariant.copy(alpha = 0.4f),
            )
            Spacer(Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = stringResource(R.string.today_capture_title),
                    style = MaterialTheme.typography.labelMedium,
                    color = scheme.onSurfaceVariant,
                )
                Button(
                    onClick = { onSave(text) },
                    enabled = text.isNotBlank() && !creating,
                    shape = RoundedCornerShape(12.dp),
                    contentPadding = PaddingValues(horizontal = 18.dp, vertical = 10.dp),
                ) {
                    if (creating) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(16.dp),
                            strokeWidth = 2.dp,
                            color = scheme.onPrimary,
                        )
                    } else {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                        )
                        Spacer(Modifier.width(6.dp))
                        Text(stringResource(R.string.actions_save))
                    }
                }
            }
            Spacer(Modifier.height(16.dp))
        }

        if (showDatePicker) {
            OrdoDatePickerDialog(
                initialDate = parsed.scheduledDate,
                onDateSelected = { date ->
                    text = "$text $date".trim()
                },
                onDismiss = { showDatePicker = false },
            )
        }

        if (showTimePicker) {
            OrdoTimePickerDialog(
                initialTime = parsed.scheduledTime,
                onTimeSelected = { time ->
                    text = "$text $time".trim()
                },
                onDismiss = { showTimePicker = false },
            )
        }
    }
}
