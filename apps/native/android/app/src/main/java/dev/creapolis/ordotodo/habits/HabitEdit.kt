package dev.creapolis.ordotodo.habits

import dev.creapolis.ordotodo.data.HabitToday
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

private val TIME_PATTERN = Regex("^([01]\\d|2[0-3]):[0-5]\\d$")

/** `HH:mm` in 24 h, blank means absent. */
fun parseHabitTime(text: String): String? {
    val trimmed = text.trim()
    if (trimmed.isEmpty()) return null
    return if (TIME_PATTERN.matches(trimmed)) trimmed else null
}

/**
 * Times per day (backend `targetCount`, 1..10). Blank means absent;
 * anything else must parse or the whole form is invalid.
 */
fun parseHabitCount(text: String): Int? {
    val trimmed = text.trim()
    if (trimmed.isEmpty()) return null
    val count = trimmed.toIntOrNull() ?: return null
    return if (count in 1..10) count else null
}

private fun invalidTimeOrCount(timeText: String, countText: String): Boolean {
    if (timeText.isNotBlank() && parseHabitTime(timeText) == null) return true
    if (countText.isNotBlank() && parseHabitCount(countText) == null) return true
    return false
}

/**
 * Create body (F3c): mirrors backend `CreateHabitDto`. Present fields are
 * validated, absent ones are omitted (never sent as null) so `@IsOptional`
 * defaults apply. Null when the title is blank or a present field is invalid.
 */
fun buildHabitCreate(
    title: String,
    timeOfDay: String?,
    timeText: String,
    countText: String,
): JsonObject? {
    val name = title.trim()
    if (name.isEmpty() || invalidTimeOrCount(timeText, countText)) return null
    return buildJsonObject {
        put("name", name)
        if (timeOfDay != null) put("timeOfDay", timeOfDay)
        parseHabitTime(timeText)?.let { put("preferredTime", it) }
        parseHabitCount(countText)?.let { put("targetCount", it) }
    }
}

/**
 * Partial edit (F3c): mirrors backend `UpdateHabitDto`. Blank time/count
 * means "leave unchanged" (clearing arrives with an explicit null UI, not
 * this sheet). Null when a present field is invalid; an empty object when
 * everything matches the original.
 */
fun buildHabitPatch(
    original: HabitToday,
    name: String,
    timeOfDay: String?,
    timeText: String,
    countText: String,
): JsonObject? {
    if (invalidTimeOrCount(timeText, countText)) return null
    val time = if (timeText.isBlank()) original.preferredTime else parseHabitTime(timeText)
    val count = if (countText.isBlank()) original.targetCount else parseHabitCount(countText)
    return buildJsonObject {
        if (name.trim().isNotEmpty() && name.trim() != original.name) put("name", name.trim())
        if (timeOfDay != original.timeOfDay) {
            if (timeOfDay != null) put("timeOfDay", timeOfDay)
        }
        if (time != original.preferredTime && time != null) put("preferredTime", time)
        if (count != original.targetCount && count != null) put("targetCount", count)
    }
}
