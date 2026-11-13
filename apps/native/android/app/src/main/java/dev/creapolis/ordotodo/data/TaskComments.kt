package dev.creapolis.ordotodo.data

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

/** A task comment in read-only form (`GET /tasks/:id/comments`). */
data class TaskComment(
    val id: String,
    val content: String,
    val author: String,
    val date: String,
)

@Serializable
private data class CommentAuthor(
    val name: String? = null,
    val email: String = "",
)

@Serializable
private data class CommentPayload(
    val id: String = "",
    val content: String = "",
    val author: CommentAuthor = CommentAuthor(),
    val createdAt: String = "",
)

private val commentsJson = Json { ignoreUnknownKeys = true }

/** Parses task comments; anything unexpected is no comments, never a crash. */
fun parseTaskComments(raw: String): List<TaskComment> =
    try {
        val element = commentsJson.parseToJsonElement(raw)
        val array =
            when {
                element is kotlinx.serialization.json.JsonArray -> element
                element is kotlinx.serialization.json.JsonObject -> return emptyList()
                else -> return emptyList()
            }
        commentsJson.decodeFromJsonElement(
            kotlinx.serialization.builtins.ListSerializer(CommentPayload.serializer()),
            array,
        ).filter { it.id.isNotEmpty() && it.content.isNotEmpty() }
            .map {
                TaskComment(
                    id = it.id,
                    content = it.content,
                    author = it.author.name?.takeIf { name -> name.isNotBlank() } ?: it.author.email,
                    date = it.createdAt.take(10),
                )
            }
    } catch (_: Exception) {
        emptyList()
    }
