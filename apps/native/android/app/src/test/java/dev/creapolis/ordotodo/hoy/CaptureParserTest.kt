package dev.creapolis.ordotodo.hoy

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.AnnotatedString
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import java.time.LocalDate
import java.time.LocalTime

private val TODAY = LocalDate.of(2026, 11, 9)

class CaptureParserTest {

    @Test
    fun spanishRelativeDayAndTime() {
        val parsed = parseCapture("Enviar factura mañana 15:00", TODAY)

        assertEquals("Enviar factura", parsed.title)
        assertEquals(LocalDate.of(2026, 11, 10), parsed.scheduledDate)
        assertEquals("15:00", parsed.scheduledTime)
        assertNull(parsed.priority)
    }

    @Test
    fun englishRelativeDayPmAndP1() {
        val parsed = parseCapture("Send invoice tomorrow 3pm p1", TODAY)

        assertEquals("Send invoice", parsed.title)
        assertEquals(LocalDate.of(2026, 11, 10), parsed.scheduledDate)
        assertEquals("15:00", parsed.scheduledTime)
        assertEquals("URGENT", parsed.priority)
    }

    @Test
    fun portugueseDayAfterTomorrowHshAndBangs() {
        val parsed = parseCapture("Enviar fatura depois de amanhã 15h !!", TODAY)

        assertEquals("Enviar fatura", parsed.title)
        assertEquals(LocalDate.of(2026, 11, 11), parsed.scheduledDate)
        assertEquals("15:00", parsed.scheduledTime)
        assertEquals("URGENT", parsed.priority)
    }

    @Test
    fun numericDayMonth() {
        val parsed = parseCapture("Llamar al banco 12/11", TODAY)

        assertEquals("Llamar al banco", parsed.title)
        assertEquals(LocalDate.of(2026, 11, 12), parsed.scheduledDate)
        assertNull(parsed.scheduledTime)
    }

    @Test
    fun isoDateParsed() {
        val parsed = parseCapture("Planificar release 2026-11-20 10:00", TODAY)

        assertEquals("Planificar release", parsed.title)
        assertEquals(LocalDate.of(2026, 11, 20), parsed.scheduledDate)
        assertEquals("10:00", parsed.scheduledTime)
    }

    @Test
    fun dayMonthNameRollsToNextYear() {
        val parsed = parseCapture("Revisar contrato 12 ene 09:00", TODAY)

        assertEquals("Revisar contrato", parsed.title)
        assertEquals(LocalDate.of(2027, 1, 12), parsed.scheduledDate)
        assertEquals("09:00", parsed.scheduledTime)
    }

    @Test
    fun pastDayMonthRollsToNextYear() {
        val parsed = parseCapture("Fiesta 01/01", TODAY)

        assertEquals(LocalDate.of(2027, 1, 1), parsed.scheduledDate)
    }

    @Test
    fun invalidDateStaysAsText() {
        val parsed = parseCapture("Reunión 31/02 10:00", TODAY)

        assertEquals("Reunión 31/02", parsed.title)
        assertNull(parsed.scheduledDate)
        assertEquals("10:00", parsed.scheduledTime)
    }

    @Test
    fun trailingBangIsHighPriority() {
        val parsed = parseCapture("Urgente !! terminar informe", TODAY)

        assertEquals("URGENT", parsed.priority)
        assertEquals("Urgente terminar informe", parsed.title)
    }

    @Test
    fun blankInputHasBlankTitle() {
        val parsed = parseCapture("   ", TODAY)

        assertEquals("", parsed.title)
        assertNull(parsed.scheduledDate)
        assertNull(parsed.scheduledTime)
        assertNull(parsed.priority)
    }

    @Test
    fun prepositionBeforeTimeIsRemoved() {
        val parsed = parseCapture("Llamar a las 15:00", TODAY)

        assertEquals("Llamar", parsed.title)
        assertEquals("15:00", parsed.scheduledTime)
    }

    @Test
    fun englishDayAfterTomorrow() {
        val parsed = parseCapture("Pay bills day after tomorrow", TODAY)

        assertEquals("Pay bills", parsed.title)
        assertEquals(LocalDate.of(2026, 11, 11), parsed.scheduledDate)
    }

    @Test
    fun p3IsMedium() {
        val parsed = parseCapture("Ordenar p3", TODAY)

        assertEquals("Ordenar", parsed.title)
        assertEquals("MEDIUM", parsed.priority)
    }

    @Test
    fun firstDateMarkerWins() {
        val parsed = parseCapture("Llamar 12/11 mañana", TODAY)

        assertEquals(LocalDate.of(2026, 11, 12), parsed.scheduledDate)
        assertEquals("Llamar mañana", parsed.title)
    }

    @Test
    fun weekdayBareResolvesNextOrSame() {
        val parsed = parseCapture("Enviar informe el lunes", TODAY)

        assertEquals("Enviar informe", parsed.title)
        assertEquals(LocalDate.of(2026, 11, 9), parsed.scheduledDate)
    }

    @Test
    fun weekdayFriday() {
        val parsed = parseCapture("Llamar el viernes", TODAY)

        assertEquals(LocalDate.of(2026, 11, 13), parsed.scheduledDate)
    }

    @Test
    fun weekdayNextMondayIsStrict() {
        val parsed = parseCapture("Plan next monday", TODAY)

        assertEquals("Plan", parsed.title)
        assertEquals(LocalDate.of(2026, 11, 16), parsed.scheduledDate)
    }

    @Test
    fun weekdayProximoViernesSkipsThisWeek() {
        val parsed = parseCapture("Viaje próximo viernes", TODAY)

        assertEquals(LocalDate.of(2026, 11, 20), parsed.scheduledDate)
    }

    @Test
    fun cadaLunesResolvesDateOnly() {
        val parsed = parseCapture("Ir al gym cada lunes", TODAY)

        assertEquals("Ir al gym", parsed.title)
        assertEquals(LocalDate.of(2026, 11, 9), parsed.scheduledDate)
    }

    @Test
    fun enDosHorasSameDay() {
        val parsed = parseCapture("Descansar en 2 horas", TODAY, LocalTime.of(10, 0))

        assertEquals("Descansar", parsed.title)
        assertEquals("12:00", parsed.scheduledTime)
        assertNull(parsed.scheduledDate)
    }

    @Test
    fun enDosHorasRolloverSetsDate() {
        val parsed = parseCapture("Descansar en 2 horas", TODAY, LocalTime.of(23, 30))

        assertEquals("Descansar", parsed.title)
        assertEquals("01:30", parsed.scheduledTime)
        assertEquals(LocalDate.of(2026, 11, 10), parsed.scheduledDate)
    }

    @Test
    fun spansExposeEntitiesForHighlight() {
        val raw = "Enviar factura mañana 15:00"
        val spans = captureSpans(raw, TODAY)
        val date = spans.first { it.entity == CaptureEntity.DATE }
        val time = spans.first { it.entity == CaptureEntity.TIME }

        assertEquals("mañana", raw.substring(date.start, date.end))
        assertEquals("15:00", raw.substring(time.start, time.end))
    }

    @Test
    fun replaceSpanSwapsEntityText() {
        val raw = "Enviar factura mañana"
        val span = captureSpans(raw, TODAY).first { it.entity == CaptureEntity.DATE }

        assertEquals("Enviar factura 2026-11-12", replaceSpan(raw, span, "2026-11-12"))
    }

    @Test
    fun priorityTokenRoundTrip() {
        assertEquals("p1", priorityToken("URGENT"))
        assertEquals("p2", priorityToken("HIGH"))
        assertEquals("p3", priorityToken("MEDIUM"))
        assertEquals("p4", priorityToken("LOW"))
    }

    @Test
    fun highlightKeepsTextLength() {
        val raw = "Llamar el viernes 15:00"
        val out = highlightCapture(captureSpans(raw, TODAY), Color.Red, Color.White)
            .filter(AnnotatedString(raw))
        assertEquals(raw, out.text.text)
    }

    @Test
    fun highlightMarksEntityRange() {
        val raw = "Llamar el viernes"
        val out = highlightCapture(captureSpans(raw, TODAY), Color.Red, Color.White)
            .filter(AnnotatedString(raw))
        val marked = out.text.spanStyles.filter { it.start == 7 && it.end == 17 }
        assertEquals(1, marked.size)
    }
}
