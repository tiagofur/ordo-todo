package dev.creapolis.ordotodo.habits

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import dev.creapolis.ordotodo.R
import dev.creapolis.ordotodo.data.HabitToday
import dev.creapolis.ordotodo.hoy.HabitRow
import dev.creapolis.ordotodo.hoy.HoyViewModel

private val MOMENT_ORDER = listOf("MORNING", "AFTERNOON", "EVENING", null)

/** Pure grouping for tests: habits bucketed by moment, unknown last. */
fun groupHabitsByMoment(habits: List<HabitToday>): List<Pair<String?, List<HabitToday>>> {
    val byMoment = habits.groupBy { if (it.timeOfDay in MOMENT_ORDER.dropLast(1)) it.timeOfDay else null }
    return MOMENT_ORDER.map { moment -> moment to (byMoment[moment].orEmpty()) }
        .filter { it.second.isNotEmpty() }
}

/**
 * Hábitos tab (F3b): the full day list grouped by moment with working
 * check-in. Create/edit arrives in F3c; this tab shows no dead buttons.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HabitsScreen(viewModel: HoyViewModel) {
    val habitsState by viewModel.habitsState.collectAsState()
    val refreshing by viewModel.refreshing.collectAsState()
    val snackbar = remember { SnackbarHostState() }
    val doneText = stringResource(R.string.habits_done)
    val undoneText = stringResource(R.string.habits_undone)
    val createdText = stringResource(R.string.habits_created)
    val updatedText = stringResource(R.string.habits_updated)
    val deletedText = stringResource(R.string.habits_deleted)
    val errorText = stringResource(R.string.auth_error_network)
    val scrollBehavior = TopAppBarDefaults.pinnedScrollBehavior()

    LaunchedEffect(viewModel) {
        viewModel.events.collect { snack ->
            val text =
                when (snack.message) {
                    R.string.habits_done -> doneText
                    R.string.habits_undone -> undoneText
                    R.string.habits_created -> createdText
                    R.string.habits_updated -> updatedText
                    R.string.habits_deleted -> deletedText
                    R.string.auth_error_network -> errorText
                    else -> return@collect
                }
            snackbar.showSnackbar(message = text)
        }
    }

    Scaffold(
        modifier = Modifier.nestedScroll(scrollBehavior.nestedScrollConnection),
        snackbarHost = { SnackbarHost(snackbar) },
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.habits_title)) },
                scrollBehavior = scrollBehavior,
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = viewModel::openHabitCreate,
            ) {
                Icon(
                    Icons.Default.Add,
                    contentDescription = stringResource(R.string.habits_create_title),
                )
            }
        },
    ) { inner ->
        Column(Modifier.fillMaxSize().padding(inner).padding(horizontal = 16.dp)) {
            if (!habitsState.loaded) {
                Column(
                    Modifier.fillMaxWidth().padding(vertical = 48.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    CircularProgressIndicator()
                }
                return@Column
            }
            if (habitsState.habits.isEmpty()) {
                Column(Modifier.fillMaxWidth().padding(vertical = 48.dp)) {
                    Text(
                        text = stringResource(R.string.habits_empty),
                        style = MaterialTheme.typography.titleLarge,
                    )
                    if (habitsState.isOffline || habitsState.failed) {
                        Spacer(Modifier.height(16.dp))
                        Button(onClick = viewModel::refresh) {
                            Text(stringResource(R.string.today_empty_retry))
                        }
                    }
                }
                return@Column
            }
            PullToRefreshBox(
                isRefreshing = refreshing,
                onRefresh = viewModel::pullToRefresh,
                modifier = Modifier.fillMaxSize(),
            ) {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    for ((moment, group) in groupHabitsByMoment(habitsState.habits)) {
                        item(key = "habit-header-$moment") {
                            Text(
                                text =
                                    when (moment) {
                                        "MORNING" -> stringResource(R.string.today_sections_morning)
                                        "AFTERNOON" -> stringResource(R.string.today_sections_afternoon)
                                        "EVENING" -> stringResource(R.string.today_sections_evening)
                                        else -> stringResource(R.string.today_sections_anytime)
                                    },
                                style = MaterialTheme.typography.labelLarge,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(top = 12.dp, bottom = 2.dp),
                            )
                        }
                        items(group, key = { "habit-${it.id}" }) { habit ->
                            HabitRow(
                                habit = habit,
                                onToggle = viewModel::toggleHabit,
                                onOpen = viewModel::openHabitEdit,
                            )
                        }
                    }
                    if (habitsState.isOffline) {
                        item(key = "habits-offline") {
                            Text(
                                text = stringResource(R.string.habits_offline),
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
