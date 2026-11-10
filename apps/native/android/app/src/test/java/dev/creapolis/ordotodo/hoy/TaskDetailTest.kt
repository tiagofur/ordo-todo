package dev.creapolis.ordotodo.hoy

import dev.creapolis.ordotodo.data.NativeProject
import dev.creapolis.ordotodo.data.TaskDetailResponse
import kotlinx.serialization.json.JsonNull
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
) = TaskDetailResponse(
    id = "t-1",
    title = title,
    description = description,
    priority = priority,
    scheduledDate = scheduledDate,
    scheduledTime = scheduledTime,
    dueDate = dueDate,
    projectId = projectId,
)

private fun edited(
    title: String = "Pagar luz",
    description: String = "Boleta de noviembre",
    scheduledDate: String = "2026-11-10",
    scheduledTime: String = "15:00",
    dueDate: String = "",
    priority: String = "MEDIUM",
    projectId: String? = null,
) = EditedTask(
    title = title,
    description = description,
    scheduledDate = scheduledDate,
    scheduledTime = scheduledTime,
    dueDate = dueDate,
    priority = priority,
    projectId = projectId,
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
