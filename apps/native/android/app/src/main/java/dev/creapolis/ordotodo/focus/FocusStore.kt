package dev.creapolis.ordotodo.focus

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first
import kotlinx.serialization.json.Json

private val Context.focusDataStore by preferencesDataStore(name = "focus")

/**
 * Survives process death: the active focus session plus its plan, so an
 * alarm or a restart can reconcile with `GET /timers/active`.
 */
class FocusStore(
    private val store: androidx.datastore.core.DataStore<androidx.datastore.preferences.core.Preferences>,
    private val json: Json = Json { ignoreUnknownKeys = true },
) {
    suspend fun load(): FocusState? {
        val raw = store.data.first()[KEY] ?: return null
        return try {
            json.decodeFromString<FocusState>(raw)
        } catch (_: Exception) {
            null
        }
    }

    suspend fun save(state: FocusState?) {
        store.edit { prefs ->
            if (state == null) prefs.remove(KEY) else prefs[KEY] = json.encodeToString(state)
        }
    }

    companion object {
        private val KEY = stringPreferencesKey("focus_session")

        fun from(context: Context): FocusStore = FocusStore(context.focusDataStore)
    }
}
