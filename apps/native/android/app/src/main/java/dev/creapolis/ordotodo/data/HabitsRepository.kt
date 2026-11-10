package dev.creapolis.ordotodo.data

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

/** Minimal habit payload for the Hoy list (F3a). */
@Serializable
data class HabitCompletion(
    val completedAt: String? = null,
)

@Serializable
data class HabitToday(
    val id: String,
    val name: String,
    val description: String? = null,
    val icon: String? = null,
    val color: String? = null,
    val timeOfDay: String? = null,
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

/** Day reads plus check-in/out (F3a). Offline queue arrives in F3b. */
class HabitsRepository(
    private val api: ApiClient,
    private val json: Json = Json { ignoreUnknownKeys = true },
) {
    suspend fun today(): HabitsTodayResponse = json.decodeFromString(api.get("/habits/today"))

    suspend fun complete(id: String) {
        api.post("/habits/$id/complete", "{}")
    }

    suspend fun uncomplete(id: String) {
        api.delete("/habits/$id/complete")
    }
}
