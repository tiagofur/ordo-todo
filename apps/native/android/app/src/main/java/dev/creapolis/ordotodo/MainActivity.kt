package dev.creapolis.ordotodo

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationRail
import androidx.compose.material3.NavigationRailItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.compose.runtime.rememberCoroutineScope
import kotlinx.coroutines.launch
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import dev.creapolis.ordotodo.auth.AuthScreen
import dev.creapolis.ordotodo.auth.AuthViewModel
import dev.creapolis.ordotodo.data.ApiClient
import dev.creapolis.ordotodo.data.AuthSession
import dev.creapolis.ordotodo.data.DayStore
import dev.creapolis.ordotodo.data.SessionStore
import dev.creapolis.ordotodo.data.HabitsRepository
import dev.creapolis.ordotodo.data.TasksRepository
import dev.creapolis.ordotodo.data.TimerRepository
import dev.creapolis.ordotodo.focus.FocusAlarms
import dev.creapolis.ordotodo.focus.FocusNotifications
import dev.creapolis.ordotodo.focus.FocusStore
import dev.creapolis.ordotodo.focus.FocusViewModel
import dev.creapolis.ordotodo.R
import dev.creapolis.ordotodo.habits.HabitSheet
import dev.creapolis.ordotodo.capture.extractSharedText
import dev.creapolis.ordotodo.habits.HabitsScreen
import dev.creapolis.ordotodo.hoy.HoyScreen
import dev.creapolis.ordotodo.hoy.HoyUiState
import dev.creapolis.ordotodo.hoy.HoyViewModel
import dev.creapolis.ordotodo.reminders.HabitReminders
import dev.creapolis.ordotodo.reminders.TaskReminders
import dev.creapolis.ordotodo.widget.refreshOrdoWidget
import dev.creapolis.ordotodo.hoy.TaskDetailScreen
import dev.creapolis.ordotodo.settings.AppSettings
import dev.creapolis.ordotodo.settings.SettingsLogic
import dev.creapolis.ordotodo.settings.SettingsScreen
import dev.creapolis.ordotodo.tasks.TasksScreen
import dev.creapolis.ordotodo.tasks.TasksViewModel
import dev.creapolis.ordotodo.ui.theme.OrdoTheme
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.first

class MainActivity : ComponentActivity() {
    companion object {
        /** Keep in sync with shortcuts.xml and the tile (F4a). */
        const val ACTION_CAPTURE = "ordo.action.CAPTURE"
    }

    private val launchIntents = MutableStateFlow<Intent?>(null)

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        launchIntents.value = intent
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        val session = SessionStore.from(applicationContext)
        val api = ApiClient(BuildConfig.API_BASE_URL, session)
        val auth = AuthSession(api, session)
        val tasks = TasksRepository(api)
        val habits = HabitsRepository(api)
        val day = DayStore.from(applicationContext)
        val timers = TimerRepository(api)
        val focusStore = FocusStore.from(applicationContext)
        val focusNotifs = FocusNotifications(applicationContext)
        val focusAlarms = FocusAlarms(applicationContext)
        val appSettings = AppSettings.from(applicationContext)

        // Seed external intents (tile, shortcut, share, widget) only on a fresh
        // start: getIntent() returns the ORIGINAL intent after a config change
        // (rotation, font scale), and re-seeding would reopen capture and drop
        // the typed text. ViewModels survive recreation, so nothing is lost.
        if (savedInstanceState == null) launchIntents.value = intent
        setContent {
            // Pre-051 builds stored tokens in plaintext; seal them once (ODD 051 S3).
            LaunchedEffect(session) { session.migrateLegacy() }
            val themeMode by appSettings.themeMode.collectAsStateWithLifecycle(
                initialValue = SettingsLogic.THEME_SYSTEM,
            )
            val dynamicColor by appSettings.dynamicColor.collectAsStateWithLifecycle(initialValue = false)
            OrdoTheme(
                darkTheme = SettingsLogic.resolveDarkTheme(themeMode, isSystemInDarkTheme()),
                dynamicColor = dynamicColor,
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background,
                ) {
                    OrdoRoot(session, auth, tasks, habits, day, timers, focusStore, focusNotifs, focusAlarms, launchIntents, appSettings)
                }
            }
        }
    }
}

@Suppress("UNCHECKED_CAST")
private fun <T : ViewModel> factory(create: () -> T): ViewModelProvider.Factory =
    object : ViewModelProvider.Factory {
        override fun <M : ViewModel> create(modelClass: Class<M>): M = create() as M
    }

/**
 * Signed in when tokens exist. The flow also drives sign-out: a failed
 * refresh clears the store and this root falls back to [AuthScreen].
 */
@Composable
private fun OrdoRoot(
    session: SessionStore,
    auth: AuthSession,
    tasks: TasksRepository,
    habits: HabitsRepository,
    day: DayStore,
    timers: TimerRepository,
    focusStore: FocusStore,
    focusNotifs: FocusNotifications,
    focusAlarms: FocusAlarms,
    launchIntents: MutableStateFlow<Intent?>,
    settings: AppSettings,
) {
    val tokens by session.tokens.collectAsStateWithLifecycle(initialValue = null)
    var ready by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) {
        session.tokens.first()
        ready = true
    }
    if (!ready) {
        Box(Modifier.fillMaxSize())
        return
    }
    if (tokens != null) {
        val appContext = LocalContext.current.applicationContext
        val hoy: HoyViewModel =
            viewModel(factory = factory { HoyViewModel(tasks, habits, day, session, settings = settings) })
        val focus: FocusViewModel =
            viewModel(
                factory =
                    factory {
                        FocusViewModel(timers, focusStore, focusNotifs, focusAlarms, session, appContext)
                    },
            )
        val taskList: TasksViewModel =
            viewModel(factory = factory { TasksViewModel(tasks, session, day) { hoy.refresh() } })
        SideEffect { hoy.onQueueChanged = taskList::reloadQuietly }
        OrdoNav(hoy = hoy, focus = focus, taskList = taskList, session = session, launchIntents = launchIntents, settings = settings, timers = timers)
    } else {
        val login: AuthViewModel = viewModel(factory = factory { AuthViewModel(auth) })
        AuthScreen(login)
    }
}

private enum class OrdoTab {
    HOY,
    TAREAS,
    HABITOS,
    AJUSTES,
}

/**
 * App shell (F3b): Material 3 navigation — bar on compact width, rail
 * on expanded width — over the four day-companion destinations.
 * The task detail overlay lives here so rows from Hoy and Tareas open
 * the same screen; starting focus always hands off to the Hoy tab.
 */
@Composable
private fun OrdoNav(
    hoy: HoyViewModel,
    focus: FocusViewModel,
    taskList: TasksViewModel,
    session: SessionStore,
    launchIntents: MutableStateFlow<Intent?>,
    settings: AppSettings,
    timers: TimerRepository,
) {
    var tab by remember { mutableStateOf(OrdoTab.HOY) }
    val context = LocalContext.current
    val dayState by hoy.state.collectAsStateWithLifecycle()
    val habitsUi by hoy.habitsState.collectAsStateWithLifecycle()
    val reminderLead by settings.reminderLeadMinutes.collectAsStateWithLifecycle(initialValue = 0)
    // Push the cached snapshot to the Glance widget and rebuild the
    // reminder alarms on every fresh load.
    LaunchedEffect(dayState, habitsUi, reminderLead) {
        val app = context.applicationContext
        if (dayState is HoyUiState.Content) {
            refreshOrdoWidget(context)
            val allTasks = (dayState as HoyUiState.Content).sections.flatMap { it.tasks }
            TaskReminders(app).rescheduleAll(allTasks, reminderLead)
        }
        if (habitsUi.canScheduleReminders) HabitReminders(app).rescheduleAll(habitsUi.habits)
    }
    val detail by hoy.detail.collectAsStateWithLifecycle()
    val habitEdit by hoy.habitEdit.collectAsStateWithLifecycle()
    val projects by hoy.projects.collectAsStateWithLifecycle()
    val availableTags by hoy.availableTags.collectAsStateWithLifecycle()
    val focusState by focus.focus.collectAsStateWithLifecycle()
    val launchIntent by launchIntents.collectAsStateWithLifecycle()
    LaunchedEffect(launchIntent) {
        val incoming = launchIntent ?: return@LaunchedEffect
        launchIntents.value = null
        when {
            incoming.action == MainActivity.ACTION_CAPTURE -> {
                tab = OrdoTab.HOY
                hoy.requestCapture("")
            }
            incoming.action == Intent.ACTION_SEND -> {
                val shared =
                    extractSharedText(
                        incoming.action,
                        incoming.type,
                        incoming.getCharSequenceExtra(Intent.EXTRA_TEXT)?.toString(),
                    )
                if (shared != null) {
                    tab = OrdoTab.HOY
                    hoy.requestCapture(shared)
                }
            }
        }
    }

    val wasOpen = remember { mutableStateOf(false) }
    LaunchedEffect(detail) {
        if (detail != null) {
            wasOpen.value = true
            if (tab != OrdoTab.HOY) hoy.ensureProjects()
        } else if (wasOpen.value) {
            wasOpen.value = false
            if (tab != OrdoTab.HOY) taskList.refresh()
        }
    }

    val labels =
        listOf(
            stringResource(R.string.tabs_today),
            stringResource(R.string.tabs_tasks),
            stringResource(R.string.tabs_habits),
            stringResource(R.string.tabs_settings),
        )
    val tabs = OrdoTab.entries
    BoxWithConstraints(Modifier.fillMaxSize()) {
        val expanded = maxWidth >= 600.dp
        if (expanded) {
            Row(Modifier.fillMaxSize()) {
                NavigationRail {
                    tabs.forEachIndexed { index, entry ->
                        NavigationRailItem(
                            selected = tab == entry,
                            onClick = { tab = entry },
                            icon = { NavIcon(entry) },
                            label = { Text(labels[index]) },
                        )
                    }
                }
                OrdoContent(tab, hoy, focus, taskList, session, settings, timers, Modifier.weight(1f))
            }
        } else {
            Scaffold(
                bottomBar = {
                    NavigationBar {
                        tabs.forEachIndexed { index, entry ->
                            NavigationBarItem(
                                selected = tab == entry,
                                onClick = { tab = entry },
                                icon = { NavIcon(entry) },
                                label = { Text(labels[index]) },
                            )
                        }
                    }
                },
            ) { inner ->
                OrdoContent(tab, hoy, focus, taskList, session, settings, timers, Modifier.fillMaxSize().padding(inner))
            }
        }
        val open = detail
        val decomposing by hoy.decomposing.collectAsStateWithLifecycle()
        val suggestions by hoy.suggestions.collectAsStateWithLifecycle()
        if (open != null) {
            TaskDetailScreen(
                state = open,
                projects = projects,
                availableTags = availableTags,
                focusActive = focusState != null,
                onEdit = hoy::updateDetail,
                onSave = hoy::saveDetail,
                onRetry = hoy::retryDetail,
                onClose = hoy::closeDetail,
                onStartFocus = {
                    hoy.requestFocusSheet(open.taskId, open.title)
                    hoy.closeDetail()
                    tab = OrdoTab.HOY
                },
                onAddSubtask = hoy::addSubtask,
                onToggleSubtask = hoy::toggleSubtask,
                onDeleteSubtask = hoy::deleteSubtask,
                onAssignTag = hoy::assignTag,
                onRemoveTag = hoy::removeTag,
                onCreateTag = hoy::createAndAssignTag,
                onDeleteTask = {
                    hoy.deleteTaskWithUndo(open.taskId)
                    hoy.closeDetail()
                },
                decomposing = decomposing,
                suggestions = suggestions,
                onSuggestSubtasks = hoy::suggestSubtasks,
                onAcceptSuggestion = hoy::acceptSuggestion,
                onDismissSuggestions = hoy::dismissSuggestions,
            )
        }
        val habitForm = habitEdit
        if (habitForm != null) {
            HabitSheet(
                state = habitForm,
                onEdit = hoy::updateHabitEdit,
                onSave = hoy::saveHabitEdit,
                onDelete = hoy::deleteHabit,
                onDismiss = hoy::closeHabitEdit,
            )
        }
    }
}

@Composable
private fun OrdoContent(
    tab: OrdoTab,
    hoy: HoyViewModel,
    focus: FocusViewModel,
    taskList: TasksViewModel,
    session: SessionStore,
    settings: AppSettings,
    timers: TimerRepository,
    modifier: Modifier = Modifier,
) {
    val scope = rememberCoroutineScope()
    AnimatedContent(
        targetState = tab,
        transitionSpec = { fadeIn() togetherWith fadeOut() },
        modifier = modifier,
        label = "TabContentAnimation",
    ) { currentTab ->
        when (currentTab) {
            OrdoTab.HOY -> HoyScreen(hoy, focus)
            OrdoTab.TAREAS -> TasksScreen(taskList, hoy)
            OrdoTab.HABITOS -> HabitsScreen(hoy)
            OrdoTab.AJUSTES ->
                SettingsScreen(
                    session = session,
                    settings = settings,
                    timers = timers,
                    onPomodoroSaved = { scope.launch { focus.loadConfig() } },
                )
        }
    }
}

/**
 * Material 3 destination icons (S20): Hoy = día, Tareas = check,
 * Hábitos = check-in con racha (nunca Refresh: eso promete sincronizar),
 * Ajustes = tuercas. La firma Ordo por área vive en el contenido
 * (DayRing violeta, estaciones esmeralda, bloques azules); la barra
 * queda 100% M3 con sus colores por defecto accesibles.
 */
@Composable
private fun NavIcon(tab: OrdoTab) {
    val icon = when (tab) {
        OrdoTab.HOY -> Icons.Default.DateRange
        OrdoTab.TAREAS -> Icons.Default.Check
        OrdoTab.HABITOS -> Icons.Default.CheckCircle
        OrdoTab.AJUSTES -> Icons.Default.Settings
    }
    Icon(
        imageVector = icon,
        contentDescription = null,
        modifier = Modifier.size(24.dp),
    )
}
