package dev.creapolis.ordotodo.data

import dev.creapolis.ordotodo.hoy.TaskStatusApi
import kotlinx.serialization.builtins.ListSerializer
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
     * A resolved `#project` hint arrives as `projectId` (F1d); null stays express.
     */
    suspend fun createTask(
        title: String,
        date: LocalDate?,
        time: String?,
        priority: String?,
        projectId: String? = null,
    ) {
        val body =
            buildJsonObject {
                put("title", title)
                if (date != null) put("scheduledDate", date.toString())
                if (time != null) put("scheduledTime", time)
                if (priority != null) put("priority", priority)
                if (projectId != null) put("projectId", projectId)
            }
        // Non-2xx already throws in ApiClient; the body only carries the new id.
        api.post("/tasks", json.encodeToString(JsonObject.serializer(), body))
    }

    /** Project picker source (`GET /projects/all`, array of props). */
    suspend fun projects(): List<NativeProject> =
        json.decodeFromString(ListSerializer(NativeProject.serializer()), api.get("/projects/all"))

    /** Full task for the detail screen (`GET /tasks/:id`). */
    suspend fun taskDetail(id: String): TaskDetailResponse =
        json.decodeFromString(api.get("/tasks/$id"))

    /**
     * Whole visible list for the Tareas tab (F3b, `GET /tasks` full props).
     * Sections, search and project grouping stay client-side: the endpoint
     * has no status/search params, so one pull feeds every filter.
     */
    suspend fun all(projectId: String? = null): List<TodayTask> {
        val path = if (projectId == null) "/tasks" else "/tasks?projectId=$projectId"
        return json.decodeFromString(ListSerializer(TodayTask.serializer()), api.get(path))
    }

    /**
     * Partial edit (F1d): mirrors backend `UpdateTaskDto`. Only the keys in
     * [patch] are sent; explicit nulls clear dates, time and project.
     */
    suspend fun updateTask(id: String, patch: JsonObject) {
        api.patch("/tasks/$id", json.encodeToString(JsonObject.serializer(), patch))
    }
}
