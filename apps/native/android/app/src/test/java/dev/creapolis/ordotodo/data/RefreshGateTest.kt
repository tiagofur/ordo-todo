package dev.creapolis.ordotodo.data

import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Test

/** ODD 051 S2: one refresh per expired token, logout only when the server rejects it. */
class RefreshGateTest {
    private class FakeSession(var tokens: SessionStore.Tokens?) {
        var rotations = 0
    }

    private fun gateCall(
        gate: RefreshGate,
        session: FakeSession,
        failedAccess: String,
        result: (String) -> RefreshResult,
    ): suspend () -> RefreshOutcome = {
        gate.freshAccess(
            failedAccess = failedAccess,
            current = { session.tokens },
            rotate = { refresh ->
                session.rotations++
                delay(20)
                result(refresh)
            },
            save = { session.tokens = it },
        )
    }

    @Test
    fun concurrentExpiredCallsRotateOnce() = runBlocking {
        val gate = RefreshGate()
        val session = FakeSession(SessionStore.Tokens("a1", "r1"))
        val call = gateCall(gate, session, "a1") { RefreshResult.Rotated(SessionStore.Tokens("a2", "r2")) }
        val outcomes = List(5) { async { call() } }.awaitAll()
        assertEquals(1, session.rotations)
        assertEquals(List(5) { RefreshOutcome.Retry("a2") }, outcomes)
        assertEquals(SessionStore.Tokens("a2", "r2"), session.tokens)
    }

    @Test
    fun rotatesWithTheStoredRefreshToken() = runBlocking {
        val session = FakeSession(SessionStore.Tokens("a1", "r1"))
        var used = ""
        val call = gateCall(RefreshGate(), session, "a1") {
            used = it
            RefreshResult.Rotated(SessionStore.Tokens("a2", "r2"))
        }
        call()
        assertEquals("r1", used)
    }

    @Test
    fun rejectedRefreshSignsOut() = runBlocking {
        val session = FakeSession(SessionStore.Tokens("a1", "r1"))
        val outcome = gateCall(RefreshGate(), session, "a1") { RefreshResult.Rejected }()
        assertEquals(RefreshOutcome.SignedOut, outcome)
    }

    @Test
    fun unreachableRefreshKeepsTheSession() = runBlocking {
        val session = FakeSession(SessionStore.Tokens("a1", "r1"))
        val outcome = gateCall(RefreshGate(), session, "a1") { RefreshResult.Unreachable }()
        assertEquals(RefreshOutcome.Unreachable, outcome)
        assertEquals(SessionStore.Tokens("a1", "r1"), session.tokens)
    }

    @Test
    fun missingSessionSignsOutWithoutCallingTheServer() = runBlocking {
        val session = FakeSession(null)
        val outcome = gateCall(RefreshGate(), session, "a1") { RefreshResult.Rejected }()
        assertEquals(RefreshOutcome.SignedOut, outcome)
        assertEquals(0, session.rotations)
    }
}
