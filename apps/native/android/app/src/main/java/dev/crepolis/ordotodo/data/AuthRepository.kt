package dev.creapolis.ordotodo.data

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

/** Typed auth failures so the UI can show the right message (never the raw body). */
sealed class AuthException(message: String) : Exception(message) {
    class InvalidCredentials : AuthException("invalid")
    class Network(cause: Throwable) : AuthException("network")
    class Server(val status: Int) : AuthException("server")
}

@Serializable
private data class AuthUser(val id: String, val email: String? = null)

@Serializable
private data class AuthResponse(
    val accessToken: String,
    val refreshToken: String,
    val user: AuthUser? = null,
)

/**
 * Email auth against the shared backend (`POST /auth/login|register`,
 * same contract as web/desktop). Tokens land in [SessionStore].
 */
class AuthRepository(
    private val api: ApiClient,
    private val session: SessionStore,
    private val json: Json = Json { ignoreUnknownKeys = true },
) {
    suspend fun login(email: String, password: String) {
        val raw =
            call {
                api.post("/auth/login", api.jsonBody("email" to email.trim(), "password" to password))
            }
        store(raw)
    }

    suspend fun register(
        email: String,
        username: String,
        name: String,
        password: String,
        inviteCode: String?,
    ) {
        val raw =
            call {
                api.post(
                    "/auth/register",
                    api.jsonBody(
                        "email" to email.trim(),
                        "username" to username.trim(),
                        "name" to name.trim(),
                        "password" to password,
                        "inviteCode" to inviteCode?.trim()?.ifBlank { null },
                    ),
                )
            }
        store(raw)
    }

    suspend fun logout() {
        try {
            api.post("/auth/logout", api.jsonBody())
        } catch (_: Exception) {
            // Best effort: the session is over locally either way.
        } finally {
            session.clear()
        }
    }

    private fun store(raw: String) {
        val response = json.decodeFromString<AuthResponse>(raw)
        if (response.accessToken.isBlank() || response.refreshToken.isBlank()) {
            throw AuthException.Server(200)
        }
        kotlinx.coroutines.runBlocking {
            session.save(response.accessToken, response.refreshToken)
        }
    }

    private suspend fun call(block: suspend () -> String): String {
        try {
            return block()
        } catch (e: UnauthorizedException) {
            throw AuthException.InvalidCredentials()
        } catch (e: NetworkException) {
            throw AuthException.Network(e)
        } catch (e: ApiException) {
            if (e.status == 400 || e.status == 401 || e.status == 409) {
                throw AuthException.InvalidCredentials()
            }
            throw AuthException.Server(e.status)
        }
    }
}
