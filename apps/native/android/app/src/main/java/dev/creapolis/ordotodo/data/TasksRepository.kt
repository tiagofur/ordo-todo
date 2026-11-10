package dev.creapolis.ordotodo.data

import dev.creapolis.ordotodo.hoy.TaskStatusApi
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import java.time.LocalDate

/**
 * Day reads plus status flips. Implements [TaskStatusApi] so the offline
 * [dev.creapolis.ordotodo.hoy.SyncEngine] pushes through this same class.
 */
class TasksRepository(
    private val api: ApiClient,
    private val json: Json = Json { ignoreUnknownKeys = true },
) : TaskStatusApi {
    suspend fun today(): TodayResponse = json.decodeFromString(api.get("/tasks/today"))

    override suspend fun complete(id: String) {
        api.patch("/tasks/$id/complete")
    }

    override suspend fun reopen(id: String) {
        api.patch("/tasks/$id", api.jsonBody("status" to "TODO"))
    }

    /**
     * Express capture (F1c): mirrors backend `CreateTaskDto`. Nulls are
     * omitted, never sent as JSON null, so `@IsOptional()` fields stay absent.
     */
    suspend fun createTask(title: String, date: LocalDate?, time: String?, priority: String?) {
        val body =
            buildJsonObject {
                put("title", title)
                if (date != null) put("scheduledDate", date.toString())
                if (time != null) put("scheduledTime", time)
                if (priority != null) put("priority", priority)
            }
        // Non-2xx already throws in ApiClient; the body only carries the new id.
        api.post("/tasks", json.encodeToString(JsonObject.serializer(), body))
    }
}
