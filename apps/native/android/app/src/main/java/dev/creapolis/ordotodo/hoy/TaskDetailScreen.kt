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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.PlayArrow
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
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.InputChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import dev.creapolis.ordotodo.R
import dev.creapolis.ordotodo.data.NativeProject
import dev.creapolis.ordotodo.data.RecurrenceConfig
import dev.creapolis.ordotodo.data.SubtaskItem
import dev.creapolis.ordotodo.data.TaskTag

private val PRIORITIES = listOf("LOW", "MEDIUM", "HIGH", "URGENT")

/**
 * Native Material 3 task detail screen (S20/T19).
 * Features a top-level Scaffold, TopAppBar with back navigation, save checkmark,
 * start focus icon, overflow menu, and fluid borderless typography for title and notes.
 */
@OptIn(ExperimentalMaterial3Api::class)
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

    val original = state.original
    val dirty = original != null && buildTaskPatch(original, state.edited()) != null
    val dateBad = state.scheduledDate.isNotBlank() && parseDateText(state.scheduledDate) == null
    val timeBad = state.scheduledTime.isNotBlank() && parseTimeText(state.scheduledTime) == null
    val dueBad = state.dueDate.isNotBlank() && parseDateText(state.dueDate) == null
    val valid = state.title.isNotBlank() && !dateBad && !timeBad && !dueBad

    var showMenu by remember { mutableStateOf(false) }
    var showDeleteConfirm by remember { mutableStateOf(false) }

    if (showDeleteConfirm) {
        AlertDialog(
            onDismissRequest = { showDeleteConfirm = false },
            title = { Text(stringResource(R.string.detail_delete_task)) },
            text = { Text(stringResource(R.string.detail_delete_task) + "?") },
            confirmButton = {
                TextButton(
                    onClick = {
                        showDeleteConfirm = false
                        onDeleteTask()
                    },
                    colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error),
                ) {
                    Text(stringResource(R.string.actions_delete))
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteConfirm = false }) {
                    Text(stringResource(R.string.actions_cancel))
                }
            },
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = stringResource(R.string.detail_title),
                        style = MaterialTheme.typography.titleMedium,
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onClose) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = stringResource(R.string.detail_back),
                        )
                    }
                },
                actions = {
                    if (dirty && valid) {
                        IconButton(onClick = onSave, enabled = !state.saving) {
                            if (state.saving) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(20.dp),
                                    strokeWidth = 2.dp,
                                )
                            } else {
                                Icon(
                                    imageVector = Icons.Default.Check,
                                    contentDescription = stringResource(R.string.actions_save),
                                    tint = MaterialTheme.colorScheme.primary,
                                )
                            }
                        }
                    }
                    IconButton(onClick = onStartFocus, enabled = !focusActive) {
                        Icon(
                            imageVector = Icons.Default.PlayArrow,
                            contentDescription = stringResource(R.string.actions_start_focus),
                        )
                    }
                    Box {
                        IconButton(onClick = { showMenu = true }) {
                            Icon(
                                imageVector = Icons.Default.MoreVert,
                                contentDescription = stringResource(R.string.actions_more_options),
                            )
                        }
                        DropdownMenu(
                            expanded = showMenu,
                            onDismissRequest = { showMenu = false },
                        ) {
                            DropdownMenuItem(
                                text = {
                                    Text(
                                        stringResource(R.string.detail_delete_task),
                                        color = MaterialTheme.colorScheme.error,
                                    )
                                },
                                onClick = {
                                    showMenu = false
                                    showDeleteConfirm = true
                                },
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface,
                ),
            )
        },
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
        ) {
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
                        dirty = dirty,
                        valid = valid,
                        onEdit = onEdit,
                        onSave = onSave,
                        onAddSubtask = onAddSubtask,
                        onToggleSubtask = onToggleSubtask,
                        onDeleteSubtask = onDeleteSubtask,
                        onAssignTag = onAssignTag,
                        onRemoveTag = onRemoveTag,
                        onCreateTag = onCreateTag,
                    )
                }
            }
        }
    }
}

@Composable
private fun DetailForm(
    state: TaskEditState,
    projects: List<NativeProject>,
    availableTags: List<TaskTag>,
    dirty: Boolean,
    valid: Boolean,
    onEdit: ((TaskEditState) -> TaskEditState) -> Unit,
    onSave: () -> Unit,
    onAddSubtask: (String) -> Unit,
    onToggleSubtask: (String) -> Unit,
    onDeleteSubtask: (String) -> Unit,
    onAssignTag: (TaskTag) -> Unit,
    onRemoveTag: (String) -> Unit,
    onCreateTag: (String) -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        // Fluid, borderless title field
        TextField(
            value = state.title,
            onValueChange = { text -> onEdit { it.copy(title = text) } },
            modifier = Modifier.fillMaxWidth(),
            placeholder = {
                Text(
                    text = stringResource(R.string.detail_title_label),
                    style = MaterialTheme.typography.headlineSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
                )
            },
            textStyle = MaterialTheme.typography.headlineSmall.copy(
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface,
            ),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color.Transparent,
                unfocusedContainerColor = Color.Transparent,
                disabledContainerColor = Color.Transparent,
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
            ),
            singleLine = false,
            maxLines = 4,
        )

        // Fluid, borderless notes / description field
        TextField(
            value = state.description,
            onValueChange = { text -> onEdit { it.copy(description = text) } },
            modifier = Modifier.fillMaxWidth(),
            placeholder = {
                Text(
                    text = stringResource(R.string.detail_description_label),
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
                )
            },
            textStyle = MaterialTheme.typography.bodyLarge.copy(
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            ),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color.Transparent,
                unfocusedContainerColor = Color.Transparent,
                disabledContainerColor = Color.Transparent,
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
            ),
            minLines = 2,
        )

        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f))

        // Schedule properties (Fecha, Hora, Vence)
        SectionCard(title = stringResource(R.string.detail_group_schedule)) {
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

        // Subtasks (Subtareas)
        SectionCard(title = stringResource(R.string.detail_group_subtasks)) {
            SubtasksSection(
                subtasks = state.subTasks,
                onAdd = onAddSubtask,
                onToggle = onToggleSubtask,
                onDelete = onDeleteSubtask,
            )
        }

        // Priority & Project
        SectionCard(title = stringResource(R.string.detail_group_classify)) {
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

        // Estimate & Recurrence
        SectionCard(title = stringResource(R.string.detail_group_estimate)) {
            EstimateSection(
                estimatedMinutes = state.estimatedMinutes,
                onPick = { minutes -> onEdit { it.copy(estimatedMinutes = minutes) } },
            )
        }

        SectionCard(title = stringResource(R.string.detail_group_recurrence)) {
            RecurrenceSection(
                recurrence = state.recurrence,
                onChange = { rec -> onEdit { it.copy(recurrence = rec) } },
            )
        }

        if (dirty && valid) {
            Button(
                onClick = onSave,
                enabled = !state.saving,
                modifier = Modifier.fillMaxWidth().padding(top = 8.dp, bottom = 24.dp),
            ) {
                if (state.saving) {
                    CircularProgressIndicator(modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                } else {
                    Text(stringResource(R.string.actions_save))
                }
            }
        } else {
            Spacer(Modifier.height(24.dp))
        }
    }
}

@Composable
private fun SectionCard(title: String, content: @Composable () -> Unit) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(
            Modifier.fillMaxWidth().padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.primary,
                fontWeight = FontWeight.SemiBold,
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
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
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
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = stringResource(R.string.actions_delete),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(18.dp),
                        )
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
                placeholder = { Text(stringResource(R.string.detail_subtask_placeholder)) },
                singleLine = true,
            )
            IconButton(
                onClick = {
                    if (newTitle.isNotBlank()) {
                        onAdd(newTitle.trim())
                        newTitle = ""
                    }
                },
                enabled = newTitle.isNotBlank(),
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = stringResource(R.string.detail_subtask_add),
                    tint = if (newTitle.isNotBlank()) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f),
                )
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
                                Icon(
                                    imageVector = Icons.Default.Close,
                                    contentDescription = stringResource(R.string.actions_delete),
                                    modifier = Modifier.size(14.dp),
                                )
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

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun PriorityPicker(current: String, onPick: (String) -> Unit) {
    val labels =
        mapOf(
            "LOW" to stringResource(R.string.detail_priority_low),
            "MEDIUM" to stringResource(R.string.detail_priority_medium),
            "HIGH" to stringResource(R.string.detail_priority_high),
            "URGENT" to stringResource(R.string.detail_priority_urgent),
        )
    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(
            text = stringResource(R.string.detail_priority_label),
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth(),
        ) {
            for (priority in PRIORITIES) {
                val selected = current == priority
                FilterChip(
                    selected = selected,
                    onClick = { onPick(priority) },
                    label = { Text(labels.getValue(priority)) },
                )
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
    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(6.dp)) {
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
