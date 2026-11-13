package dev.creapolis.ordotodo.settings

import org.junit.Assert.assertEquals
import org.junit.Test

class SettingsLogicTest {
    @Test
    fun themeModesResolve() {
        assertEquals(false, SettingsLogic.resolveDarkTheme("light", true))
        assertEquals(true, SettingsLogic.resolveDarkTheme("dark", false))
        assertEquals(true, SettingsLogic.resolveDarkTheme("system", true))
        assertEquals(false, SettingsLogic.resolveDarkTheme("system", false))
        assertEquals(false, SettingsLogic.resolveDarkTheme("garbage", false))
    }

    @Test
    fun hoursAreCoerced() {
        assertEquals(480, SettingsLogic.coerceAvailableMinutes(480))
        assertEquals(60, SettingsLogic.coerceAvailableMinutes(0))
        assertEquals(1440, SettingsLogic.coerceAvailableMinutes(99999))
    }

    @Test
    fun leadFallsBackToAtTime() {
        assertEquals(10, SettingsLogic.coerceReminderLead(10))
        assertEquals(0, SettingsLogic.coerceReminderLead(7))
    }

    @Test
    fun pomodoroFormValidation() {
        assertEquals(true, SettingsLogic.validPomodoro(25, 5, 15, 4))
        assertEquals(false, SettingsLogic.validPomodoro(25, 5, 15, 1))
        assertEquals(false, SettingsLogic.validPomodoro(0, 5, 15, 4))
        assertEquals(false, SettingsLogic.validPomodoro(null, 5, 15, 4))
        assertEquals(false, SettingsLogic.validPomodoro(25, 5, 61, 4))
    }
}
