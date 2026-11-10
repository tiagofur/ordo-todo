package dev.creapolis.ordotodo.data

import dev.creapolis.ordotodo.hoy.TaskStatusApi
import kotlinx.serialization.json.Json

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
}
