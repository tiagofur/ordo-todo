package dev.creapolis.ordotodo.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException

class UnauthorizedException : Exception()

class NetworkException(cause: Throwable) : Exception(cause)

class ApiException(val status: Int, message: String) : Exception(message)

/**
 * Minimal JSON-over-HTTP client for the shared NestJS API (`/api/v1`).
 * Sends the stored access token as Bearer; on 401 it tries one silent
 * refresh and retries once, then surfaces [UnauthorizedException] so the
 * caller can sign out without losing locally queued work (F1b).
 */
class ApiClient(
    private val baseUrl: String,
    private val session: SessionStore,
    private val http: OkHttpClient = OkHttpClient(),
    private val json: Json = Json { ignoreUnknownKeys = true },
) {
    suspend fun get(path: String): String = request("GET", path, null)

    suspend fun post(path: String, body: String? = null): String = request("POST", path, body)

    suspend fun patch(path: String, body: String? = null): String = request("PATCH", path, body)

    suspend fun delete(path: String): String = request("DELETE", path, null)

    fun jsonBody(vararg pairs: Pair<String, String?>): String =
        json.encodeToString(
            kotlinx.serialization.json.JsonObject.serializer(),
            buildJsonObject {
                for ((key, value) in pairs) {
                    if (value != null) put(key, value) else put(key, kotlinx.serialization.json.JsonNull)
                }
            },
        )

    private suspend fun request(method: String, path: String, body: String?): String =
        withContext(Dispatchers.IO) {
            try {
                val tokens = session.tokens.first()
                val response = execute(method, path, body, tokens?.access)
                if (response.code == 401 && tokens != null) {
                    response.close()
                    if (refresh(tokens.refresh)) {
                        val retry = session.tokens.first()
                        val second = execute(method, path, body, retry?.access)
                        return@withContext readOrThrow(second)
                    }
                    session.clear()
                    throw UnauthorizedException()
                }
                readOrThrow(response)
            } catch (e: IOException) {
                throw NetworkException(e)
            }
        }

    private fun execute(method: String, path: String, body: String?, access: String?): okhttp3.Response {
        val builder = Request.Builder().url(baseUrl.trimEnd('/') + path)
        if (access != null) builder.header("Authorization", "Bearer $access")
        val jsonType = "application/json".toMediaType()
        val payload = body?.toRequestBody(jsonType) ?: "".toRequestBody(jsonType)
        when (method) {
            "POST" -> builder.post(payload)
            "PATCH" -> builder.patch(payload)
            "DELETE" -> builder.delete()
            else -> builder.get()
        }
        return http.newCall(builder.build()).execute()
    }

    private fun readOrThrow(response: okhttp3.Response): String {
        response.use {
            val text = it.body?.string().orEmpty()
            if (it.code == 401) throw UnauthorizedException()
            if (!it.isSuccessful) throw ApiException(it.code, text.take(300))
            return text
        }
    }

    /** One-shot refresh that never recurses into [request]. Returns true when tokens were rotated. */
    private fun refresh(refreshToken: String): Boolean {
        val payload =
            json.encodeToString(
                kotlinx.serialization.json.JsonObject.serializer(),
                buildJsonObject { put("refreshToken", refreshToken) },
            )
        val call =
            Request.Builder()
                .url(baseUrl.trimEnd('/') + "/auth/refresh")
                .post(payload.toRequestBody("application/json".toMediaType()))
                .build()
        return try {
            http.newCall(call).execute().use { response ->
                val text = response.body?.string().orEmpty()
                if (!response.isSuccessful) return false
                val obj = json.parseToJsonElement(text).jsonObject
                val access = obj["accessToken"]?.jsonPrimitive?.content
                val refresh = obj["refreshToken"]?.jsonPrimitive?.content
                if (access.isNullOrBlank() || refresh.isNullOrBlank()) return false
                // SessionStore is suspend-only; bridge with runBlocking on IO (already on IO thread).
                kotlinx.coroutines.runBlocking { session.save(access, refresh) }
                true
            }
        } catch (_: IOException) {
            false
        }
    }
}
