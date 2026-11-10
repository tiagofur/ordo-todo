package dev.creapolis.ordotodo.data

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import javax.crypto.KeyGenerator

/** ODD 051 S3: tokens at rest are encrypted; plaintext sessions migrate without a new login. */
class TokenVaultTest {
    private fun cipher(): AesGcmCipher {
        val key = KeyGenerator.getInstance("AES").apply { init(256) }.generateKey()
        return AesGcmCipher { key }
    }

    @Test
    fun roundTripsAndNeverStoresPlaintext() {
        val c = cipher()
        val sealed = c.encrypt("access.jwt.value")
        assertFalse(sealed.contains("access.jwt.value"))
        assertEquals("access.jwt.value", c.decrypt(sealed))
    }

    @Test
    fun sameTokenEncryptsDifferentlyEachTime() {
        val c = cipher()
        assertNotEquals(c.encrypt("token"), c.encrypt("token"))
    }

    @Test
    fun tamperedOrForeignCiphertextDecryptsToNull() {
        val c = cipher()
        assertNull(c.decrypt("not-base64!"))
        assertNull(c.decrypt(""))
        assertNull(cipher().decrypt(c.encrypt("token")))
    }

    @Test
    fun encryptedSessionReads() {
        val c = cipher()
        val stored = StoredSession(sealedAccess = c.encrypt("a"), sealedRefresh = c.encrypt("r"))
        val read = readSession(stored, c)
        assertEquals(SessionStore.Tokens("a", "r"), read.tokens)
        assertFalse(read.needsMigration)
    }

    @Test
    fun legacyPlaintextSessionStillReadsAndAsksForMigration() {
        val read = readSession(StoredSession(legacyAccess = "a", legacyRefresh = "r"), cipher())
        assertEquals(SessionStore.Tokens("a", "r"), read.tokens)
        assertTrue(read.needsMigration)
    }

    @Test
    fun encryptedWinsOverLeftoverPlaintext() {
        val c = cipher()
        val stored =
            StoredSession(
                sealedAccess = c.encrypt("new-a"),
                sealedRefresh = c.encrypt("new-r"),
                legacyAccess = "old-a",
                legacyRefresh = "old-r",
            )
        val read = readSession(stored, c)
        assertEquals(SessionStore.Tokens("new-a", "new-r"), read.tokens)
        assertTrue(read.needsMigration)
    }

    @Test
    fun unreadableOrEmptySessionIsSignedOut() {
        val c = cipher()
        assertNull(readSession(StoredSession(), c).tokens)
        val foreign = StoredSession(sealedAccess = cipher().encrypt("a"), sealedRefresh = cipher().encrypt("r"))
        assertNull(readSession(foreign, c).tokens)
    }
}
