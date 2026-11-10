package dev.creapolis.ordotodo.data

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject

/** Minimal habit payload for the Hoy list (F3a). */
@Serializable
data class HabitCompletion(
    val completedAt: String? = null,
    val completedDate: String? = null,
) {
    /** ISO day (`yyyy-MM-dd`) across both payload shapes (today + detail). */
    val day: String? get() = (completedDate ?: completedAt)?.take(10)
}

@Serializable
data class HabitToday(
    val id: String,
    val name: String,
    val description: String? = null,
    val icon: String? = null,
    val color: String? = null,
    val timeOfDay: String? = null,
    val preferredTime: String? = null,
    val targetCount: Int = 1,
    val currentStreak: Int = 0,
    val completions: List<HabitCompletion> = emptyList(),
) {
    val doneToday: Boolean get() = completions.isNotEmpty()
}

@Serializable
data class HabitsSummary(
    val total: Int = 0,
    val completed: Int = 0,
    val remaining: Int = 0,
    val percentage: Int = 0,
)

@Serializable
data class HabitsGrouped(
    val MORNING: List<HabitToday> = emptyList(),
    val AFTERNOON: List<HabitToday> = emptyList(),
    val EVENING: List<HabitToday> = emptyList(),
    val ANYTIME: List<HabitToday> = emptyList(),
) {
    fun all(): List<HabitToday> = MORNING + AFTERNOON + EVENING + ANYTIME
}

/** Mirrors `GET /habits/today` (`habits.service.findForToday`). */
@Serializable
data class HabitsTodayResponse(
    val habits: List<HabitToday> = emptyList(),
    val grouped: HabitsGrouped = HabitsGrouped(),
    val summary: HabitsSummary = HabitsSummary(),
)

/** Day reads plus check-in/out (F3a). CRUD + offline queue in F3c. */
class HabitsRepository(
    private val api: ApiClient,
    private val json: Json = Json { ignoreUnknownKeys = true },
) : dev.creapolis.ordotodo.hoy.HabitCheckApi {
    suspend fun today(): HabitsTodayResponse = json.decodeFromString(api.get("/habits/today"))

    override suspend fun complete(id: String) {
        api.post("/habits/$id/complete", "{}")
    }

    override suspend fun uncomplete(id: String) {
        api.delete("/habits/$id/complete")
    }

    /** Full create body comes from `buildHabitCreate` (F3c). */
    suspend fun create(body: JsonObject) {
        api.post("/habits", json.encodeToString(JsonObject.serializer(), body))
    }

    /** Partial edit, diff-only like tasks (F3c). */
    suspend fun update(id: String, patch: JsonObject) {
        api.patch("/habits/$id", json.encodeToString(JsonObject.serializer(), patch))
    }

    suspend fun remove(id: String) {
        api.delete("/habits/$id")
    }

    /** Full habit with the last-30 completions (`GET /habits/:id`, F3d). */
    suspend fun detail(id: String): HabitToday = json.decodeFromString(api.get("/habits/$id"))
}
