package dev.creapolis.ordotodo.focus

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class PomodoroCycleTest {

    private val defaultConfig = PomodoroConfig(
        workDurationMinutes = 25,
        shortBreakMinutes = 5,
        longBreakMinutes = 15,
        pomodorosUntilLongBreak = 4,
    )

    @Test
    fun `skip below 80 percent is not credited`() {
        val plannedMs = 25 * 60_000L
        val elapsedMs = 19 * 60_000L // 76% < 80%
        assertFalse(PomodoroCycle.isCredited(elapsedMs, plannedMs))

        val transition = PomodoroCycle.transition(
            currentMode = PomodoroMode.WORK,
            completedPomodoros = 0,
            config = defaultConfig,
            credited = false,
        )
        assertFalse(transition.wasCredited)
        assertEquals(0, transition.completedPomodoros)
        assertEquals(PomodoroMode.SHORT_BREAK, transition.nextMode)
        assertEquals(5 * 60_000L, transition.durationMs)
    }

    @Test
    fun `skip at or above 80 percent is credited`() {
        val plannedMs = 25 * 60_000L
        val elapsedMs = 20 * 60_000L // 80%
        assertTrue(PomodoroCycle.isCredited(elapsedMs, plannedMs))

        val transition = PomodoroCycle.transition(
            currentMode = PomodoroMode.WORK,
            completedPomodoros = 0,
            config = defaultConfig,
            credited = true,
        )
        assertTrue(transition.wasCredited)
        assertEquals(1, transition.completedPomodoros)
        assertEquals(PomodoroMode.SHORT_BREAK, transition.nextMode)
    }

    @Test
    fun `fourth pomodoro transitions to long break`() {
        val transition = PomodoroCycle.transition(
            currentMode = PomodoroMode.WORK,
            completedPomodoros = 3,
            config = defaultConfig,
            credited = true,
        )
        assertTrue(transition.wasCredited)
        assertEquals(4, transition.completedPomodoros)
        assertEquals(PomodoroMode.LONG_BREAK, transition.nextMode)
        assertEquals(15 * 60_000L, transition.durationMs)
    }

    @Test
    fun `break finishes and transitions back to work`() {
        val fromShortBreak = PomodoroCycle.transition(
            currentMode = PomodoroMode.SHORT_BREAK,
            completedPomodoros = 2,
            config = defaultConfig,
            credited = true,
        )
        assertEquals(PomodoroMode.WORK, fromShortBreak.nextMode)
        assertEquals(2, fromShortBreak.completedPomodoros)
        assertEquals(25 * 60_000L, fromShortBreak.durationMs)

        val fromLongBreak = PomodoroCycle.transition(
            currentMode = PomodoroMode.LONG_BREAK,
            completedPomodoros = 4,
            config = defaultConfig,
            credited = true,
        )
        assertEquals(PomodoroMode.WORK, fromLongBreak.nextMode)
        assertEquals(4, fromLongBreak.completedPomodoros)
        assertEquals(25 * 60_000L, fromLongBreak.durationMs)
    }

    @Test
    fun `custom config respects user preferences`() {
        val customConfig = PomodoroConfig(
            workDurationMinutes = 50,
            shortBreakMinutes = 10,
            longBreakMinutes = 30,
            pomodorosUntilLongBreak = 2,
        )
        assertEquals(50 * 60_000L, customConfig.durationMs(PomodoroMode.WORK))
        assertEquals(10 * 60_000L, customConfig.durationMs(PomodoroMode.SHORT_BREAK))
        assertEquals(30 * 60_000L, customConfig.durationMs(PomodoroMode.LONG_BREAK))

        val transition = PomodoroCycle.transition(
            currentMode = PomodoroMode.WORK,
            completedPomodoros = 1,
            config = customConfig,
            credited = true,
        )
        assertEquals(2, transition.completedPomodoros)
        assertEquals(PomodoroMode.LONG_BREAK, transition.nextMode)
        assertEquals(30 * 60_000L, transition.durationMs)
    }
}
