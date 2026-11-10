package dev.creapolis.ordotodo.hoy

import dev.creapolis.ordotodo.data.NativeProject
import dev.creapolis.ordotodo.data.RecurrenceConfig
import dev.creapolis.ordotodo.data.TaskDetailResponse
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import java.time.LocalDate

private val TODAY = LocalDate.of(2026, 11, 9)

private val PROJECTS =
    listOf(
        NativeProject(id = "p-casa", name = "Casa grande", slug = "casa-grande"),
        NativeProject(id = "p-mi", name = "Mi casa", slug = "mi-casa"),
        NativeProject(id = "p-ofi", name = "Oficina", slug = "ofi"),
    )

private fun original(
    title: String = "Pagar luz",
    description: String? = "Boleta de noviembre",
    priority: String = "MEDIUM",
    scheduledDate: String? = "2026-11-10T00:00:00.000Z",
    scheduledTime: String? = "15:00",
    dueDate: String? = null,
    projectId: String? = null,
    estimatedMinutes: Int? = null,
    recurrence: RecurrenceConfig? = null,
) = TaskDetailResponse(
    id = "t-1",
    title = title,
    description = description,
    priority = priority,
    scheduledDate = scheduledDate,
    scheduledTime = scheduledTime,
    dueDate = dueDate,
    projectId = projectId,
    estimatedMinutes = estimatedMinutes,
    recurrence = recurrence,
)

private fun edited(
    title: String = "Pagar luz",
    description: String = "Boleta de noviembre",
    scheduledDate: String = "2026-11-10",
    scheduledTime: String = "15:00",
    dueDate: String = "",
    priority: String = "MEDIUM",
    projectId: String? = null,
    estimatedMinutes: Int? = null,
    recurrence: RecurrenceConfig? = null,
) = EditedTask(
    title = title,
    description = description,
    scheduledDate = scheduledDate,
    scheduledTime = scheduledTime,
    dueDate = dueDate,
    priority = priority,
    projectId = projectId,
    estimatedMinutes = estimatedMinutes,
    recurrence = recurrence,
)

class TaskDetailTest {

    @Test
    fun noChangesProducesNoPatch() {
        assertNull(buildTaskPatch(original(), edited()))
    }

    @Test
    fun titleChangeOnly() {
        val patch = buildTaskPatch(original(), edited(title = "Pagar luz y agua"))!!

        assertEquals(buildJsonObject { put("title", "Pagar luz y agua") }, patch)
    }

    @Test
    fun clearedScheduledDateSendsNull() {
        val patch = buildTaskPatch(original(), edited(scheduledDate = ""))!!

        assertEquals(buildJsonObject { put("scheduledDate", JsonNull) }, patch)
    }

    @Test
    fun unchangedEmptyDueDateStaysAbsent() {
        val patch = buildTaskPatch(original(), edited(title = "Otro título"))!!

        assertEquals(buildJsonObject { put("title", "Otro título") }, patch)
    }

    @Test
    fun setProjectSendsId() {
        val patch = buildTaskPatch(original(), edited(projectId = "p-ofi"))!!

        assertEquals(buildJsonObject { put("projectId", "p-ofi") }, patch)
    }

    @Test
    fun clearProjectSendsNull() {
        val patch = buildTaskPatch(original(projectId = "p-casa"), edited(projectId = null))!!

        assertEquals(buildJsonObject { put("projectId", JsonNull) }, patch)
    }

    @Test
    fun estimatedMinutesChangeSendsNumber() {
        val patch = buildTaskPatch(original(), edited(estimatedMinutes = 45))!!
        assertEquals(buildJsonObject { put("estimatedMinutes", 45) }, patch)
    }

    @Test
    fun clearEstimatedMinutesSendsNull() {
        val patch = buildTaskPatch(original(estimatedMinutes = 30), edited(estimatedMinutes = null))!!
        assertEquals(buildJsonObject { put("estimatedMinutes", JsonNull) }, patch)
    }

    @Test
    fun recurrenceChangeSendsJsonObject() {
        val rec = RecurrenceConfig(pattern = "WEEKLY", interval = 1, daysOfWeek = listOf(1, 3, 5))
        val patch = buildTaskPatch(original(), edited(recurrence = rec))!!
        val expected =
            buildJsonObject {
                put(
                    "recurrence",
                    buildJsonObject {
                        put("pattern", "WEEKLY")
                        put("interval", 1)
                        put("daysOfWeek", JsonArray(listOf(1, 3, 5).map { JsonPrimitive(it) }))
                    },
                )
            }
        assertEquals(expected, patch)
    }

    @Test
    fun clearRecurrenceSendsNull() {
        val rec = RecurrenceConfig(pattern = "DAILY")
        val patch = buildTaskPatch(original(recurrence = rec), edited(recurrence = null))!!
        assertEquals(buildJsonObject { put("recurrence", JsonNull) }, patch)
    }

    @Test
    fun monthlyRecurrenceChangeSendsDayOfMonth() {
        val rec = RecurrenceConfig(pattern = "MONTHLY", interval = 1, dayOfMonth = 15)
        val patch = buildTaskPatch(original(), edited(recurrence = rec))!!
        val expected =
            buildJsonObject {
                put(
                    "recurrence",
                    buildJsonObject {
                        put("pattern", "MONTHLY")
                        put("interval", 1)
                        put("dayOfMonth", 15)
                    },
                )
            }
        assertEquals(expected, patch)
    }

    @Test
    fun unchangedEstimateAndRecurrenceStayAbsentFromPatch() {
        val rec = RecurrenceConfig(pattern = "DAILY", interval = 1)
        val orig = original(estimatedMinutes = 60, recurrence = rec)
        val edit = edited(title = "Nuevo titulo", estimatedMinutes = 60, recurrence = rec)
        val patch = buildTaskPatch(orig, edit)!!
        assertEquals(buildJsonObject { put("title", "Nuevo titulo") }, patch)
    }

    @Test
    fun subtaskItemDoneStatus() {
        val todo = dev.creapolis.ordotodo.data.SubtaskItem(id = "s-1", title = "Paso 1", status = "TODO")
        val done = dev.creapolis.ordotodo.data.SubtaskItem(id = "s-2", title = "Paso 2", status = "COMPLETED")
        val cancelled = dev.creapolis.ordotodo.data.SubtaskItem(id = "s-3", title = "Paso 3", status = "CANCELLED")

        org.junit.Assert.assertFalse(todo.isDone)
        org.junit.Assert.assertTrue(done.isDone)
        org.junit.Assert.assertTrue(cancelled.isDone)
    }

    @Test
    fun slugExactBeatsNameContains() {
        assertEquals("p-mi", resolveProjectId("mi-casa", PROJECTS))
    }

    @Test
    fun nameContainsMatches() {
        assertEquals("p-ofi", resolveProjectId("OFIC", PROJECTS))
    }

    @Test
    fun unknownHintResolvesToExpress() {
        assertNull(resolveProjectId("inexistente", PROJECTS))
    }

    @Test
    fun nullHintResolvesToExpress() {
        assertNull(resolveProjectId(null, PROJECTS))
    }

    @Test
    fun projectHintIsExtracted() {
        val parsed = parseCapture("Enviar factura #casa mañana", TODAY)

        assertEquals("casa", parsed.projectHint)
        assertEquals("Enviar factura", parsed.title)
        assertEquals(LocalDate.of(2026, 11, 10), parsed.scheduledDate)
    }

    @Test
    fun lastProjectHintWins() {
        val parsed = parseCapture("Llamar #casa #ofi 15:00", TODAY)

        assertEquals("ofi", parsed.projectHint)
        assertEquals("Llamar", parsed.title)
        assertEquals("15:00", parsed.scheduledTime)
    }

    @Test
    fun loneHashStaysAsText() {
        val parsed = parseCapture("Revisar # mañana", TODAY)

        assertNull(parsed.projectHint)
        assertEquals("Revisar #", parsed.title)
    }

    @Test
    fun projectTokenBeatsPriorityToken() {
        val parsed = parseCapture("Tarea #p1", TODAY)

        assertEquals("p1", parsed.projectHint)
        assertNull(parsed.priority)
        assertEquals("Tarea", parsed.title)
    }

    @Test
    fun dateTextParsesFlexibleInput() {
        assertEquals(LocalDate.of(2026, 11, 12), parseDateText("12/11", TODAY))
        assertEquals(LocalDate.of(2026, 11, 10), parseDateText("mañana", TODAY))
    }

    @Test
    fun badDateTextIsNull() {
        assertNull(parseDateText("xyz", TODAY))
        assertNull(parseDateText("", TODAY))
        assertNull(parseDateText("31/02", TODAY))
    }

    @Test
    fun timeTextParsesFlexibleInput() {
        assertEquals("15:00", parseTimeText("15:00"))
        assertEquals("15:00", parseTimeText("3pm"))
    }

    @Test
    fun badTimeTextIsNull() {
        assertNull(parseTimeText("xyz"))
        assertNull(parseTimeText(""))
    }
}
