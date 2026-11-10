package dev.creapolis.ordotodo.focus

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dev.creapolis.ordotodo.R
import dev.creapolis.ordotodo.data.ApiException
import dev.creapolis.ordotodo.data.NetworkException
import dev.creapolis.ordotodo.data.TimerRepository
import dev.creapolis.ordotodo.data.UnauthorizedException
import dev.creapolis.ordotodo.data.SessionStore
import dev.creapolis.ordotodo.hoy.Snack
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.launch

/**
 * Focus session lifecycle (F2). Server owns the session
 * (timer endpoints); this VM owns the countdown display, the local
 * persistence, the ongoing notification and the end alarm.
 *
 * Focus controls require a connection (like express capture): offline the
 * buttons explain it instead of desyncing from the server.
 */
class FocusViewModel(
    private val timers: TimerRepository,
    private val store: FocusStore,
    private val notifs: FocusNotifications,
    private val alarms: FocusAlarms,
    private val session: SessionStore,
    private val appContext: android.content.Context,
) : ViewModel() {

    private val _focus = MutableStateFlow<FocusState?>(null)
    val focus: StateFlow<FocusState?> = _focus

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
        viewModelScope.launch { restore() }
    }

    fun canScheduleExact(): Boolean = alarms.canExact()

    fun start(taskId: String?, taskTitle: String, plannedMs: Long?) {
        if (_focus.value != null || _starting.value) return
        _starting.value = true
        viewModelScope.launch {
            try {
                val created = timers.start(taskId)
                val startedAt = isoToEpoch(created.startedAt) ?: System.currentTimeMillis()
                val state =
                    FocusState(
                        sessionId = created.id,
                        taskId = taskId,
                        taskTitle = taskTitle,
                        startedAtEpoch = startedAt,
                        plannedDurationMs = plannedMs,
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
                showOngoing(paused)
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
        val state =
            FocusState(
                sessionId = active.id,
                taskId = active.taskId,
                taskTitle = local?.takeIf { it.sessionId == active.id }?.taskTitle
                    ?: active.taskId
                    ?: appContext.getString(R.string.timer_title),
                startedAtEpoch = startedAt,
                pausedTotalMs = active.totalPauseTime * 1000,
                pausedSinceEpoch = pausedSince,
                plannedDurationMs = local?.takeIf { it.sessionId == active.id }?.plannedDurationMs,
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
        showOngoing(state)
    }

    private suspend fun clear(sessionId: String) {
        store.save(null)
        _focus.value = null
        alarms.cancel(sessionId)
        notifs.cancelOngoing()
    }

    private fun showOngoing(state: FocusState) {
        val now = System.currentTimeMillis()
        val left = remainingMs(state, now)
        val line =
            if (left == null) {
                formatElapsed(elapsedMs(state, now))
            } else {
                formatElapsed(elapsedMs(state, now)) + " · −" + formatElapsed(left)
            }
        notifs.showOngoing(state.taskTitle, line, state.isPaused, state.sessionId)
    }
}
