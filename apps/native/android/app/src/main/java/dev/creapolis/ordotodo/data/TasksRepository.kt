package dev.creapolis.ordotodo.data

import kotlinx.serialization.json.Json

/** Reads the day from the shared backend (`GET /tasks/today`). Offline cache arrives in F1b. */
class TasksRepository(
    private val api: ApiClient,
    private val json: Json = Json { ignoreUnknownKeys = true },
) {
    suspend fun today(): TodayResponse = json.decodeFromString(api.get("/tasks/today"))
}
