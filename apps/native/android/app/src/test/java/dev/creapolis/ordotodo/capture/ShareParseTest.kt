package dev.creapolis.ordotodo.capture

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class ShareParseTest {
    @Test
    fun acceptsPlainTextSend() {
        assertEquals(
            "Comprar pan #casa",
            extractSharedText(
                "android.intent.action.SEND",
                "text/plain",
                "  Comprar pan #casa  ",
            ),
        )
    }

    @Test
    fun rejectsOtherActionsAndTypes() {
        assertNull(extractSharedText("android.intent.action.VIEW", "text/plain", "x"))
        assertNull(extractSharedText("android.intent.action.SEND", "image/png", "x"))
        assertNull(extractSharedText(null, null, null))
    }

    @Test
    fun rejectsBlankText() {
        assertNull(extractSharedText("android.intent.action.SEND", "text/plain", "   "))
    }

    @Test
    fun capsVeryLongShares() {
        val long = "a".repeat(2000)
        val out = extractSharedText("android.intent.action.SEND", "text/plain", long)
        assertEquals(500, out!!.length)
    }
}
