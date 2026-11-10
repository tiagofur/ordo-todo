package dev.creapolis.ordotodo.ritual

import kotlinx.serialization.Serializable

enum class RitualPhase {
    MORNING,
    EVENING,
    NONE,
}

@Serializable
data class RitualStreak(
    val current: Int = 0,
    val longest: Int = 0,
)

@Serializable
data class RitualDayState(
    val morningStatus: String = "PENDING", // "PENDING" | "DONE" | "SKIPPED"
    val morningAt: String? = null,
    val morningTop3: List<String> = emptyList(),
    val morningPlannedAt: String? = null,
    val eveningStatus: String = "PENDING", // "PENDING" | "DONE" | "SKIPPED"
    val eveningAt: String? = null,
)

@Serializable
data class RitualOverdueTask(
    val taskId: String,
    val title: String,
    val dueDateKey: String = "",
)

@Serializable
data class RitualMorningView(
    val overdue: List<RitualOverdueTask> = emptyList(),
    val suggestedTop3: List<String> = emptyList(),
    val ritual: RitualDayState? = null,
)

@Serializable
data class RitualEveningTask(
    val taskId: String,
    val title: String,
)

@Serializable
data class RitualEveningView(
    val completed: List<RitualEveningTask> = emptyList(),
    val pending: List<RitualEveningTask> = emptyList(),
    val ritual: RitualDayState? = null,
)

@Serializable
data class RitualEveningMove(
    val taskId: String,
    val destination: String = "tomorrow", // "tomorrow" | "date" | "archived"
    val date: String? = null,
    val reason: String = "overran", // "overran" | "urgent" | "no-energy" | "other"
)
