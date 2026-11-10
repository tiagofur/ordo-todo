package dev.creapolis.ordotodo.data

import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

/** What `POST /auth/refresh` answered. */
sealed interface RefreshResult {
    data class Rotated(val tokens: SessionStore.Tokens) : RefreshResult

    /** The server refused the refresh token (4xx): the session is over. */
    data object Rejected : RefreshResult

    /** No answer or a server fault (network, 5xx): the session may still be good. */
    data object Unreachable : RefreshResult
}

/** What the caller that got a 401 should do next. */
sealed interface RefreshOutcome {
    data class Retry(val access: String) : RefreshOutcome

    data object SignedOut : RefreshOutcome

    data object Unreachable : RefreshOutcome
}

/**
 * Serializes token refresh (ODD 051 S2). The backend rotates refresh tokens
 * single-use and blacklists the consumed one, so two refreshes racing with
 * the same token would sign the user out. Callers queue here; whoever
 * arrives after a rotation just retries with the token already stored.
 */
class RefreshGate(private val mutex: Mutex = Mutex()) {
    suspend fun freshAccess(
        failedAccess: String,
        current: suspend () -> SessionStore.Tokens?,
        rotate: suspend (refresh: String) -> RefreshResult,
        save: suspend (SessionStore.Tokens) -> Unit,
    ): RefreshOutcome =
        mutex.withLock {
            val now = current() ?: return@withLock RefreshOutcome.SignedOut
            if (now.access != failedAccess) return@withLock RefreshOutcome.Retry(now.access)
            when (val result = rotate(now.refresh)) {
                is RefreshResult.Rotated -> {
                    save(result.tokens)
                    RefreshOutcome.Retry(result.tokens.access)
                }
                RefreshResult.Rejected -> RefreshOutcome.SignedOut
                RefreshResult.Unreachable -> RefreshOutcome.Unreachable
            }
        }

    companion object {
        /** One gate per process: activity, receivers and settings each build their own client. */
        val shared = RefreshGate()
    }
}
