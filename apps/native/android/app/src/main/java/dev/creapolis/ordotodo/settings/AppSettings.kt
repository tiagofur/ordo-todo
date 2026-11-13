package dev.creapolis.ordotodo.settings

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.appSettingsDataStore: DataStore<Preferences> by preferencesDataStore("settings")

/**
 * Local-only app preferences (S19): appearance, daily hours and the default
 * reminder lead. Pomodoro durations live on the server (`PATCH
 * /users/me/preferences`) and are edited through [dev.creapolis.ordotodo.data.TimerRepository].
 */
class AppSettings(
    private val store: DataStore<Preferences>,
) {
    val themeMode: Flow<String> = store.data.map { it[KEY_THEME_MODE] ?: SettingsLogic.THEME_SYSTEM }

    val dynamicColor: Flow<Boolean> = store.data.map { it[KEY_DYNAMIC_COLOR] ?: false }

    val availableMinutes: Flow<Int> =
        store.data.map { SettingsLogic.coerceAvailableMinutes(it[KEY_AVAILABLE_MINUTES] ?: 480) }

    val reminderLeadMinutes: Flow<Int> =
        store.data.map { SettingsLogic.coerceReminderLead(it[KEY_REMINDER_LEAD] ?: 0) }

    suspend fun setThemeMode(mode: String) {
        store.edit { it[KEY_THEME_MODE] = mode }
    }

    suspend fun setDynamicColor(enabled: Boolean) {
        store.edit { it[KEY_DYNAMIC_COLOR] = enabled }
    }

    suspend fun setAvailableMinutes(minutes: Int) {
        store.edit { it[KEY_AVAILABLE_MINUTES] = SettingsLogic.coerceAvailableMinutes(minutes) }
    }

    suspend fun setReminderLeadMinutes(minutes: Int) {
        store.edit { it[KEY_REMINDER_LEAD] = SettingsLogic.coerceReminderLead(minutes) }
    }

    companion object {
        private val KEY_THEME_MODE = stringPreferencesKey("theme_mode")
        private val KEY_DYNAMIC_COLOR = booleanPreferencesKey("dynamic_color")
        private val KEY_AVAILABLE_MINUTES = intPreferencesKey("available_minutes")
        private val KEY_REMINDER_LEAD = intPreferencesKey("reminder_lead_minutes")

        fun from(context: Context): AppSettings = AppSettings(context.appSettingsDataStore)
    }
}
