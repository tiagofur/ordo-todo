package dev.creapolis.ordotodo.hoy

import java.time.LocalDate

data class ParsedCapture(
    val title: String,
    val scheduledDate: LocalDate?,
    val scheduledTime: String?,
    val priority: String?,
    val projectHint: String? = null,
)

private data class PriorityHit(val start: Int, val end: Int, val priority: String)
private data class DateHit(val start: Int, val end: Int, val date: LocalDate)

/** Matches "mañana" before "manana" so spans are detected for both spellings. */
private val RELATIVE = listOf(
    Regex("\\bpasado\\s+mañana\\b|\\bpasado\\s+manana\\b") to 2,
    Regex("\\bday\\s+after\\s+tomorrow\\b") to 2,
    Regex("\\bdepois\\s+de\\s+amanhã\\b|\\bdepois\\s+de\\s+amanha\\b") to 2,
    Regex("\\bmañana\\b|\\bmanana\\b") to 1,
    Regex("\\btomorrow\\b") to 1,
    Regex("\\bamanhã\\b|\\bamanha\\b") to 1,
    // "hoy" last: the two-word forms above already consumed their spans.
    Regex("\\bhoy\\b") to 0,
    Regex("\\btoday\\b") to 0,
    Regex("\\bhoje\\b") to 0,
)

private val NUMERIC_DATE =
    Regex("\\b(0?[1-9]|[12][0-9]|3[01])/(0?[1-9]|1[0-2])(?:/(20\\d{2}|\\d{2}))?\\b")

private val MONTHS = mapOf(
    "ene" to 1, "enero" to 1, "jan" to 1, "january" to 1, "janeiro" to 1,
    "feb" to 2, "febrero" to 2, "february" to 2, "fevereiro" to 2, "fev" to 2,
    "mar" to 3, "marzo" to 3, "march" to 3, "março" to 3,
    "abr" to 4, "abril" to 4, "april" to 4,
    "may" to 5, "mayo" to 5, "maio" to 5,
    "jun" to 6, "junio" to 6, "june" to 6, "junho" to 6,
    "jul" to 7, "julio" to 7, "july" to 7, "julho" to 7,
    "ago" to 8, "agosto" to 8, "aug" to 8, "august" to 8,
    "sep" to 9, "sept" to 9, "set" to 9, "september" to 9,
    "septiembre" to 9, "setembro" to 9,
    "oct" to 10, "octubre" to 10, "october" to 10, "out" to 10, "outubro" to 10,
    "nov" to 11, "noviembre" to 11, "november" to 11, "novembro" to 11,
    "dic" to 12, "diciembre" to 12, "dec" to 12, "december" to 12, "dez" to 12, "dezembro" to 12,
)
private val MONTH_WORD = MONTHS.keys.sortedByDescending { it.length }.joinToString("|")
private val DAY_MONTH =
    Regex("\\b(\\d{1,2})\\s+(?:de\\s+)?($MONTH_WORD)\\b(?:\\s+(\\d{4}))?", RegexOption.IGNORE_CASE)
private val MONTH_DAY =
    Regex("\\b($MONTH_WORD)\\s+(\\d{1,2})\\b(?:\\s*,?\\s+(\\d{4}))?", RegexOption.IGNORE_CASE)

private val TIME_COLON = Regex("\\b([01]?[0-9]|2[0-3]):([0-5][0-9])\\b")
private val TIME_H = Regex("\\b([01]?[0-9]|2[0-3])h([0-5][0-9])?\\b", RegexOption.IGNORE_CASE)
private val TIME_AMPM =
    Regex("\\b(0?[1-9]|1[0-2])(?::([0-5][0-9]))?\\s?([ap])\\s?\\.?m\\.?\\b", RegexOption.IGNORE_CASE)
private val TIME_PREP =
    Regex("(?:\\ba\\s+las|\\ba\\s+la|\\bal|\\bat|\\bàs|\\bas)\\s+\$", RegexOption.IGNORE_CASE)

private val PRIORITY_P =
    Regex("(?<![A-Za-z0-9])p([1-4])(?![A-Za-z0-9])", RegexOption.IGNORE_CASE)
private val BANG_END = Regex("(\\S+?)(!{1,2})\\s*\$")
private val BANG_ALONE = Regex("(?:^|\\s)(!{1,2})(?:\$|\\s)")

private val PRIORITY_OF_P = mapOf("1" to "URGENT", "2" to "HIGH", "3" to "MEDIUM", "4" to "LOW")

private val PROJECT_TAG = Regex("(?:^|\\s)#([A-Za-z0-9_-]+)")

private data class ProjectHit(val start: Int, val end: Int, val hint: String)

private fun resolveYear(month: Int, day: Int, today: LocalDate): LocalDate? {
    return try {
        var date = LocalDate.of(today.year, month, day)
        if (date.isBefore(today)) date = date.plusYears(1)
        date
    } catch (_: Exception) {
        null
    }
}

private fun findPriority(text: String): PriorityHit? {
    val all = mutableListOf<PriorityHit>()
    PRIORITY_P.findAll(text).forEach { m ->
        all += PriorityHit(m.range.first, m.range.last + 1, PRIORITY_OF_P[m.groupValues[1]]!!)
    }
    BANG_ALONE.findAll(text).forEach { m ->
        val bang = m.groupValues[1]
        val start = m.range.first + m.value.indexOf(bang)
        all += PriorityHit(start, start + bang.length, if (bang.length == 2) "URGENT" else "HIGH")
    }
    BANG_END.find(text)?.let { m ->
        val bangs = m.groupValues[2]
        val start = m.range.last - bangs.length + 1
        all += PriorityHit(start, m.range.last + 1, if (bangs.length == 2) "URGENT" else "HIGH")
    }
    // Last marker wins; overlapping spans (e.g. "!!" seen twice) keep the longest.
    return all.maxWithOrNull(compareBy({ it.end }, { it.end - it.start }))
}

private fun numericDate(m: MatchResult, today: LocalDate): LocalDate? {
    val day = m.groupValues[1].toInt()
    val month = m.groupValues[2].toInt()
    return when (val yearRaw = m.groupValues[3]) {
        "" -> resolveYear(month, day, today)
        else -> try {
            val year = if (yearRaw.length == 2) 2000 + yearRaw.toInt() else yearRaw.toInt()
            LocalDate.of(year, month, day)
        } catch (_: Exception) {
            null
        }
    }
}

private fun namedDate(day: Int, month: Int?, year: Int?, today: LocalDate): LocalDate? {
    if (month == null || day !in 1..31) return null
    return if (year != null) {
        try {
            LocalDate.of(year, month, day)
        } catch (_: Exception) {
            null
        }
    } else {
        resolveYear(month, day, today)
    }
}

private fun findDate(text: String, today: LocalDate): DateHit? {
    val cands = mutableListOf<DateHit>()
    val lower = text.lowercase()
    RELATIVE.forEach { (regex, plusDays) ->
        regex.findAll(lower).forEach { m ->
            cands += DateHit(m.range.first, m.range.last + 1, today.plusDays(plusDays.toLong()))
        }
    }
    NUMERIC_DATE.findAll(text).forEach { m ->
        numericDate(m, today)?.let { cands += DateHit(m.range.first, m.range.last + 1, it) }
    }
    DAY_MONTH.findAll(text).forEach { m ->
        val day = m.groupValues[1].toIntOrNull() ?: return@forEach
        namedDate(day, MONTHS[m.groupValues[2].lowercase()], m.groupValues[3].toIntOrNull(), today)
            ?.let { cands += DateHit(m.range.first, m.range.last + 1, it) }
    }
    MONTH_DAY.findAll(text).forEach { m ->
        val day = m.groupValues[2].toIntOrNull() ?: return@forEach
        namedDate(day, MONTHS[m.groupValues[1].lowercase()], m.groupValues[3].toIntOrNull(), today)
            ?.let { cands += DateHit(m.range.first, m.range.last + 1, it) }
    }
    // First marker in the string wins; invalid dates contribute no candidate.
    return cands.minByOrNull { it.start }
}

private data class TimeHit(val start: Int, val end: Int, val time: String)

private fun findTime(text: String): TimeHit? {
    val hits = mutableListOf<TimeHit>()
    TIME_COLON.findAll(text).forEach { m ->
        hits += TimeHit(m.range.first, m.range.last + 1, "%02d:%s".format(m.groupValues[1].toInt(), m.groupValues[2]))
    }
    TIME_H.findAll(text).forEach { m ->
        val hour = m.groupValues[1].toInt()
        val min = m.groupValues[2].ifEmpty { "00" }
        hits += TimeHit(m.range.first, m.range.last + 1, "%02d:%s".format(hour, min))
    }
    TIME_AMPM.findAll(text).forEach { m ->
        var hour = m.groupValues[1].toInt()
        val min = m.groupValues[2].ifEmpty { "00" }
        val pm = m.groupValues[3].equals("p", ignoreCase = true)
        hour = when {
            pm && hour < 12 -> hour + 12
            !pm && hour == 12 -> 0
            else -> hour
        }
        hits += TimeHit(m.range.first, m.range.last + 1, "%02d:%s".format(hour, min))
    }
    return hits.minByOrNull { it.start }
}

private fun cut(text: String, start: Int, end: Int, stripPrep: Boolean = false): String {
    val pre = text.substring(0, start)
    val from = if (stripPrep) TIME_PREP.find(pre)?.range?.first ?: start else start
    return (text.substring(0, from) + " " + text.substring(end)).replace(Regex("\\s+"), " ")
}

private fun findAllProjects(text: String): List<ProjectHit> =
    PROJECT_TAG.findAll(text)
        .map { m ->
            val tag = m.groupValues[1]
            val start = m.range.first + m.value.indexOf('#')
            ProjectHit(start, start + 1 + tag.length, tag)
        }
        .toList()

/** Last `#tag` wins; a lone `#` is plain text. */
fun parseProjectHint(text: String): String? = findAllProjects(text).maxByOrNull { it.start }?.hint

fun parseDateText(text: String, today: LocalDate = LocalDate.now()): LocalDate? {
    if (text.isBlank()) return null
    return findDate(text, today)?.date
}

fun parseTimeText(text: String): String? {
    if (text.isBlank()) return null
    return findTime(text)?.time
}

fun parseCapture(raw: String, today: LocalDate = LocalDate.now()): ParsedCapture {
    var text = raw
    // Project tags first: an explicit `#p1` names a project, it is not priority P1.
    // Every tag is cut (last one wins the hint) so none leaks into the title.
    val projectHits = findAllProjects(text)
    val project = projectHits.maxByOrNull { it.start }?.hint
    for (hit in projectHits.sortedByDescending { it.start }) {
        text = cut(text, hit.start, hit.end)
    }
    val priority = findPriority(text)?.also { text = cut(text, it.start, it.end) }?.priority
    val date = findDate(text, today)?.also { text = cut(text, it.start, it.end) }?.date
    val time = findTime(text)?.also { text = cut(text, it.start, it.end, stripPrep = true) }?.time
    val title = text.replace(Regex("\\s+"), " ").trim().trimEnd(',', ';', ':')
    return ParsedCapture(title, date, time, priority, projectHint = project)
}
