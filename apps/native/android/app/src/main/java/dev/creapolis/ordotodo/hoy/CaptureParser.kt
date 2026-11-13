package dev.creapolis.ordotodo.hoy

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.input.OffsetMapping
import androidx.compose.ui.text.input.TransformedText
import androidx.compose.ui.text.input.VisualTransformation
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.LocalTime
import java.time.temporal.TemporalAdjusters

data class ParsedCapture(
    val title: String,
    val scheduledDate: LocalDate?,
    val scheduledTime: String?,
    val priority: String?,
    val projectHint: String? = null,
)

private data class PriorityHit(val start: Int, val end: Int, val priority: String)
private data class DateHit(val start: Int, val end: Int, val date: LocalDate)

/**
 * Matches "mañana" before "manana" so spans are detected for both spellings.
 * Words that start or end in a non-ASCII letter ("amanhã", "às") use explicit
 * letter lookarounds: `\b` is ASCII-only on JDK 19+ and Unicode-aware on Android.
 */
private val RELATIVE = listOf(
    Regex("\\bpasado\\s+mañana\\b|\\bpasado\\s+manana\\b") to 2,
    Regex("\\bday\\s+after\\s+tomorrow\\b") to 2,
    Regex("\\bdepois\\s+de\\s+amanhã(?![\\p{L}\\p{N}_])|\\bdepois\\s+de\\s+amanha\\b") to 2,
    Regex("\\bmañana\\b|\\bmanana\\b") to 1,
    Regex("\\btomorrow\\b") to 1,
    Regex("\\bamanhã(?![\\p{L}\\p{N}_])|\\bamanha\\b") to 1,
    // "hoy" last: the two-word forms above already consumed their spans.
    Regex("\\bhoy\\b") to 0,
    Regex("\\btoday\\b") to 0,
    Regex("\\bhoje\\b") to 0,
)

private val NUMERIC_DATE =
    Regex("\\b(0?[1-9]|[12][0-9]|3[01])/(0?[1-9]|1[0-2])(?:/(20\\d{2}|\\d{2}))?\\b")

private val ISO_DATE =
    Regex("\\b(20\\d{2})-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01])\\b")

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
    Regex("(?:\\ba\\s+las|\\ba\\s+la|\\bal|\\bat|(?<![\\p{L}\\p{N}_])às|\\bas)\\s+\$", RegexOption.IGNORE_CASE)

private val PRIORITY_P =
    Regex("(?<![A-Za-z0-9])p([1-4])(?![A-Za-z0-9])", RegexOption.IGNORE_CASE)
private val BANG_END = Regex("(\\S+?)(!{1,2})\\s*\$")
private val BANG_ALONE = Regex("(?:^|\\s)(!{1,2})(?:\$|\\s)")

private val PRIORITY_OF_P = mapOf("1" to "URGENT", "2" to "HIGH", "3" to "MEDIUM", "4" to "LOW")

private val WEEKDAY_NAMES: Map<String, DayOfWeek> = mapOf(
    "lunes" to DayOfWeek.MONDAY,
    "martes" to DayOfWeek.TUESDAY,
    "miercoles" to DayOfWeek.WEDNESDAY, "miércoles" to DayOfWeek.WEDNESDAY,
    "jueves" to DayOfWeek.THURSDAY,
    "viernes" to DayOfWeek.FRIDAY,
    "sabado" to DayOfWeek.SATURDAY, "sábado" to DayOfWeek.SATURDAY,
    "domingo" to DayOfWeek.SUNDAY,
    "monday" to DayOfWeek.MONDAY,
    "tuesday" to DayOfWeek.TUESDAY,
    "wednesday" to DayOfWeek.WEDNESDAY,
    "thursday" to DayOfWeek.THURSDAY,
    "friday" to DayOfWeek.FRIDAY,
    "saturday" to DayOfWeek.SATURDAY,
    "sunday" to DayOfWeek.SUNDAY,
    "segunda" to DayOfWeek.MONDAY, "segunda-feira" to DayOfWeek.MONDAY,
    "terca" to DayOfWeek.TUESDAY, "terça" to DayOfWeek.TUESDAY,
    "terca-feira" to DayOfWeek.TUESDAY, "terça-feira" to DayOfWeek.TUESDAY,
    "quarta" to DayOfWeek.WEDNESDAY, "quarta-feira" to DayOfWeek.WEDNESDAY,
    "quinta" to DayOfWeek.THURSDAY, "quinta-feira" to DayOfWeek.THURSDAY,
    "sexta" to DayOfWeek.FRIDAY, "sexta-feira" to DayOfWeek.FRIDAY,
)
private val WEEKDAY_ALT = WEEKDAY_NAMES.keys.sortedByDescending { it.length }.joinToString("|")

/**
 * Weekday with optional ES/EN/PT prefix. `próximo/next` = the day after this
 * Sunday (strict next week); `el/este/cada/...` or bare = next occurrence
 * including today. `cada/every/toda` only resolves the date — recurrence is
 * set in the detail screen, the create endpoint carries no recurrence.
 */
private val WEEKDAY_RE = Regex(
    "(?<![\\p{L}\\p{N}_])(?:(pr[óo]ximo|pr[óo]xima|next)\\s+|(cada|every|toda|todo)\\s+|(el|del|este|esta|this)\\s+)?($WEEKDAY_ALT)(?![\\p{L}\\p{N}_])",
    RegexOption.IGNORE_CASE,
)

/** Relative hours: "en 2 horas", "in 2 hours", "em 2 horas", "en una hora". */
private val HOUR_OFFSET_RE = Regex(
    "(?<![\\p{L}\\p{N}_])(?:en|in|em)\\s+(\\d{1,2}|una|un|one|uma|um)\\s+(?:horas?|hours?)(?![\\p{L}\\p{N}_])",
    RegexOption.IGNORE_CASE,
)

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
    ISO_DATE.findAll(text).forEach { m ->
        try {
            val y = m.groupValues[1].toInt()
            val month = m.groupValues[2].toInt()
            val d = m.groupValues[3].toInt()
            cands += DateHit(m.range.first, m.range.last + 1, LocalDate.of(y, month, d))
        } catch (_: Exception) {
        }
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
    cands += weekdayCands(lower, today)
    // First marker in the string wins; invalid dates contribute no candidate.
    return cands.minByOrNull { it.start }
}

private fun weekdayCands(lower: String, today: LocalDate): List<DateHit> =
    WEEKDAY_RE.findAll(lower).mapNotNull { m ->
        val dow = WEEKDAY_NAMES[m.groupValues[4]] ?: return@mapNotNull null
        val date = if (m.groupValues[1].isNotEmpty()) {
            // "próximo X" / "next X": the X after this Sunday (strict next week).
            today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)).with(TemporalAdjusters.next(dow))
        } else {
            today.with(TemporalAdjusters.nextOrSame(dow))
        }
        DateHit(m.range.first, m.range.last + 1, date)
    }.toList()

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

/** Entities of the raw capture text the parser understood (S16 highlight + chips). */
enum class CaptureEntity { DATE, TIME, PRIORITY, PROJECT }

/** Range of the raw input the parser consumed as [entity]; UI coordinates. */
data class CaptureSpan(val start: Int, val end: Int, val entity: CaptureEntity)

/** Token that re-emits a priority through the text parser (chip cycling). */
fun priorityToken(priority: String): String = when (priority) {
    "URGENT" -> "p1"
    "HIGH" -> "p2"
    "MEDIUM" -> "p3"
    else -> "p4"
}

/**
 * Replaces (or removes, with a blank [replacement]) the consumed [span] inside [raw].
 * Replacements are ISO dates, HH:mm times or p-tokens, so the result re-parses cleanly.
 */
fun replaceSpan(raw: String, span: CaptureSpan, replacement: String): String =
    (raw.substring(0, span.start) + " " + replacement + " " + raw.substring(span.end))
        .replace(Regex("\\s+"), " ").trim()

/** Tracks raw-text coordinates across sequential cuts so spans stay UI-accurate. */
private class Cutter(raw: String) {
    var text: String = raw
    private val origin: MutableList<Int> = raw.indices.toMutableList()

    /**
     * Cuts `[start, end)` (plus a leading time preposition when [stripPrep]),
     * returning the range in raw coordinates. Whitespace is collapsed only once,
     * when the title is computed, so recorded spans keep pointing at the input.
     */
    fun cut(start: Int, end: Int, stripPrep: Boolean = false): IntRange {
        var from = start
        if (stripPrep) {
            TIME_PREP.find(text.substring(0, start))?.let { from = it.range.first }
        }
        val rawStart = origin[from]
        val rawEnd = origin[end - 1] + 1
        text = text.substring(0, from) + " " + text.substring(end)
        repeat(end - from) { origin.removeAt(from) }
        origin.add(from, rawStart)
        return rawStart until rawEnd
    }
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

fun parseCaptureWithSpans(
    raw: String,
    today: LocalDate = LocalDate.now(),
    now: LocalTime = LocalTime.now(),
): Pair<ParsedCapture, List<CaptureSpan>> {
    val cutter = Cutter(raw)
    val spans = mutableListOf<CaptureSpan>()
    // Project tags first: an explicit `#p1` names a project, it is not priority P1.
    // Every tag is cut (last one wins the hint) so none leaks into the title.
    val projectHits = findAllProjects(cutter.text)
    val project = projectHits.maxByOrNull { it.start }?.hint
    for (hit in projectHits.sortedByDescending { it.start }) {
        val r = cutter.cut(hit.start, hit.end)
        spans += CaptureSpan(r.first, r.last + 1, CaptureEntity.PROJECT)
    }
    val priority = findPriority(cutter.text)?.let {
        val r = cutter.cut(it.start, it.end)
        spans += CaptureSpan(r.first, r.last + 1, CaptureEntity.PRIORITY)
        it.priority
    }
    var date = findDate(cutter.text, today)?.let {
        val r = cutter.cut(it.start, it.end)
        spans += CaptureSpan(r.first, r.last + 1, CaptureEntity.DATE)
        it.date
    }
    var time = findTime(cutter.text)?.let {
        val r = cutter.cut(it.start, it.end, stripPrep = true)
        spans += CaptureSpan(r.first, r.last + 1, CaptureEntity.TIME)
        it.time
    }
    if (time == null) {
        HOUR_OFFSET_RE.find(cutter.text.lowercase())?.let { m ->
            val hours = m.groupValues[1].toIntOrNull() ?: 1
            val target = today.atTime(now).plusHours(hours.toLong())
            time = "%02d:%02d".format(target.hour, target.minute)
            val r = cutter.cut(m.range.first, m.range.last + 1)
            spans += CaptureSpan(r.first, r.last + 1, CaptureEntity.TIME)
            if (date == null && target.toLocalDate() != today) {
                date = target.toLocalDate()
                spans += CaptureSpan(r.first, r.last + 1, CaptureEntity.DATE)
            }
        }
    }
    val title = cutter.text.replace(Regex("\\s+"), " ").trim().trimEnd(',', ';', ':')
    return ParsedCapture(title, date, time, priority, projectHint = project) to spans.sortedBy { it.start }
}

fun parseCapture(
    raw: String,
    today: LocalDate = LocalDate.now(),
    now: LocalTime = LocalTime.now(),
): ParsedCapture = parseCaptureWithSpans(raw, today, now).first

fun captureSpans(
    raw: String,
    today: LocalDate = LocalDate.now(),
    now: LocalTime = LocalTime.now(),
): List<CaptureSpan> = parseCaptureWithSpans(raw, today, now).second

/**
 * Live highlight for the capture field (S16). Styles the consumed ranges
 * in place; the transformed text is always exactly as long as the input —
 * appending entity text again crashes `CoreTextField` (offset validation).
 * JVM-tested for the length invariant.
 */
fun highlightCapture(
    spans: List<CaptureSpan>,
    background: Color,
    foreground: Color,
): VisualTransformation =
    VisualTransformation { input ->
        TransformedText(
            buildAnnotatedString {
                append(input.text)
                val understood = SpanStyle(background = background, color = foreground)
                for (span in spans) {
                    if (span.start < input.length && span.end <= input.length && span.start < span.end) {
                        addStyle(understood, span.start, span.end)
                    }
                }
            },
            OffsetMapping.Identity,
        )
    }
