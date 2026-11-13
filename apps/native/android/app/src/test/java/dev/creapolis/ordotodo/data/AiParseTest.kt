package dev.creapolis.ordotodo.data

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import java.time.LocalDate

class AiParseTest {

    private val payload =
        """{"title":"Prepare demo","description":"Slides and script",
            "dueDate":"2026-11-13","priority":"HIGH","estimatedMinutes":90,"tags":["demo"]}"""

    @Test
    fun parsesAiTask() {
        assertEquals(
            AiParsedTask(
                title = "Prepare demo",
                dueDate = LocalDate.of(2026, 11, 13),
                priority = "HIGH",
            ),
            parseAiTask(payload),
        )
    }

    @Test
    fun nullWhenUnusable() {
        assertNull(parseAiTask("""{"title":"  "}"""))
        assertNull(parseAiTask("""{}"""))
        assertNull(parseAiTask("not json"))
    }

    @Test
    fun rendersEnhancedText() {
        assertEquals(
            "Prepare demo 2026-11-13 p2",
            renderEnhancedText(AiParsedTask("Prepare demo", LocalDate.of(2026, 11, 13), "HIGH")),
        )
        assertEquals(
            "Buy milk",
            renderEnhancedText(AiParsedTask("Buy milk", null, null)),
        )
    }

    @Test
    fun defaultPriorityAddsNoNoise() {
        assertEquals(
            "Buy milk",
            renderEnhancedText(AiParsedTask("Buy milk", null, "MEDIUM")),
        )
    }
}
