package dev.creapolis.ordotodo.data

import dev.creapolis.ordotodo.hoy.CreateOp
import dev.creapolis.ordotodo.hoy.TaskCreateApi
import dev.creapolis.ordotodo.hoy.TaskStatusApi
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import java.time.LocalDate

/**
 * Day reads plus status flips. Implements [TaskStatusApi] so the offline
 * [dev.creapolis.ordotodo.hoy.SyncEngine] pushes through this same class.
 */
class TasksRepository(
    val api: ApiClient,
    private val json: Json = Json { ignoreUnknownKeys = true },
) : TaskStatusApi,
    TaskCreateApi {
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
    ): String {
        val body =
            buildJsonObject {
                put("title", title)
                if (date != null) put("scheduledDate", date.toString())
                if (time != null) put("scheduledTime", time)
                if (priority != null) put("priority", priority)
                if (projectId != null) put("projectId", projectId)
            }
        // Non-2xx already throws in ApiClient; the body carries the created task with id.
        val raw = api.post("/tasks", json.encodeToString(JsonObject.serializer(), body))
        return try {
            json.parseToJsonElement(raw).let {
                if (it is JsonObject) it["id"]?.toString()?.trim('"') ?: "" else ""
            }
        } catch (_: Exception) {
            ""
        }
    }

    /** Pushes one capture queued offline (ODD 051 S4). */
    override suspend fun create(op: CreateOp) {
        createTask(op.title, op.date?.let(LocalDate::parse), op.time, op.priority, op.projectId)
    }

    suspend fun create(op: OutboxOp.CreateTask): String =
        createTask(op.title, op.date?.let(LocalDate::parse), op.time, op.priority, op.projectId)

    suspend fun deleteTask(id: String) {
        api.delete("/tasks/$id")
    }

    suspend fun restoreTask(id: String) {
        api.post("/tasks/$id/restore", "")
    }

    suspend fun createSubtask(parentTaskId: String, title: String): SubtaskItem {
        val body = buildJsonObject { put("title", title) }
        val raw = api.post("/tasks/$parentTaskId/subtasks", json.encodeToString(JsonObject.serializer(), body))
        return json.decodeFromString(raw)
    }

    suspend fun completeSubtask(subtaskId: String) {
        api.patch("/tasks/$subtaskId/complete")
    }

    suspend fun reopenSubtask(subtaskId: String) {
        api.patch("/tasks/$subtaskId", api.jsonBody("status" to "TODO"))
    }

    suspend fun deleteSubtask(subtaskId: String) {
        api.delete("/tasks/$subtaskId")
    }

    suspend fun taskTags(taskId: String): List<TaskTag> =
        try {
            json.decodeFromString(ListSerializer(TaskTag.serializer()), api.get("/tasks/$taskId/tags"))
        } catch (_: Exception) {
            emptyList()
        }

    suspend fun allTags(workspaceId: String? = null): List<TaskTag> {
        val path = if (workspaceId == null) "/tags" else "/tags?workspaceId=$workspaceId"
        return try {
            json.decodeFromString(ListSerializer(TaskTag.serializer()), api.get(path))
        } catch (_: Exception) {
            emptyList()
        }
    }

    suspend fun assignTag(tagId: String, taskId: String) {
        api.post("/tags/$tagId/tasks/$taskId", "")
    }

    suspend fun removeTag(tagId: String, taskId: String) {
        api.delete("/tags/$tagId/tasks/$taskId")
    }

    suspend fun createTag(name: String, color: String = "#6B7280", workspaceId: String): TaskTag {
        val body = buildJsonObject {
            put("name", name)
            put("color", color)
            put("workspaceId", workspaceId)
        }
        val raw = api.post("/tags", json.encodeToString(JsonObject.serializer(), body))
        return json.decodeFromString(raw)
    }

    suspend fun updateTask(id: String, patch: Map<String, String?>) {
        val body = buildJsonObject {
            for ((key, value) in patch) {
                if (value == null) put(key, JsonNull) else put(key, value)
            }
        }
        updateTask(id, body)
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

    /** Day-plan proposal retrieval (ODD 051 S10, `GET /tasks/day-plan`). */
    suspend fun getDayPlan(): DayPlanView =
        json.decodeFromString(api.get("/tasks/day-plan"))

    /** Apply proposed day plan (`POST /tasks/day-plan/apply`). */
    suspend fun applyDayPlan(proposalId: String): DayPlanView {
        val body = buildJsonObject { put("proposalId", proposalId) }
        val raw = api.post("/tasks/day-plan/apply", json.encodeToString(JsonObject.serializer(), body))
        return json.decodeFromString(raw)
    }

    /** Dismiss proposed day plan (`POST /tasks/day-plan/dismiss`). */
    suspend fun dismissDayPlan(proposalId: String): DayPlanView {
        val body = buildJsonObject { put("proposalId", proposalId) }
        val raw = api.post("/tasks/day-plan/dismiss", json.encodeToString(JsonObject.serializer(), body))
        return json.decodeFromString(raw)
    }

    /** Day-plan risks check (ODD 051 S10, `GET /tasks/day-plan/risks`). */
    suspend fun getDayPlanRisks(): List<DayPlanRisk> =
        json.decodeFromString(ListSerializer(DayPlanRisk.serializer()), api.get("/tasks/day-plan/risks"))
}
