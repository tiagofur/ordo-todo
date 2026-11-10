package dev.creapolis.ordotodo.capture

import android.content.Intent

/** Max prefill the capture box accepts from outside the app. */
const val SHARE_PREFILL_LIMIT = 500

/**
 * Shared text in (F4a). Only `ACTION_SEND` of `text/plain` passes;
 * blank shares are dropped and long ones are capped so the capture
 * box never opens with a wall of text.
 */
fun extractSharedText(
    action: String?,
    type: String?,
    text: String?,
): String? {
    if (action != Intent.ACTION_SEND || type != "text/plain") return null
    val clean = text?.trim().orEmpty()
    if (clean.isEmpty()) return null
    return clean.take(SHARE_PREFILL_LIMIT)
}
