package dev.creapolis.ordotodo.focus

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dev.creapolis.ordotodo.R
import dev.creapolis.ordotodo.data.ApiException
import dev.creapolis.ordotodo.data.NetworkException
import dev.creapolis.ordotodo.data.SessionStore
import dev.creapolis.ordotodo.data.TimerRepository
import dev.creapolis.ordotodo.data.TimerStatsResponse
import dev.creapolis.ordotodo.data.UnauthorizedException
import dev.creapolis.ordotodo.hoy.Snack
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.launch
import java.time.LocalDate

/**
 * Focus session lifecycle (S13, S14, S15). Server owns the session
 * (timer endpoints); this VM owns the countdown display, the local
 * persistence, Pomodoro cycle transitions, Foreground Service synchronization,
 * task switching, and today's stats summary.
 */
class FocusViewModel(
    private val timers: TimerRepository,
    private val store: FocusStore,
    private val notifs: FocusNotifications,
    private val alarms: FocusAlarms,
    private val session: SessionStore,
    private val appContext: Context,
) : ViewModel() {

    private val _focus = MutableStateFlow<FocusState?>(null)
    val focus: StateFlow<FocusState?> = _focus

    private val _config = MutableStateFlow(PomodoroConfig())
    val config: StateFlow<PomodoroConfig> = _config

    private val _todayStats = MutableStateFlow<TimerStatsResponse?>(null)
    val todayStats: StateFlow<TimerStatsResponse?> = _todayStats

    /** Ticks every second while a session is active; drives the countdown. */
    private val _tick = MutableStateFlow(System.currentTimeMillis())
    val tick: StateFlow<Long> = _tick

    private val _starting = MutableStateFlow(false)
    val starting: StateFlow<Boolean> = _starting

    private val _events = Channel<Snack>(Channel.BUFFERED)
    val events = _events.receiveAsFlow()

    init {
        viewModelScope.launch {
            while (true) {
                delay(1000)
                if (_focus.value != null) _tick.value = System.currentTimeMillis()
            }
        }
        viewModelScope.launch {
            loadConfig()
            loadTodayStats()
            restore()
        }
    }

    fun canScheduleExact(): Boolean = alarms.canExact()

    suspend fun loadConfig() {
        try {
            _config.value = timers.getPreferences()
        } catch (_: Exception) {
            // Keep default config
        }
    }

    fun loadTodayStats() {
        viewModelScope.launch {
            try {
                val today = LocalDate.now().toString()
                _todayStats.value = timers.stats(today)
            } catch (_: Exception) {
                // Ignore stats fetch failure
            }
        }
    }

    fun start(
        taskId: String?,
        taskTitle: String,
        plannedMs: Long?,
        mode: PomodoroMode = PomodoroMode.WORK,
    ) {
        if (_focus.value != null || _starting.value) return
        _starting.value = true
        viewModelScope.launch {
            try {
                val durationMinutes =
                    plannedMs?.let { (it / 60_000L).toInt() }
                        ?: (_config.value.durationMs(mode) / 60_000L).toInt()
                val created = timers.start(taskId, type = mode.name, durationMinutes = durationMinutes)
                val startedAt = isoToEpoch(created.startedAt) ?: System.currentTimeMillis()
                val state =
                    FocusState(
                        sessionId = created.id,
                        taskId = taskId,
                        taskTitle = taskTitle,
                        startedAtEpoch = startedAt,
                        plannedDurationMs = plannedMs,
                        mode = mode,
                        completedPomodoros = _todayStats.value?.completedPomodoros ?: 0,
                    )
                store.save(state)
                afterChange(state)
            } catch (_: UnauthorizedException) {
                signedOut()
            } catch (_: NetworkException) {
                _events.send(Snack(R.string.auth_error_network))
            } catch (_: ApiException) {
                _events.send(Snack(R.string.auth_error_network))
            } finally {
                _starting.value = false
            }
        }
    }

    fun pause() {
        val current = _focus.value ?: return
        if (current.isPaused) return
        viewModelScope.launch {
            try {
                timers.pause()
                val paused = pauseAt(current, System.currentTimeMillis())
                store.save(paused)
                alarms.cancel(paused.sessionId)
                _focus.value = paused
                FocusService.start(appContext)
            } catch (_: UnauthorizedException) {
                signedOut()
            } catch (_: NetworkException) {
                _events.send(Snack(R.string.auth_error_network))
            } catch (_: ApiException) {
                _events.send(Snack(R.string.auth_error_network))
            }
        }
    }

    fun resume() {
        val current = _focus.value ?: return
        if (!current.isPaused) return
        viewModelScope.launch {
            try {
                val active = timers.active()
                val pauseStart = active?.currentPauseStart
                if (active?.id != current.sessionId || pauseStart == null) {
                    reconcile()
                    return@launch
                }
                timers.resume(pauseStart)
                val resumed = resumeAt(current, System.currentTimeMillis())
                store.save(resumed)
                afterChange(resumed)
            } catch (_: UnauthorizedException) {
                signedOut()
            } catch (_: NetworkException) {
                _events.send(Snack(R.string.auth_error_network))
            } catch (_: ApiException) {
                _events.send(Snack(R.string.auth_error_network))
            }
        }
    }

    fun skip() {
        val current = _focus.value ?: return
        viewModelScope.launch {
            val now = System.currentTimeMillis()
            val elapsed = elapsedMs(current, now)
            val credited = PomodoroCycle.isCredited(elapsed, current.plannedDurationMs)
            try {
                timers.stop(credited)
            } catch (_: Exception) {}

            val cfg = _config.value
            val transition = PomodoroCycle.transition(current.mode, current.completedPomodoros, cfg, credited)
            try {
                val nextMinutes = (transition.durationMs / 60_000L).toInt()
                val created =
                    timers.start(
                        current.taskId,
                        type = transition.nextMode.name,
                        durationMinutes = nextMinutes,
                    )
                val startedAt = isoToEpoch(created.startedAt) ?: now
                val newState =
                    FocusState(
                        sessionId = created.id,
                        taskId = current.taskId,
                        taskTitle = current.taskTitle,
                        startedAtEpoch = startedAt,
                        plannedDurationMs = transition.durationMs,
                        mode = transition.nextMode,
                        completedPomodoros = transition.completedPomodoros,
                    )
                store.save(newState)
                afterChange(newState)
                loadTodayStats()
            } catch (_: UnauthorizedException) {
                signedOut()
            } catch (_: Exception) {
                _events.send(Snack(R.string.auth_error_network))
            }
        }
    }

    fun switchTask(taskId: String, taskTitle: String) {
        val current = _focus.value ?: return
        if (current.taskId == taskId) return
        viewModelScope.launch {
            try {
                timers.switchTask(taskId)
                val updated = current.copy(taskId = taskId, taskTitle = taskTitle)
                store.save(updated)
                afterChange(updated)
                _events.send(Snack(R.string.timer_switch_task))
            } catch (_: UnauthorizedException) {
                signedOut()
            } catch (_: Exception) {
                _events.send(Snack(R.string.auth_error_network))
            }
        }
    }

    fun stop(completed: Boolean) {
        val current = _focus.value ?: return
        viewModelScope.launch {
            try {
                timers.stop(completed)
            } catch (_: UnauthorizedException) {
                signedOut()
                return@launch
            } catch (_: NetworkException) {
                _events.send(Snack(R.string.auth_error_network))
                return@launch
            } catch (_: ApiException) {
                _events.send(Snack(R.string.auth_error_network))
                return@launch
            }
            clear(current.sessionId)
            loadTodayStats()
            _events.send(Snack(if (completed) R.string.timer_completed else R.string.timer_stopped))
        }
    }

    /** Reconciles local state with the server (startup, alarm, conflicts). */
    private suspend fun reconcile() {
        val local = store.load()
        val active =
            try {
                timers.active()
            } catch (_: UnauthorizedException) {
                signedOut()
                return
            } catch (_: Exception) {
                return
            }
        if (active == null) {
            if (local != null) clear(local.sessionId)
            return
        }
        val now = System.currentTimeMillis()
        val startedAt = isoToEpoch(active.startedAt) ?: now
        val pausedSince = isoToEpoch(active.currentPauseStart)
        val mode =
            when (active.type?.uppercase()) {
                "SHORT_BREAK" -> PomodoroMode.SHORT_BREAK
                "LONG_BREAK" -> PomodoroMode.LONG_BREAK
                else -> PomodoroMode.WORK
            }
        val plannedMs =
            active.durationMinutes?.let { it * 60_000L }
                ?: local?.takeIf { it.sessionId == active.id }?.plannedDurationMs
                ?: _config.value.durationMs(mode)

        val state =
            FocusState(
                sessionId = active.id,
                taskId = active.taskId,
                taskTitle =
                    local?.takeIf { it.sessionId == active.id }?.taskTitle
                        ?: active.taskId
                        ?: appContext.getString(R.string.timer_title),
                startedAtEpoch = startedAt,
                pausedTotalMs = active.totalPauseTime * 1000,
                pausedSinceEpoch = pausedSince,
                plannedDurationMs = plannedMs,
                mode = mode,
                completedPomodoros = local?.takeIf { it.sessionId == active.id }?.completedPomodoros
                    ?: _todayStats.value?.completedPomodoros
                    ?: 0,
            )
        store.save(state)
        afterChange(state)
    }

    private suspend fun restore() {
        reconcile()
    }

    private fun signedOut() {
        viewModelScope.launch { session.clear() }
    }

    private suspend fun afterChange(state: FocusState) {
        _focus.value = state
        _tick.value = System.currentTimeMillis()
        val end = endAtEpoch(state, _tick.value)
        if (end != null) alarms.schedule(state.sessionId, end) else alarms.cancel(state.sessionId)
        FocusService.start(appContext)
    }

    private suspend fun clear(sessionId: String) {
        store.save(null)
        _focus.value = null
        alarms.cancel(sessionId)
        FocusService.stop(appContext)
        notifs.cancelOngoing()
    }
}
