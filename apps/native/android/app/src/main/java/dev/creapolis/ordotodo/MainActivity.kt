package dev.creapolis.ordotodo

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import dev.creapolis.ordotodo.auth.AuthScreen
import dev.creapolis.ordotodo.auth.AuthViewModel
import dev.creapolis.ordotodo.data.ApiClient
import dev.creapolis.ordotodo.data.AuthRepository
import dev.creapolis.ordotodo.data.DayStore
import dev.creapolis.ordotodo.data.SessionStore
import dev.creapolis.ordotodo.data.TasksRepository
import dev.creapolis.ordotodo.data.TimerRepository
import dev.creapolis.ordotodo.focus.FocusAlarms
import dev.creapolis.ordotodo.focus.FocusNotifications
import dev.creapolis.ordotodo.focus.FocusStore
import dev.creapolis.ordotodo.focus.FocusViewModel
import dev.creapolis.ordotodo.hoy.HoyScreen
import dev.creapolis.ordotodo.hoy.HoyViewModel
import dev.creapolis.ordotodo.ui.theme.OrdoTheme
import kotlinx.coroutines.flow.first

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        val session = SessionStore.from(applicationContext)
        val api = ApiClient(BuildConfig.API_BASE_URL, session)
        val auth = AuthRepository(api, session)
        val tasks = TasksRepository(api)
        val day = DayStore.from(applicationContext)
        val timers = TimerRepository(api)
        val focusStore = FocusStore.from(applicationContext)
        val focusNotifs = FocusNotifications(applicationContext)
        val focusAlarms = FocusAlarms(applicationContext)

        setContent {
            OrdoTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background,
                ) {
                    OrdoRoot(session, auth, tasks, day, timers, focusStore, focusNotifs, focusAlarms)
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
    auth: AuthRepository,
    tasks: TasksRepository,
    day: DayStore,
    timers: TimerRepository,
    focusStore: FocusStore,
    focusNotifs: FocusNotifications,
    focusAlarms: FocusAlarms,
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
        val appContext = androidx.compose.ui.platform.LocalContext.current.applicationContext
        val hoy: HoyViewModel = viewModel(factory = factory { HoyViewModel(tasks, day, session) })
        val focus: FocusViewModel =
            viewModel(
                factory =
                    factory {
                        FocusViewModel(timers, focusStore, focusNotifs, focusAlarms, session, appContext)
                    },
            )
        HoyScreen(hoy, focus)
    } else {
        val login: AuthViewModel = viewModel(factory = factory { AuthViewModel(auth) })
        AuthScreen(login)
    }
}
