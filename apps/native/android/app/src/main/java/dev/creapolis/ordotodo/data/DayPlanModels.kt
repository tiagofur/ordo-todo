package dev.creapolis.ordotodo.data

import kotlinx.serialization.Serializable

@Serializable
data class DayPlanBlock(
    val taskId: String,
    val start: String,
    val end: String,
    val reason: String = "",
)

@Serializable
data class DayPlanTimeRange(
    val start: String,
    val end: String,
)

@Serializable
data class DayPlanChange(
    val taskId: String,
    val type: String, // "moved" | "added" | "removed" | "resized"
    val from: DayPlanTimeRange? = null,
    val to: DayPlanTimeRange? = null,
    val reason: String = "",
)

@Serializable
data class DayPlanView(
    val proposalId: String,
    val status: String = "PROPOSED", // "PROPOSED" | "APPLIED" | "DISMISSED"
    val blocks: List<DayPlanBlock> = emptyList(),
    val frozenTaskIds: List<String> = emptyList(),
    val changes: List<DayPlanChange> = emptyList(),
)

@Serializable
data class DayPlanRisk(
    val kind: String, // "overload" | "deadline-at-risk"
    val taskIds: List<String> = emptyList(),
    val message: String,
)
