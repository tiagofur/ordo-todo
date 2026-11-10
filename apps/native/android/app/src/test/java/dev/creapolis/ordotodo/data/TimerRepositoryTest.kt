package dev.creapolis.ordotodo.data

import dev.creapolis.ordotodo.focus.PomodoroConfig
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class TimerRepositoryTest {

    private val json = Json { ignoreUnknownKeys = true }

    @Test
    fun decodesTimerSessionPayloadWithType() {
        val raw = """
            {
                "id": "sess-123",
                "taskId": "task-abc",
                "startedAt": "2026-11-10T15:00:00Z",
                "totalPauseTime": 30,
                "isPaused": false,
                "type": "WORK",
                "durationMinutes": 25
            }
        """.trimIndent()
        val payload = json.decodeFromString<TimerSessionPayload>(raw)
        assertEquals("sess-123", payload.id)
        assertEquals("task-abc", payload.taskId)
        assertEquals("WORK", payload.type)
        assertEquals(25, payload.durationMinutes)
    }

    @Test
    fun decodesSwitchTaskResponse() {
        val raw = """
            {
                "sessionId": "sess-123",
                "previousTaskId": "task-old",
                "newTaskId": "task-new",
                "switchedAt": "2026-11-10T15:15:00Z"
            }
        """.trimIndent()
        val response = json.decodeFromString<SwitchTaskResponse>(raw)
        assertEquals("sess-123", response.sessionId)
        assertEquals("task-old", response.previousTaskId)
        assertEquals("task-new", response.newTaskId)
    }

    @Test
    fun decodesTimerStatsResponse() {
        val raw = """
            {
                "totalWorkMinutes": 100,
                "totalPauseMinutes": 10,
                "completedPomodoros": 4,
                "averageSessionLength": 25,
                "focusScore": 0.92,
                "mostProductiveHour": 11
            }
        """.trimIndent()
        val stats = json.decodeFromString<TimerStatsResponse>(raw)
        assertEquals(100, stats.totalWorkMinutes)
        assertEquals(10, stats.totalPauseMinutes)
        assertEquals(4, stats.completedPomodoros)
        assertEquals(25, stats.averageSessionLength)
        assertEquals(0.92, stats.focusScore, 0.001)
        assertEquals(11, stats.mostProductiveHour)
    }

    @Test
    fun mapsUserPreferencesToPomodoroConfig() {
        val config = PomodoroConfig(
            workDurationMinutes = 30,
            shortBreakMinutes = 6,
            longBreakMinutes = 20,
            pomodorosUntilLongBreak = 3,
        )
        assertEquals(30, config.workDurationMinutes)
        assertEquals(6, config.shortBreakMinutes)
        assertEquals(20, config.longBreakMinutes)
        assertEquals(3, config.pomodorosUntilLongBreak)
    }
}
