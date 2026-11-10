package dev.creapolis.ordotodo.ritual

/**
 * Pure helper functions for the 60s Daily Rituals and Streaks (ODD 051 S11).
 */

fun toggleTop3(currentTop3: List<String>, taskId: String): List<String> {
    return if (currentTop3.contains(taskId)) {
        currentTop3 - taskId
    } else {
        if (currentTop3.size < 3) currentTop3 + taskId else currentTop3
    }
}

fun defaultEveningMoves(pendingTasks: List<RitualEveningTask>): List<RitualEveningMove> {
    return pendingTasks.map { task ->
        RitualEveningMove(
            taskId = task.taskId,
            destination = "tomorrow",
            reason = "overran",
        )
    }
}

fun activeRitualPhase(
    morningStatus: String,
    eveningStatus: String,
    hourOfDay: Int,
): RitualPhase {
    val morningPending = morningStatus != "DONE" && morningStatus != "SKIPPED"
    val eveningPending = eveningStatus != "DONE" && eveningStatus != "SKIPPED"

    return when {
        morningPending && hourOfDay < 17 -> RitualPhase.MORNING
        eveningPending && hourOfDay >= 17 -> RitualPhase.EVENING
        else -> RitualPhase.NONE
    }
}

fun streakLabel(current: Int, longest: Int): String {
    return when {
        current <= 0 -> "Comienza tu racha con el ritual de hoy"
        current == 1 -> "Racha: 1 día"
        else -> "Racha: $current días"
    }
}
