package dev.creapolis.ordotodo.habits

import dev.creapolis.ordotodo.data.HabitToday
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class HabitEditTest {
    private fun habit() =
        HabitToday(
            id = "h1",
            name = "Agua",
            timeOfDay = "MORNING",
            targetCount = 8,
            currentStreak = 2,
        )

    @Test
    fun blankTitleBuildsNothing() {
        assertNull(buildHabitCreate("   ", "MORNING", "07:30", "8"))
    }

    @Test
    fun createOmitsAbsentFields() {
        val body = buildHabitCreate("Leer", null, "", "")!!
        assertEquals("Leer", body["name"].toString().trim('"'))
        assertTrue("timeOfDay" !in body)
        assertTrue("preferredTime" !in body)
        assertTrue("targetCount" !in body)
    }

    @Test
    fun createKeepsValidFields() {
        val body = buildHabitCreate("Agua", "MORNING", "07:30", "8")!!
        assertEquals("MORNING", body["timeOfDay"].toString().trim('"'))
        assertEquals("07:30", body["preferredTime"].toString().trim('"'))
        assertEquals(8, body["targetCount"].toString().toInt())
    }

    @Test
    fun invalidTimeOrCountBuildNothing() {
        assertNull(buildHabitCreate("Agua", "MORNING", "7:30", "8"))
        assertNull(buildHabitCreate("Agua", "MORNING", "07:30", "0"))
        assertNull(buildHabitCreate("Agua", "MORNING", "07:30", "11"))
    }

    @Test
    fun patchSendsOnlyChanges() {
        val patch = buildHabitPatch(habit(), "Agua", "MORNING", "", "")!!
        assertTrue(patch.isEmpty())
        val renamed = buildHabitPatch(habit(), "Agua 2", "MORNING", "", "")
        assertEquals("Agua 2", renamed!!["name"].toString().trim('"'))
    }

    @Test
    fun countDefaultsToOne() {
        val body = buildHabitCreate("Correr", "ANYTIME", "", "1")!!
        assertEquals(1, body["targetCount"].toString().toInt())
    }
}
