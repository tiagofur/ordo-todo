package dev.creapolis.ordotodo.data

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.security.GeneralSecurityException
import java.security.KeyStore
import java.util.Base64
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/** Seals short secrets for storage. `decrypt` answers null for anything it cannot open. */
interface TokenCipher {
    fun encrypt(plain: String): String

    fun decrypt(sealed: String): String?
}

/**
 * AES-256-GCM with a fresh IV per value, stored as base64(iv + ciphertext).
 * The key comes from [key] so the JVM tests use a plain key and the app uses
 * one that never leaves Android Keystore (ODD 051 S3).
 */
class AesGcmCipher(private val key: () -> SecretKey) : TokenCipher {
    override fun encrypt(plain: String): String {
        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.ENCRYPT_MODE, key())
        val body = cipher.doFinal(plain.toByteArray(Charsets.UTF_8))
        return Base64.getEncoder().encodeToString(cipher.iv + body)
    }

    override fun decrypt(sealed: String): String? =
        try {
            val raw = Base64.getDecoder().decode(sealed)
            if (raw.size <= IV_BYTES) {
                null
            } else {
                val cipher = Cipher.getInstance(TRANSFORMATION)
                cipher.init(Cipher.DECRYPT_MODE, key(), GCMParameterSpec(TAG_BITS, raw, 0, IV_BYTES))
                String(cipher.doFinal(raw, IV_BYTES, raw.size - IV_BYTES), Charsets.UTF_8)
            }
        } catch (_: IllegalArgumentException) {
            null
        } catch (_: GeneralSecurityException) {
            null
        }

    companion object {
        private const val TRANSFORMATION = "AES/GCM/NoPadding"
        private const val IV_BYTES = 12
        private const val TAG_BITS = 128
        private const val KEYSTORE = "AndroidKeyStore"
        private const val ALIAS = "ordo_session_v1"

        /** Cipher backed by a hardware-bound key created on first use. */
        fun keystore(): AesGcmCipher = AesGcmCipher(::keystoreKey)

        private fun keystoreKey(): SecretKey {
            val store = KeyStore.getInstance(KEYSTORE).apply { load(null) }
            (store.getKey(ALIAS, null) as? SecretKey)?.let { return it }
            val spec =
                KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
                    .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                    .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                    .setKeySize(256)
                    .build()
            return KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, KEYSTORE)
                .apply { init(spec) }
                .generateKey()
        }
    }
}

/** Raw values as they sit in the preferences file. Legacy fields are pre-051 plaintext. */
data class StoredSession(
    val sealedAccess: String? = null,
    val sealedRefresh: String? = null,
    val legacyAccess: String? = null,
    val legacyRefresh: String? = null,
)

data class SessionRead(val tokens: SessionStore.Tokens?, val needsMigration: Boolean)

/**
 * Encrypted tokens win; a plaintext session from an older build still reads
 * so nobody has to sign in again, and is flagged to be rewritten encrypted.
 */
fun readSession(stored: StoredSession, cipher: TokenCipher): SessionRead {
    val hasLegacy = !stored.legacyAccess.isNullOrBlank() || !stored.legacyRefresh.isNullOrBlank()
    if (!stored.sealedAccess.isNullOrBlank() && !stored.sealedRefresh.isNullOrBlank()) {
        val access = cipher.decrypt(stored.sealedAccess)
        val refresh = cipher.decrypt(stored.sealedRefresh)
        if (!access.isNullOrBlank() && !refresh.isNullOrBlank()) {
            return SessionRead(SessionStore.Tokens(access, refresh), needsMigration = hasLegacy)
        }
        return SessionRead(null, needsMigration = hasLegacy)
    }
    if (!stored.legacyAccess.isNullOrBlank() && !stored.legacyRefresh.isNullOrBlank()) {
        return SessionRead(SessionStore.Tokens(stored.legacyAccess, stored.legacyRefresh), needsMigration = true)
    }
    return SessionRead(null, needsMigration = hasLegacy)
}
