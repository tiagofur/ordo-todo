package dev.creapolis.ordotodo.tasks

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.ListItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MediumTopAppBar
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import dev.creapolis.ordotodo.R
import dev.creapolis.ordotodo.data.QuickResult
import dev.creapolis.ordotodo.data.shouldSearchServer
import dev.creapolis.ordotodo.hoy.HoyViewModel
import dev.creapolis.ordotodo.hoy.TaskRow

private enum class TasksFilter {
    UPCOMING,
    UNDATED,
    PROJECTS,
}

/**
 * Tareas tab (F3b): Próximas · Sin fecha · Proyectos with search.
 * Rows and detail come from the Hoy machinery ([TaskRow] + shared
 * [HoyViewModel.openDetail]); the shell hosts the detail overlay.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TasksScreen(tasksViewModel: TasksViewModel, hoyViewModel: HoyViewModel) {
    val state by tasksViewModel.state.collectAsState()
    val refreshing by tasksViewModel.refreshing.collectAsState()
    val query by tasksViewModel.query.collectAsState()
    val serverResults by tasksViewModel.serverResults.collectAsState()
    val searching by tasksViewModel.searching.collectAsState()
    val projectFilter by tasksViewModel.projectFilter.collectAsState()
    val projects by tasksViewModel.projects.collectAsState()
    val snackbar = remember { SnackbarHostState() }
    val doneText = stringResource(R.string.today_marked_done)
    val pendingText = stringResource(R.string.today_marked_pending)
    val errorText = stringResource(R.string.auth_error_network)
    val pendingSyncText = stringResource(R.string.today_pending_sync)
    var filter by remember { mutableStateOf(TasksFilter.UPCOMING) }
    val scrollBehavior = TopAppBarDefaults.exitUntilCollapsedScrollBehavior()

    LaunchedEffect(tasksViewModel) {
        tasksViewModel.events.collect { snack ->
            val text =
                when (snack.message) {
                    R.string.today_marked_pending -> pendingText
                    R.string.today_pending_sync -> pendingSyncText
                    R.string.auth_error_network -> errorText
                    else -> doneText
                }
            snackbar.showSnackbar(message = text)
        }
    }

    Scaffold(
        modifier = Modifier.nestedScroll(scrollBehavior.nestedScrollConnection),
        containerColor = MaterialTheme.colorScheme.surfaceContainerLow,
        snackbarHost = { SnackbarHost(snackbar) },
        topBar = {
            MediumTopAppBar(
                title = {
                    Text(
                        text = stringResource(R.string.tasks_title),
                        style = MaterialTheme.typography.headlineSmall,
                    )
                },
                scrollBehavior = scrollBehavior,
            )
        },
    ) { inner ->
        Column(Modifier.fillMaxSize().padding(inner).padding(horizontal = 16.dp)) {
            OutlinedTextField(
                value = query,
                onValueChange = tasksViewModel::setQuery,
                placeholder = { Text(stringResource(R.string.tasks_search_hint)) },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                },
                trailingIcon = {
                    if (query.isNotEmpty()) {
                        IconButton(onClick = { tasksViewModel.setQuery("") }) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                },
                shape = CircleShape,
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.height(12.dp))
            SingleChoiceSegmentedButtonRow(Modifier.fillMaxWidth()) {
                SegmentedButton(
                    selected = filter == TasksFilter.UPCOMING,
                    onClick = { filter = TasksFilter.UPCOMING },
                    shape = SegmentedButtonDefaults.itemShape(index = 0, count = 3),
                ) {
                    Text(stringResource(R.string.tasks_upcoming))
                }
                SegmentedButton(
                    selected = filter == TasksFilter.UNDATED,
                    onClick = { filter = TasksFilter.UNDATED },
                    shape = SegmentedButtonDefaults.itemShape(index = 1, count = 3),
                ) {
                    Text(stringResource(R.string.tasks_undated))
                }
                SegmentedButton(
                    selected = filter == TasksFilter.PROJECTS,
                    onClick = { filter = TasksFilter.PROJECTS },
                    shape = SegmentedButtonDefaults.itemShape(index = 2, count = 3),
                ) {
                    Text(stringResource(R.string.tasks_projects))
                }
            }
            Spacer(Modifier.height(8.dp))
            when (val current = state) {
                is TasksUiState.Loading -> {
                    Column(
                        Modifier.fillMaxWidth().padding(vertical = 48.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        CircularProgressIndicator()
                    }
                }
                is TasksUiState.Offline -> {
                    Column(Modifier.fillMaxWidth().padding(vertical = 48.dp)) {
                        Text(
                            text = errorText,
                            style = MaterialTheme.typography.bodyLarge,
                        )
                        Spacer(Modifier.height(16.dp))
                        Button(onClick = tasksViewModel::refresh) {
                            Text(stringResource(R.string.today_empty_retry))
                        }
                    }
                }
                is TasksUiState.Content -> {
                    val visible =
                        when (filter) {
                            TasksFilter.UPCOMING ->
                                current.sections.filter { it.kind == TasksSectionKind.UPCOMING }
                            TasksFilter.UNDATED ->
                                current.sections.filter { it.kind == TasksSectionKind.UNDATED }
                            TasksFilter.PROJECTS -> current.sections
                        }
                    PullToRefreshBox(
                        isRefreshing = refreshing,
                        onRefresh = tasksViewModel::pullToRefresh,
                        modifier = Modifier.fillMaxSize(),
                    ) {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            verticalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            if (filter == TasksFilter.PROJECTS) {
                                item(key = "project-chips") {
                                    Column {
                                        androidx.compose.foundation.lazy.LazyRow(
                                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                                        ) {
                                            item(key = "all") {
                                                FilterChip(
                                                    selected = projectFilter == null,
                                                    onClick = { tasksViewModel.setProject(null) },
                                                    label = { Text(stringResource(R.string.tasks_all_projects)) },
                                                )
                                            }
                                            items(projects, key = { it.id }) { project ->
                                                FilterChip(
                                                    selected = projectFilter == project.id,
                                                    onClick = { tasksViewModel.setProject(project.id) },
                                                    label = { Text(project.name) },
                                                )
                                            }
                                        }
                                        Spacer(Modifier.height(8.dp))
                                    }
                                }
                            }
                            if (visible.flatMap { it.tasks }.isEmpty()) {
                                item(key = "empty") {
                                    Column(Modifier.fillMaxWidth().padding(vertical = 48.dp)) {
                                        Text(
                                            text = stringResource(R.string.tasks_empty),
                                            style = MaterialTheme.typography.titleLarge,
                                        )
                                    }
                                }
                            }
                            for (section in visible) {
                                if (section.tasks.isEmpty()) continue
                                item(key = "header-${section.kind}") {
                                    Text(
                                        text =
                                            when (section.kind) {
                                                TasksSectionKind.UPCOMING ->
                                                    stringResource(R.string.tasks_upcoming)
                                                TasksSectionKind.UNDATED ->
                                                    stringResource(R.string.tasks_undated)
                                                TasksSectionKind.DONE ->
                                                    stringResource(R.string.today_sections_done, section.tasks.size)
                                            },
                                        style = MaterialTheme.typography.labelLarge,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        modifier = Modifier.padding(top = 12.dp, bottom = 2.dp),
                                    )
                                }
                                items(section.tasks, key = { "task-${it.id}" }) { task ->
                                    TaskRow(
                                        task = task,
                                        onToggle = tasksViewModel::toggle,
                                        onOpen = hoyViewModel::openDetail,
                                        onRescheduleTomorrow = hoyViewModel::rescheduleTaskToTomorrow,
                                        onChangePriority = hoyViewModel::updateTaskPriority,
                                        onMoveProject = hoyViewModel::moveTaskToProject,
                                        onDelete = hoyViewModel::deleteTaskWithUndo,
                                        projects = projects,
                                    )
                                }
                            }
                            if (shouldSearchServer(query)) {
                                item(key = "header-server") {
                                    Text(
                                        text = stringResource(R.string.tasks_server_title),
                                        style = MaterialTheme.typography.labelLarge,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        modifier = Modifier.padding(top = 12.dp, bottom = 2.dp),
                                    )
                                }
                                if (searching) {
                                    item(key = "server-loading") {
                                        LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
                                    }
                                } else if (serverResults.isEmpty()) {
                                    item(key = "server-empty") {
                                        Text(
                                            text = stringResource(R.string.tasks_server_empty),
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                                            modifier = Modifier.padding(vertical = 4.dp),
                                        )
                                    }
                                } else {
                                    items(serverResults, key = { "server-${it.id}" }) { hit ->
                                        ServerHitRow(
                                            hit = hit,
                                            onClick = {
                                                tasksViewModel.openServerResult(
                                                    hit,
                                                    hoyViewModel::openDetail,
                                                )
                                            },
                                        )
                                    }
                                }
                            }
                            if (current.isOffline) {
                                item(key = "offline-note") {
                                    Text(
                                        text = stringResource(R.string.tasks_offline),
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        modifier = Modifier.padding(vertical = 8.dp),
                                    )
                                }
                            }
                            item { Spacer(Modifier.height(24.dp)) }
                        }
                    }
                }
            }
        }
    }
}

/** One server-wide hit: tasks open the detail, projects become the tab filter. */
@Composable
private fun ServerHitRow(hit: QuickResult, onClick: () -> Unit) {
    val isProject = hit.type == "project"
    ListItem(
        headlineContent = { Text(hit.title) },
        supportingContent = { hit.subtitle?.let { Text(it) } },
        leadingContent = {
            Icon(
                imageVector = if (isProject) Icons.Default.Info else Icons.Default.CheckCircle,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        },
        modifier = Modifier.clickable(onClick = onClick),
    )
}
