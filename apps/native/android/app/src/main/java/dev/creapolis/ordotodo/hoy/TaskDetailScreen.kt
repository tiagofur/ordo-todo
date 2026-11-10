package dev.creapolis.ordotodo.hoy

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.FilterChip
import androidx.compose.material3.IconButton
import androidx.compose.material3.InputChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import dev.creapolis.ordotodo.R
import dev.creapolis.ordotodo.data.NativeProject
import dev.creapolis.ordotodo.data.RecurrenceConfig
import dev.creapolis.ordotodo.data.SubtaskItem
import dev.creapolis.ordotodo.data.TaskTag

private val PRIORITIES = listOf("LOW", "MEDIUM", "HIGH", "URGENT")

/**
 * Grouped M3 edit form (F1d + ODD 051 S7). The caller owns [state]; save sends only the
 * diff via `PATCH /tasks/:id`, so untouched fields never travel.
 */
@Composable
fun TaskDetailScreen(
    state: TaskEditState,
    projects: List<NativeProject>,
    availableTags: List<TaskTag> = emptyList(),
    focusActive: Boolean,
    onEdit: ((TaskEditState) -> TaskEditState) -> Unit,
    onSave: () -> Unit,
    onRetry: () -> Unit,
    onClose: () -> Unit,
    onStartFocus: () -> Unit,
    onAddSubtask: (String) -> Unit = {},
    onToggleSubtask: (String) -> Unit = {},
    onDeleteSubtask: (String) -> Unit = {},
    onAssignTag: (TaskTag) -> Unit = {},
    onRemoveTag: (String) -> Unit = {},
    onCreateTag: (String) -> Unit = {},
    onDeleteTask: () -> Unit = {},
) {
    BackHandler(onBack = onClose)
    Column(Modifier.fillMaxSize()) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp, end = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            TextButton(onClick = onClose) {
                Text("‹ " + stringResource(R.string.detail_back))
            }
            Text(
                text = stringResource(R.string.detail_title),
                style = MaterialTheme.typography.titleLarge,
            )
        }
        when {
            state.loading && state.original == null && !state.loadError -> {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    CircularProgressIndicator()
                }
            }
            state.loadError && state.original == null -> {
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
            else -> {
                DetailForm(
                    state = state,
                    projects = projects,
                    availableTags = availableTags,
                    focusActive = focusActive,
                    onEdit = onEdit,
                    onSave = onSave,
                    onStartFocus = onStartFocus,
                    onAddSubtask = onAddSubtask,
                    onToggleSubtask = onToggleSubtask,
                    onDeleteSubtask = onDeleteSubtask,
                    onAssignTag = onAssignTag,
                    onRemoveTag = onRemoveTag,
                    onCreateTag = onCreateTag,
                    onDeleteTask = onDeleteTask,
                )
            }
        }
    }
}

@Composable
private fun DetailForm(
    state: TaskEditState,
    projects: List<NativeProject>,
    availableTags: List<TaskTag>,
    focusActive: Boolean,
    onEdit: ((TaskEditState) -> TaskEditState) -> Unit,
    onSave: () -> Unit,
    onStartFocus: () -> Unit,
    onAddSubtask: (String) -> Unit,
    onToggleSubtask: (String) -> Unit,
    onDeleteSubtask: (String) -> Unit,
    onAssignTag: (TaskTag) -> Unit,
    onRemoveTag: (String) -> Unit,
    onCreateTag: (String) -> Unit,
    onDeleteTask: () -> Unit,
) {
    val original = state.original
    val dirty = original != null && buildTaskPatch(original, state.edited()) != null
    val dateBad = state.scheduledDate.isNotBlank() && parseDateText(state.scheduledDate) == null
    val timeBad = state.scheduledTime.isNotBlank() && parseTimeText(state.scheduledTime) == null
    val dueBad = state.dueDate.isNotBlank() && parseDateText(state.dueDate) == null
    val valid = state.title.isNotBlank() && !dateBad && !timeBad && !dueBad
    Column(
        modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        GroupCard(stringResource(R.string.detail_group_content)) {
            OutlinedTextField(
                value = state.title,
                onValueChange = { text -> onEdit { it.copy(title = text) } },
                modifier = Modifier.fillMaxWidth(),
                label = { Text(stringResource(R.string.detail_title_label)) },
                singleLine = true,
            )
            OutlinedTextField(
                value = state.description,
                onValueChange = { text -> onEdit { it.copy(description = text) } },
                modifier = Modifier.fillMaxWidth(),
                label = { Text(stringResource(R.string.detail_description_label)) },
                minLines = 2,
            )
        }
        GroupCard(stringResource(R.string.detail_group_subtasks)) {
            SubtasksSection(
                subtasks = state.subTasks,
                onAdd = onAddSubtask,
                onToggle = onToggleSubtask,
                onDelete = onDeleteSubtask,
            )
        }
        GroupCard(stringResource(R.string.detail_group_schedule)) {
            DateFieldWithShortcuts(
                label = stringResource(R.string.detail_date_label),
                currentDate = state.scheduledDate,
                onDateChange = { date -> onEdit { it.copy(scheduledDate = date) } },
            )
            TimeFieldSelector(
                label = stringResource(R.string.detail_time_label),
                currentTime = state.scheduledTime,
                onTimeChange = { time -> onEdit { it.copy(scheduledTime = time) } },
            )
            DateFieldWithShortcuts(
                label = stringResource(R.string.detail_due_label),
                currentDate = state.dueDate,
                onDateChange = { date -> onEdit { it.copy(dueDate = date) } },
            )
        }
        GroupCard(stringResource(R.string.detail_group_estimate)) {
            EstimateSection(
                estimatedMinutes = state.estimatedMinutes,
                onPick = { minutes -> onEdit { it.copy(estimatedMinutes = minutes) } },
            )
        }
        GroupCard(stringResource(R.string.detail_group_recurrence)) {
            RecurrenceSection(
                recurrence = state.recurrence,
                onChange = { rec -> onEdit { it.copy(recurrence = rec) } },
            )
        }
        GroupCard(stringResource(R.string.detail_group_classify)) {
            PriorityPicker(
                current = state.priority,
                onPick = { picked -> onEdit { it.copy(priority = picked) } },
            )
            ProjectPicker(
                currentId = state.projectId,
                projects = projects,
                onPick = { picked -> onEdit { it.copy(projectId = picked) } },
            )
            TagsSection(
                tags = state.tags,
                availableTags = availableTags,
                onAssign = onAssignTag,
                onRemove = onRemoveTag,
                onCreate = onCreateTag,
            )
        }
        Button(
            onClick = onSave,
            enabled = dirty && valid && !state.saving,
            modifier = Modifier.fillMaxWidth(),
        ) {
            if (state.saving) {
                CircularProgressIndicator()
            } else {
                Text(stringResource(R.string.actions_save))
            }
        }
        TextButton(
            onClick = onStartFocus,
            enabled = !focusActive,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text(stringResource(R.string.actions_start_focus))
        }
        OutlinedButton(
            onClick = onDeleteTask,
            colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error),
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text(stringResource(R.string.detail_delete_task))
        }
        Spacer(Modifier.height(16.dp))
    }
}

@Composable
private fun GroupCard(title: String, content: @Composable () -> Unit) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                text = title,
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            content()
        }
    }
}

@Composable
private fun SubtasksSection(
    subtasks: List<SubtaskItem>,
    onAdd: (String) -> Unit,
    onToggle: (String) -> Unit,
    onDelete: (String) -> Unit,
) {
    var newTitle by remember { mutableStateOf("") }
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        if (subtasks.isEmpty()) {
            Text(
                text = stringResource(R.string.detail_subtask_empty),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        } else {
            subtasks.forEach { item ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Checkbox(
                        checked = item.isDone,
                        onCheckedChange = { onToggle(item.id) },
                    )
                    Text(
                        text = item.title,
                        style =
                            if (item.isDone) {
                                MaterialTheme.typography.bodyMedium.copy(
                                    textDecoration = TextDecoration.LineThrough,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                            } else {
                                MaterialTheme.typography.bodyMedium
                            },
                        modifier = Modifier.weight(1f),
                    )
                    IconButton(onClick = { onDelete(item.id) }) {
                        Text("✕", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
        Row(
            modifier = Modifier.fillMaxWidth().padding(top = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            OutlinedTextField(
                value = newTitle,
                onValueChange = { newTitle = it },
                modifier = Modifier.weight(1f),
                label = { Text(stringResource(R.string.detail_subtask_placeholder)) },
                singleLine = true,
            )
            Button(
                onClick = {
                    if (newTitle.isNotBlank()) {
                        onAdd(newTitle.trim())
                        newTitle = ""
                    }
                },
                enabled = newTitle.isNotBlank(),
            ) {
                Text(stringResource(R.string.detail_subtask_add))
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun EstimateSection(
    estimatedMinutes: Int?,
    onPick: (Int?) -> Unit,
) {
    val quickOptions = listOf(15, 30, 45, 60, 90, 120)
    var customText by remember(estimatedMinutes) {
        mutableStateOf(if (estimatedMinutes != null && estimatedMinutes !in quickOptions) estimatedMinutes.toString() else "")
    }
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            for (min in quickOptions) {
                val selected = estimatedMinutes == min
                FilterChip(
                    selected = selected,
                    onClick = {
                        if (selected) onPick(null)
                        else onPick(min)
                    },
                    label = { Text("${min}m") },
                )
            }
            if (estimatedMinutes != null) {
                AssistChip(
                    onClick = { onPick(null) },
                    label = { Text(stringResource(R.string.detail_estimate_clear)) },
                )
            }
        }
        OutlinedTextField(
            value = customText,
            onValueChange = { input ->
                val digits = input.filter { it.isDigit() }
                customText = digits
                val parsed = digits.toIntOrNull()
                onPick(if (parsed != null && parsed > 0) parsed else null)
            },
            label = { Text(stringResource(R.string.detail_estimate_custom) + " (min)") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun RecurrenceSection(
    recurrence: RecurrenceConfig?,
    onChange: (RecurrenceConfig?) -> Unit,
) {
    var open by remember { mutableStateOf(false) }
    val currentPattern = recurrence?.pattern
    val patternLabels =
        mapOf(
            null to stringResource(R.string.detail_recurrence_none),
            "DAILY" to stringResource(R.string.detail_recurrence_daily),
            "WEEKLY" to stringResource(R.string.detail_recurrence_weekly),
            "MONTHLY" to stringResource(R.string.detail_recurrence_monthly),
        )
    val display = patternLabels[currentPattern] ?: stringResource(R.string.detail_recurrence_none)
    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Box {
            OutlinedButton(onClick = { open = true }, modifier = Modifier.fillMaxWidth()) {
                Text(display)
            }
            DropdownMenu(expanded = open, onDismissRequest = { open = false }) {
                DropdownMenuItem(
                    text = { Text(stringResource(R.string.detail_recurrence_none)) },
                    onClick = {
                        onChange(null)
                        open = false
                    },
                )
                DropdownMenuItem(
                    text = { Text(stringResource(R.string.detail_recurrence_daily)) },
                    onClick = {
                        onChange(RecurrenceConfig(pattern = "DAILY", interval = 1))
                        open = false
                    },
                )
                DropdownMenuItem(
                    text = { Text(stringResource(R.string.detail_recurrence_weekly)) },
                    onClick = {
                        onChange(RecurrenceConfig(pattern = "WEEKLY", interval = 1, daysOfWeek = listOf(1)))
                        open = false
                    },
                )
                DropdownMenuItem(
                    text = { Text(stringResource(R.string.detail_recurrence_monthly)) },
                    onClick = {
                        onChange(RecurrenceConfig(pattern = "MONTHLY", interval = 1))
                        open = false
                    },
                )
            }
        }
        if (recurrence?.pattern == "WEEKLY") {
            val selectedDays = recurrence.daysOfWeek ?: emptyList()
            val dayNames = listOf("L", "M", "X", "J", "V", "S", "D")
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                modifier = Modifier.fillMaxWidth(),
            ) {
                for (dayIndex in 1..7) {
                    val active = dayIndex in selectedDays
                    FilterChip(
                        selected = active,
                        onClick = {
                            val nextDays =
                                if (active) {
                                    (selectedDays - dayIndex).ifEmpty { listOf(dayIndex) }
                                } else {
                                    (selectedDays + dayIndex).sorted()
                                }
                            onChange(recurrence.copy(daysOfWeek = nextDays))
                        },
                        label = { Text(dayNames[dayIndex - 1]) },
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun TagsSection(
    tags: List<TaskTag>,
    availableTags: List<TaskTag>,
    onAssign: (TaskTag) -> Unit,
    onRemove: (String) -> Unit,
    onCreate: (String) -> Unit,
) {
    var menuOpen by remember { mutableStateOf(false) }
    var createDialogOpen by remember { mutableStateOf(false) }
    var newTagName by remember { mutableStateOf("") }

    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(
            text = stringResource(R.string.detail_group_tags),
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        if (tags.isEmpty()) {
            Text(
                text = stringResource(R.string.detail_tag_empty),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        } else {
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                for (tag in tags) {
                    InputChip(
                        selected = false,
                        onClick = {},
                        label = { Text(tag.name) },
                        trailingIcon = {
                            IconButton(
                                onClick = { onRemove(tag.id) },
                                modifier = Modifier.size(18.dp),
                            ) {
                                Text("✕", style = MaterialTheme.typography.labelSmall)
                            }
                        },
                    )
                }
            }
        }
        val unassigned = availableTags.filter { avail -> tags.none { it.id == avail.id } }
        Box {
            OutlinedButton(
                onClick = { menuOpen = true },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(stringResource(R.string.detail_tag_add))
            }
            DropdownMenu(expanded = menuOpen, onDismissRequest = { menuOpen = false }) {
                DropdownMenuItem(
                    text = { Text("+ " + stringResource(R.string.detail_tag_create)) },
                    onClick = {
                        menuOpen = false
                        createDialogOpen = true
                    },
                )
                for (avail in unassigned) {
                    DropdownMenuItem(
                        text = { Text(avail.name) },
                        onClick = {
                            onAssign(avail)
                            menuOpen = false
                        },
                    )
                }
            }
        }
    }
    if (createDialogOpen) {
        AlertDialog(
            onDismissRequest = { createDialogOpen = false },
            title = { Text(stringResource(R.string.detail_tag_create)) },
            text = {
                OutlinedTextField(
                    value = newTagName,
                    onValueChange = { newTagName = it },
                    label = { Text(stringResource(R.string.detail_tag_name)) },
                    singleLine = true,
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newTagName.isNotBlank()) {
                            onCreate(newTagName.trim())
                            newTagName = ""
                            createDialogOpen = false
                        }
                    },
                    enabled = newTagName.isNotBlank(),
                ) {
                    Text(stringResource(R.string.actions_save))
                }
            },
            dismissButton = {
                TextButton(onClick = { createDialogOpen = false }) {
                    Text(stringResource(R.string.actions_cancel))
                }
            },
        )
    }
}

@Composable
private fun PriorityPicker(current: String, onPick: (String) -> Unit) {
    var open by remember { mutableStateOf(false) }
    val labels =
        mapOf(
            "LOW" to stringResource(R.string.detail_priority_low),
            "MEDIUM" to stringResource(R.string.detail_priority_medium),
            "HIGH" to stringResource(R.string.detail_priority_high),
            "URGENT" to stringResource(R.string.detail_priority_urgent),
        )
    Column(Modifier.fillMaxWidth()) {
        Text(
            text = stringResource(R.string.detail_priority_label),
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Box {
            OutlinedButton(onClick = { open = true }, modifier = Modifier.fillMaxWidth()) {
                Text(labels.getValue(current))
            }
            DropdownMenu(expanded = open, onDismissRequest = { open = false }) {
                for (priority in PRIORITIES) {
                    DropdownMenuItem(
                        text = { Text(labels.getValue(priority)) },
                        onClick = {
                            onPick(priority)
                            open = false
                        },
                    )
                }
            }
        }
    }
}

@Composable
private fun ProjectPicker(
    currentId: String?,
    projects: List<NativeProject>,
    onPick: (String?) -> Unit,
) {
    var open by remember { mutableStateOf(false) }
    val none = stringResource(R.string.detail_no_project)
    val currentName = projects.firstOrNull { it.id == currentId }?.name ?: none
    Column(Modifier.fillMaxWidth()) {
        Text(
            text = stringResource(R.string.detail_project_label),
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Box {
            OutlinedButton(onClick = { open = true }, modifier = Modifier.fillMaxWidth()) {
                Text(currentName)
            }
            DropdownMenu(expanded = open, onDismissRequest = { open = false }) {
                DropdownMenuItem(
                    text = { Text(none) },
                    onClick = {
                        onPick(null)
                        open = false
                    },
                )
                for (project in projects) {
                    DropdownMenuItem(
                        text = { Text(project.name) },
                        onClick = {
                            onPick(project.id)
                            open = false
                        },
                    )
                }
            }
        }
    }
}
