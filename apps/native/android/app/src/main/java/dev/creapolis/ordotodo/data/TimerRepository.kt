package dev.creapolis.ordotodo.data

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
)

class TimerRepository(
    private val api: ApiClient,
    private val json: Json = Json { ignoreUnknownKeys = true },
) {
    suspend fun start(taskId: String?): TimerSessionPayload {
        val body =
            buildJsonObject {
                put("type", "WORK")
                if (taskId != null) put("taskId", taskId)
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
