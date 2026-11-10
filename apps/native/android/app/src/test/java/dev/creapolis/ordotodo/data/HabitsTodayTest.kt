package dev.creapolis.ordotodo.data

import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class HabitsTodayTest {
    private val json = Json { ignoreUnknownKeys = true }

    @Test
    fun parsesHabitsToday() {
        val raw = """
            {
              "habits": [
                {
                  "id": "h1",
                  "name": "Agua",
                  "timeOfDay": "MORNING",
                  "targetCount": 8,
                  "currentStreak": 4,
                  "completions": [],
                  "unknownFuture": 1
                },
                {
                  "id": "h2",
                  "name": "Leer",
                  "currentStreak": 0,
                  "completions": [{"completedAt": "07:30:00"}]
                }
              ],
              "grouped": {
                "MORNING": [],
                "AFTERNOON": [],
                "EVENING": [],
                "ANYTIME": []
              },
              "summary": {"total": 2, "completed": 1, "remaining": 1, "percentage": 50}
            }
        """.trimIndent()
        val response = json.decodeFromString<HabitsTodayResponse>(raw)
        assertEquals(2, response.habits.size)
        assertFalse(response.habits[0].doneToday)
        assertTrue(response.habits[1].doneToday)
        assertEquals(1, response.summary.completed)
        assertEquals(4, response.habits[0].currentStreak)
    }

    @Test
    fun fallsBackToGroupedWhenHabitsEmpty() {
        val raw = """
            {
              "habits": [],
              "grouped": {
                "MORNING": [{"id": "h3", "name": "Correr", "currentStreak": 2}],
                "AFTERNOON": [],
                "EVENING": [],
                "ANYTIME": []
              },
              "summary": {"total": 1, "completed": 0, "remaining": 1, "percentage": 0}
            }
        """.trimIndent()
        val response = json.decodeFromString<HabitsTodayResponse>(raw)
        assertEquals(1, response.grouped.all().size)
    }
}
