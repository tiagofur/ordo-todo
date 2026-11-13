package dev.creapolis.ordotodo.settings

/** Pure rules behind the Settings screen; JVM-tested. */
object SettingsLogic {
    const val THEME_SYSTEM = "system"
    const val THEME_LIGHT = "light"
    const val THEME_DARK = "dark"

    /** System mode follows the OS; explicit modes win (S19, D5 Dynamic Color stays opt-in). */
    fun resolveDarkTheme(mode: String, systemDark: Boolean): Boolean =
        when (mode) {
            THEME_LIGHT -> false
            THEME_DARK -> true
            else -> systemDark
        }

    /** Daily capacity window, 1 h to 24 h; garbage from the store never reaches the UI. */
    fun coerceAvailableMinutes(minutes: Int): Int = minutes.coerceIn(60, 1440)

    /** Reminder lead options offered in Settings (S19). */
    val reminderLeadOptions: List<Int> = listOf(0, 10, 30)

    fun coerceReminderLead(minutes: Int): Int =
        if (minutes in reminderLeadOptions) minutes else 0

    /** Client-side guard for the Pomodoro form; the server validates again. */
    fun validPomodoro(work: Int?, short: Int?, long: Int?, count: Int?): Boolean =
        work != null && work in 5..120 &&
            short != null && short in 1..60 &&
            long != null && long in 1..60 &&
            count != null && count in 2..10
}
