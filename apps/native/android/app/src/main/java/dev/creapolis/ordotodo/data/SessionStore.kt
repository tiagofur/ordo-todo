package dev.creapolis.ordotodo.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

private val Context.sessionDataStore: DataStore<Preferences> by preferencesDataStore("session")

/**
 * Bearer tokens persisted across restarts, encrypted at rest with a
 * Keystore key (ODD 051 S3). Sessions saved in plaintext by older builds
 * keep working and are rewritten encrypted by [migrateLegacy].
 */
class SessionStore(
    private val store: DataStore<Preferences>,
    private val cipher: TokenCipher,
) {

    data class Tokens(val access: String, val refresh: String)

    val tokens: Flow<Tokens?> = store.data.map { readSession(it.stored(), cipher).tokens }

    suspend fun save(access: String, refresh: String) {
        val sealedAccess = cipher.encrypt(access)
        val sealedRefresh = cipher.encrypt(refresh)
        store.edit {
            it[KEY_ACCESS_SEALED] = sealedAccess
            it[KEY_REFRESH_SEALED] = sealedRefresh
            it.remove(KEY_ACCESS)
            it.remove(KEY_REFRESH)
        }
    }

    suspend fun clear() {
        store.edit {
            it.remove(KEY_ACCESS_SEALED)
            it.remove(KEY_REFRESH_SEALED)
            it.remove(KEY_ACCESS)
            it.remove(KEY_REFRESH)
        }
    }

    /** Rewrites a pre-051 plaintext session encrypted; a no-op once migrated. */
    suspend fun migrateLegacy() {
        val read = readSession(store.data.first().stored(), cipher)
        if (!read.needsMigration) return
        val tokens = read.tokens
        if (tokens != null) save(tokens.access, tokens.refresh)
        else store.edit {
            it.remove(KEY_ACCESS)
            it.remove(KEY_REFRESH)
        }
    }

    private fun Preferences.stored(): StoredSession =
        StoredSession(
            sealedAccess = this[KEY_ACCESS_SEALED],
            sealedRefresh = this[KEY_REFRESH_SEALED],
            legacyAccess = this[KEY_ACCESS],
            legacyRefresh = this[KEY_REFRESH],
        )

    companion object {
        private val KEY_ACCESS = stringPreferencesKey("access_token")
        private val KEY_REFRESH = stringPreferencesKey("refresh_token")
        private val KEY_ACCESS_SEALED = stringPreferencesKey("access_token_sealed")
        private val KEY_REFRESH_SEALED = stringPreferencesKey("refresh_token_sealed")

        fun from(context: Context): SessionStore =
            SessionStore(context.sessionDataStore, AesGcmCipher.keystore())
    }
}
