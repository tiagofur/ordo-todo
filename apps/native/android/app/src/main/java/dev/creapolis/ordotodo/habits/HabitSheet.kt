package dev.creapolis.ordotodo.habits

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledTonalIconButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import dev.creapolis.ordotodo.R
import dev.creapolis.ordotodo.hoy.HabitEditState
import dev.creapolis.ordotodo.hoy.OrdoTimePickerDialog
import dev.creapolis.ordotodo.ui.theme.OrdoSectionColors

private val MOMENTS = listOf("MORNING", "AFTERNOON", "EVENING", null)

/**
 * Connected 7-station emerald streak strip (F3d): oldest left, today right.
 */
@Composable
private fun StationsStrip(stations: List<Boolean>) {
    val done = stations.count { it }
    val emerald = OrdoSectionColors.Habits
    val emeraldText = Color(0xFF059669)
    val segmentOff = emerald.copy(alpha = 0.22f)
    val surfaceBg = MaterialTheme.colorScheme.surfaceContainerLow

    Surface(
        shape = RoundedCornerShape(12.dp),
        color = emerald.copy(alpha = 0.08f),
        border = BorderStroke(1.dp, emerald.copy(alpha = 0.22f)),
        modifier = Modifier
            .fillMaxWidth()
            .semantics(mergeDescendants = true) {
                contentDescription = "$done de ${stations.size} días"
            },
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 10.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Canvas(
                modifier = Modifier
                    .width((stations.size * 12 + (stations.size - 1) * 16).dp)
                    .height(12.dp),
            ) {
                val stationDiameter = 12.dp.toPx()
                val stationRadius = stationDiameter / 2f
                val segWidth = 16.dp.toPx()
                val segHeight = 2.5.dp.toPx()
                val borderStroke = 2.dp.toPx()
                val cy = size.height / 2f

                for (i in 0 until stations.size - 1) {
                    val segOn = stations[i] && stations[i + 1]
                    val xStart = i * (stationDiameter + segWidth) + stationDiameter
                    drawRect(
                        color = if (segOn) emerald else segmentOff,
                        topLeft = Offset(xStart, cy - segHeight / 2f),
                        size = Size(segWidth, segHeight),
                    )
                }

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
            Text(
                text = "$done/${stations.size} días",
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.SemiBold,
                color = emeraldText,
            )
        }
    }
}

/**
 * Habit create/edit sheet (F3c): clean M3 header, borderless headline title input,
 * grouped configuration card with moment chips, native time picker chip, and
 * target count stepper.
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
    LaunchedEffect(Unit) {
        if (state.habitId == null) focus.requestFocus()
    }
    var showTimePicker by remember { mutableStateOf(false) }
    val timeError = state.time.isNotBlank() && parseHabitTime(state.time) == null
    val countError = state.count.isNotBlank() && parseHabitCount(state.count) == null
    val valid = state.name.isNotBlank() && !timeError && !countError && !state.saving
    val currentCount = parseHabitCount(state.count) ?: 1
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
            // Header row with title, optional delete action, and primary save button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text =
                        stringResource(
                            if (state.habitId == null) R.string.habits_create_title
                            else R.string.habits_edit_title,
                        ),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = scheme.onSurfaceVariant,
                )
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    if (state.habitId != null) {
                        IconButton(onClick = onDelete) {
                            Icon(
                                imageVector = Icons.Default.Delete,
                                contentDescription = stringResource(R.string.actions_delete),
                                tint = scheme.error,
                            )
                        }
                    }
                    Button(
                        onClick = onSave,
                        enabled = valid,
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = OrdoSectionColors.Habits,
                            contentColor = Color.White,
                        ),
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                    ) {
                        if (state.saving) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(16.dp),
                                strokeWidth = 2.dp,
                                color = Color.White,
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
            }

            val stations = state.stations
            if (stations != null) {
                Spacer(Modifier.height(10.dp))
                StationsStrip(stations = stations)
            }

            Spacer(Modifier.height(6.dp))

            // Borderless headline name input
            TextField(
                value = state.name,
                onValueChange = { value -> onEdit { s -> s.copy(name = value) } },
                modifier = Modifier.fillMaxWidth().focusRequester(focus),
                placeholder = {
                    Text(
                        text = stringResource(R.string.habits_name_hint),
                        style = MaterialTheme.typography.headlineSmall.copy(fontSize = 21.sp),
                        color = scheme.onSurfaceVariant.copy(alpha = 0.5f),
                    )
                },
                textStyle = MaterialTheme.typography.headlineSmall.copy(
                    fontSize = 21.sp,
                    fontWeight = FontWeight.SemiBold,
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
                keyboardActions = KeyboardActions(onDone = { if (valid) onSave() }),
            )

            Spacer(Modifier.height(8.dp))

            // Grouped configuration card
            Surface(
                shape = RoundedCornerShape(14.dp),
                color = scheme.surfaceContainerLow,
                border = BorderStroke(1.dp, scheme.outlineVariant.copy(alpha = 0.45f)),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    // Moment of day
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(
                            text = stringResource(R.string.habits_moment_label),
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = scheme.onSurfaceVariant,
                        )
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
                    }

                    HorizontalDivider(
                        thickness = 0.75.dp,
                        color = scheme.outlineVariant.copy(alpha = 0.35f),
                    )

                    // Preferred time row (picker chip instead of raw text field)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text(
                            text = stringResource(R.string.habits_time_label),
                            style = MaterialTheme.typography.bodyMedium,
                            color = scheme.onSurface,
                        )
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            FilterChip(
                                selected = state.time.isNotBlank(),
                                onClick = { showTimePicker = true },
                                label = {
                                    Text(
                                        state.time.ifBlank {
                                            stringResource(R.string.detail_pick_time)
                                        },
                                    )
                                },
                            )
                            if (state.time.isNotBlank()) {
                                FilterChip(
                                    selected = false,
                                    onClick = { onEdit { it.copy(time = "") } },
                                    label = { Text("×") },
                                )
                            }
                        }
                    }

                    HorizontalDivider(
                        thickness = 0.75.dp,
                        color = scheme.outlineVariant.copy(alpha = 0.35f),
                    )

                    // Target daily count stepper row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text(
                            text = stringResource(R.string.habits_count_label),
                            style = MaterialTheme.typography.bodyMedium,
                            color = scheme.onSurface,
                        )
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                        ) {
                            FilledTonalIconButton(
                                onClick = {
                                    val next = (currentCount - 1).coerceAtLeast(1)
                                    onEdit { it.copy(count = next.toString()) }
                                },
                                enabled = currentCount > 1,
                                modifier = Modifier.size(32.dp),
                            ) {
                                Text("−", fontWeight = FontWeight.Bold)
                            }
                            Text(
                                text = currentCount.toString(),
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                            )
                            FilledTonalIconButton(
                                onClick = {
                                    val next = (currentCount + 1).coerceAtMost(99)
                                    onEdit { it.copy(count = next.toString()) }
                                },
                                modifier = Modifier.size(32.dp),
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Add,
                                    contentDescription = null,
                                    modifier = Modifier.size(16.dp),
                                )
                            }
                        }
                    }
                }
            }

            Spacer(Modifier.height(20.dp))
        }

        if (showTimePicker) {
            OrdoTimePickerDialog(
                initialTime = state.time.takeIf { it.isNotBlank() },
                onTimeSelected = { picked ->
                    onEdit { it.copy(time = picked) }
                },
                onDismiss = { showTimePicker = false },
            )
        }
    }
}
