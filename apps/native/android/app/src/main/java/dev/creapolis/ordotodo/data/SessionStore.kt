package dev.creapolis.ordotodo.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.sessionDataStore: DataStore<Preferences> by preferencesDataStore("session")

/** Bearer tokens persisted across restarts (ODD 050, D3 offline-first starts here). */
class SessionStore(private val store: DataStore<Preferences>) {

    data class Tokens(val access: String, val refresh: String)

    val tokens: Flow<Tokens?> =
        store.data.map { prefs ->
            val access = prefs[KEY_ACCESS]
            val refresh = prefs[KEY_REFRESH]
            if (access.isNullOrBlank() || refresh.isNullOrBlank()) null else Tokens(access, refresh)
        }

    suspend fun save(access: String, refresh: String) {
        store.edit {
            it[KEY_ACCESS] = access
            it[KEY_REFRESH] = refresh
        }
    }

    suspend fun clear() {
        store.edit {
            it.remove(KEY_ACCESS)
            it.remove(KEY_REFRESH)
        }
    }

    companion object {
        private val KEY_ACCESS = stringPreferencesKey("access_token")
        private val KEY_REFRESH = stringPreferencesKey("refresh_token")

        fun from(context: Context): SessionStore = SessionStore(context.sessionDataStore)
    }
}
