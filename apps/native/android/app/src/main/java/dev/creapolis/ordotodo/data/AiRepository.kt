package dev.creapolis.ordotodo.data

import dev.creapolis.ordotodo.hoy.priorityToken
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import java.time.LocalDate

/** One AI-proposed subtask from `POST /ai/decompose-task`. */
@Serializable
data class DecomposeSuggestion(
    val title: String = "",
    val description: String? = null,
)

@Serializable
private data class DecomposeResponse(val subtasks: List<DecomposeSuggestion> = emptyList())

private val decomposeJson = Json { ignoreUnknownKeys = true }

/** Suggested subtask titles; blanks and garbage become no suggestions. */
fun parseDecomposeSuggestions(raw: String): List<String> =
    try {
        decomposeJson.decodeFromString<DecomposeResponse>(raw).subtasks
            .map { it.title.trim() }
            .filter { it.isNotEmpty() }
    } catch (_: Exception) {
        emptyList()
    }

/** Structured capture from `POST /ai/parse-task` (only what the save path carries). */
data class AiParsedTask(
    val title: String,
    val dueDate: LocalDate?,
    val priority: String?,
)

@Serializable
private data class AiParseResponse(
    val title: String = "",
    val dueDate: String? = null,
    val priority: String? = null,
)

/** Usable AI parse, or null when there is no title to save. */
fun parseAiTask(raw: String): AiParsedTask? =
    try {
        val parsed = decomposeJson.decodeFromString<AiParseResponse>(raw)
        val title = parsed.title.trim()
        if (title.isEmpty()) {
            null
        } else {
            AiParsedTask(
                title = title,
                dueDate = parsed.dueDate?.let { runCatching { LocalDate.parse(it.take(10)) }.getOrNull() },
                priority = parsed.priority?.takeIf { it.isNotBlank() },
            )
        }
    } catch (_: Exception) {
        null
    }

/**
 * Rebuilds the capture text from the AI result with ISO dates and p-tokens,
 * so the local parser (and the offline queue behind it) re-parse it cleanly.
 * MEDIUM adds no token: it is already the default.
 */
fun renderEnhancedText(ai: AiParsedTask): String =
    buildList {
        add(ai.title)
        ai.dueDate?.let { add(it.toString()) }
        if (ai.priority != null && ai.priority != "MEDIUM") add(priorityToken(ai.priority))
    }.joinToString(" ")

/** Thin client for the AI endpoints the app uses as progressive enhancement. */
class AiRepository(
    private val api: ApiClient,
    private val json: Json = Json { ignoreUnknownKeys = true },
) {
    /** Parses capture text into structured fields (`POST /ai/parse-task`). */
    suspend fun parseTask(input: String): AiParsedTask? {
        val body = buildJsonObject { put("input", input) }
        return try {
            val raw = api.post("/ai/parse-task", json.encodeToString(JsonObject.serializer(), body))
            parseAiTask(raw)
        } catch (_: Exception) {
            null
        }
    }

    /** Proposes subtask titles for a task (`POST /ai/decompose-task`). */
    suspend fun decompose(taskTitle: String, taskDescription: String): List<String> {
        val body =
            buildJsonObject {
                put("taskTitle", taskTitle)
                put("taskDescription", taskDescription)
                put("maxSubtasks", 8)
            }
        val raw = api.post("/ai/decompose-task", json.encodeToString(JsonObject.serializer(), body))
        return parseDecomposeSuggestions(raw)
    }
}
