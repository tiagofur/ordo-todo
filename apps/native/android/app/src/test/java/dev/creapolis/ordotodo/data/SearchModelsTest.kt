package dev.creapolis.ordotodo.data

import org.junit.Assert.assertEquals
import org.junit.Test

class SearchModelsTest {

    private val payload =
        """{"results":[
            {"id":"t1","type":"task","title":"Backend API integration","subtitle":"IN_PROGRESS"},
            {"id":"p1","type":"project","title":"Backend Refactoring","subtitle":"ACTIVE"}
        ]}"""

    @Test
    fun parsesQuickResults() {
        val results = parseQuickResults(payload)
        assertEquals(2, results.size)
        assertEquals(QuickResult("t1", "task", "Backend API integration", "IN_PROGRESS"), results[0])
        assertEquals(QuickResult("p1", "project", "Backend Refactoring", "ACTIVE"), results[1])
    }

    @Test
    fun emptyResultsWhenMissingOrMalformed() {
        assertEquals(0, parseQuickResults("""{"results":[]}""").size)
        assertEquals(0, parseQuickResults("""{}""").size)
        assertEquals(0, parseQuickResults("not json").size)
    }

    @Test
    fun serverSearchNeedsTwoChars() {
        assertEquals(false, shouldSearchServer(""))
        assertEquals(false, shouldSearchServer("a"))
        assertEquals(false, shouldSearchServer("  "))
        assertEquals(true, shouldSearchServer("ab"))
        assertEquals(true, shouldSearchServer("  doc  "))
    }
}
