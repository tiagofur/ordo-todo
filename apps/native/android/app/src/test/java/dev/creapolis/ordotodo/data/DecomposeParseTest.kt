package dev.creapolis.ordotodo.data

import org.junit.Assert.assertEquals
import org.junit.Test

class DecomposeParseTest {

    private val payload =
        """{"subtasks":[
            {"title":"Research requirements","description":"Gather docs","estimatedMinutes":60,"priority":"HIGH","dependencies":[]},
            {"title":"Create wireframes","description":"Design UI","estimatedMinutes":90,"priority":"HIGH","dependencies":["Research requirements"]}
        ],"totalEstimatedMinutes":150}"""

    @Test
    fun parsesSuggestedTitles() {
        assertEquals(
            listOf("Research requirements", "Create wireframes"),
            parseDecomposeSuggestions(payload),
        )
    }

    @Test
    fun emptyWhenMissingOrMalformed() {
        assertEquals(0, parseDecomposeSuggestions("""{"subtasks":[]}""").size)
        assertEquals(0, parseDecomposeSuggestions("""{}""").size)
        assertEquals(0, parseDecomposeSuggestions("not json").size)
    }

    @Test
    fun blankTitlesAreDropped() {
        assertEquals(
            listOf("Real step"),
            parseDecomposeSuggestions("""{"subtasks":[{"title":"  "},{"title":"Real step"}]}"""),
        )
    }
}
