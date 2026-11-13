package dev.creapolis.ordotodo.data

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

/** One `GET /search/quick` hit: a task or a project. */
@Serializable
data class QuickResult(
    val id: String,
    val type: String = "task",
    val title: String = "",
    val subtitle: String? = null,
)

@Serializable
private data class QuickResponse(val results: List<QuickResult> = emptyList())

private val searchJson = Json { ignoreUnknownKeys = true }

/** Parses quick-search hits; anything unexpected is no hits, never a crash. */
fun parseQuickResults(raw: String): List<QuickResult> =
    try {
        searchJson.decodeFromString<QuickResponse>(raw).results
    } catch (_: Exception) {
        emptyList()
    }

/** Server search needs at least 2 characters (`GET /search/quick`). */
fun shouldSearchServer(query: String): Boolean = query.trim().length >= 2
