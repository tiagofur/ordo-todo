package dev.creapolis.ordotodo.hoy

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
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
import androidx.compose.ui.unit.dp
import dev.creapolis.ordotodo.R
import dev.creapolis.ordotodo.data.NativeProject

private val PRIORITIES = listOf("LOW", "MEDIUM", "HIGH", "URGENT")

/**
 * Grouped M3 edit form (F1d). The caller owns [state]; save sends only the
 * diff via `PATCH /tasks/:id`, so untouched fields never travel.
 */
@Composable
fun TaskDetailScreen(
    state: TaskEditState,
    projects: List<NativeProject>,
    focusActive: Boolean,
    onEdit: ((TaskEditState) -> TaskEditState) -> Unit,
    onSave: () -> Unit,
    onRetry: () -> Unit,
    onClose: () -> Unit,
    onStartFocus: () -> Unit,
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
                DetailForm(state, projects, focusActive, onEdit, onSave, onStartFocus)
            }
        }
    }
}

@Composable
private fun DetailForm(
    state: TaskEditState,
    projects: List<NativeProject>,
    focusActive: Boolean,
    onEdit: ((TaskEditState) -> TaskEditState) -> Unit,
    onSave: () -> Unit,
    onStartFocus: () -> Unit,
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
