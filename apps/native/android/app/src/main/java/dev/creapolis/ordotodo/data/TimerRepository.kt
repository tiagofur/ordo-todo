package dev.creapolis.ordotodo.data

import dev.creapolis.ordotodo.focus.PomodoroConfig
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

/**
 * Wire mirror of the web timer client (timer endpoints).
 * Dates arrive as ISO strings; pauses are seconds (see service).
 */
@Serializable
data class TimerSessionPayload(
    val id: String,
    val taskId: String? = null,
    val startedAt: String,
    val totalPauseTime: Long = 0,
    val currentPauseStart: String? = null,
    val elapsedSeconds: Long = 0,
    val isPaused: Boolean = false,
    val type: String? = null,
    val durationMinutes: Int? = null,
)

@Serializable
data class SwitchTaskResponse(
    val sessionId: String,
    val previousTaskId: String? = null,
    val newTaskId: String,
    val switchedAt: String,
)

@Serializable
data class TimerStatsResponse(
    val totalWorkMinutes: Int = 0,
    val totalPauseMinutes: Int = 0,
    val completedPomodoros: Int = 0,
    val averageSessionLength: Int = 0,
    val focusScore: Double = 0.0,
    val mostProductiveHour: Int? = null,
)

@Serializable
private data class UserPreferencesWire(
    val pomodoroDuration: Int? = null,
    val shortBreakDuration: Int? = null,
    val longBreakDuration: Int? = null,
    val pomodorosUntilLongBreak: Int? = null,
)

class TimerRepository(
    private val api: ApiClient,
    private val json: Json = Json { ignoreUnknownKeys = true },
) {
    suspend fun start(
        taskId: String?,
        type: String = "WORK",
        durationMinutes: Int? = null,
    ): TimerSessionPayload {
        val body =
            buildJsonObject {
                put("type", type)
                if (taskId != null) put("taskId", taskId)
                if (durationMinutes != null) put("durationMinutes", durationMinutes)
            }
        return json.decodeFromString(api.post("/timers/start", encode(body)))
    }

    suspend fun pause(): TimerSessionPayload =
        json.decodeFromString(api.post("/timers/pause", "{}"))

    suspend fun resume(pauseStartedAtIso: String): TimerSessionPayload {
        val body = buildJsonObject { put("pauseStartedAt", pauseStartedAtIso) }
        return json.decodeFromString(api.post("/timers/resume", encode(body)))
    }

    suspend fun stop(completed: Boolean) {
        val body = buildJsonObject { put("wasCompleted", completed) }
        api.post("/timers/stop", encode(body))
    }

    suspend fun switchTask(taskId: String): SwitchTaskResponse {
        val body = buildJsonObject { put("taskId", taskId) }
        return json.decodeFromString(api.post("/timers/switch-task", encode(body)))
    }

    suspend fun stats(date: String): TimerStatsResponse {
        val text = api.get("/timers/stats?date=$date")
        if (text.isBlank()) return TimerStatsResponse()
        return json.decodeFromString(text)
    }

    suspend fun getPreferences(): PomodoroConfig {
        return try {
            val text = api.get("/users/me/preferences")
            if (text.isBlank()) return PomodoroConfig()
            val prefs = json.decodeFromString<UserPreferencesWire>(text)
            PomodoroConfig(
                workDurationMinutes = prefs.pomodoroDuration ?: 25,
                shortBreakMinutes = prefs.shortBreakDuration ?: 5,
                longBreakMinutes = prefs.longBreakDuration ?: 15,
                pomodorosUntilLongBreak = prefs.pomodorosUntilLongBreak ?: 4,
            )
        } catch (_: Exception) {
            PomodoroConfig()
        }
    }

    /**
     * The backend answers 200 + `null` with no session; anything else
     * non-2xx still throws through [ApiClient].
     */
    suspend fun active(): TimerSessionPayload? {
        val text = api.get("/timers/active")
        if (text.isBlank()) return null
        return json.decodeFromString<TimerSessionPayload?>(text)
    }

    private fun encode(body: JsonObject): String =
        json.encodeToString(JsonObject.serializer(), body)
}
