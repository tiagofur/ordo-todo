package dev.creapolis.ordotodo.data

import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Test

class TodayResponseTest {

    private val json = Json { ignoreUnknownKeys = true }

    @Test
    fun parsesTodayPayload() {
        val raw = """
            {
              "overdue": [],
              "dueToday": [
                {
                  "id": "t1",
                  "title": "Enviar factura",
                  "status": "TODO",
                  "priority": "HIGH",
                  "scheduledTime": "15:00",
                  "project": {"id": "p1", "name": "Casa", "color": "#EC4899"},
                  "subTasks": [{"id": "s1", "status": "COMPLETED"}, {"id": "s2", "status": "TODO"}],
                  "unknownFutureField": true
                }
              ],
              "scheduledToday": [],
              "available": [],
              "notYetAvailable": []
            }
        """.trimIndent()

        val response = json.decodeFromString<TodayResponse>(raw)

        assertEquals(1, response.dueToday.size)
        val task = response.dueToday.first()
        assertEquals("t1", task.id)
        assertEquals("Enviar factura", task.title)
        assertEquals("15:00", task.scheduledTime)
        assertEquals("Casa", task.project?.name)
        assertEquals(2, task.subTasks.size)
        assertEquals(1, task.subTasks.count { it.status == "COMPLETED" })
    }
}
