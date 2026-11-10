package dev.creapolis.ordotodo.data

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

sealed class AuthException(message: String) : Exception(message) {
    class Network(cause: Throwable) : AuthException("network")

    class Invalid(message: String = "invalid") : AuthException(message)
}

/**
 * Email auth (F1a): JSON + Bearer, tokens persisted in [SessionStore].
 * Missing credentials surface as [AuthException.Invalid]; I/O as
 * [AuthException.Network] so the screen can tell them apart.
 */
class AuthSession(
    private val api: ApiClient,
    private val session: SessionStore,
    private val json: Json = Json { ignoreUnknownKeys = true },
) {
    suspend fun login(email: String, password: String) {
        saveTokens(call(api.jsonBody("email" to email, "password" to password), "/auth/login"))
    }

    suspend fun register(
        email: String,
        username: String,
        name: String,
        password: String,
        inviteCode: String?,
    ) {
        saveTokens(
            call(
                api.jsonBody(
                    "email" to email,
                    "username" to username,
                    "name" to name,
                    "password" to password,
                    "inviteCode" to inviteCode,
                ),
                "/auth/register",
            ),
        )
    }

    private suspend fun call(body: String, path: String): String =
        try {
            api.post(path, body)
        } catch (e: NetworkException) {
            throw AuthException.Network(e)
        } catch (e: UnauthorizedException) {
            throw AuthException.Invalid()
        } catch (e: ApiException) {
            throw AuthException.Invalid(e.message ?: "invalid")
        }

    private suspend fun saveTokens(text: String) {
        val obj = json.parseToJsonElement(text).jsonObject
        val access = obj["accessToken"]?.jsonPrimitive?.content
        val refresh = obj["refreshToken"]?.jsonPrimitive?.content
        if (access.isNullOrBlank() || refresh.isNullOrBlank()) throw AuthException.Invalid()
        session.save(access, refresh)
    }
}
