package dev.creapolis.ordotodo.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.ExperimentalTextApi
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontVariation
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import dev.creapolis.ordotodo.R

/**
 * Every text role uses the system face (Roboto or the device maker's) on
 * Material's sp scale, so text follows the user's font size (ODD 050, D2).
 */
val OrdoTypography = Typography()

/**
 * Inter's open-shaped digits, the web's numerals (DESIGN.md: cv02 open 4,
 * cv03 open 6, cv04 open 9, cv11), plus tabular figures so counters never jitter.
 */
private const val NUMERAL_FEATURES = "\"tnum\", \"cv02\", \"cv03\", \"cv04\", \"cv11\""

@OptIn(ExperimentalTextApi::class)
private fun inter(weight: FontWeight, opticalSize: Float): Font =
    Font(
        resId = R.font.inter_variable,
        weight = weight,
        variationSettings = FontVariation.Settings(
            FontVariation.weight(weight.weight),
            FontVariation.Setting("opsz", opticalSize),
        ),
    )

/** Inter's display cut, for large numerals. */
private val InterDisplay = FontFamily(inter(FontWeight.SemiBold, opticalSize = 32f))

/** Inter's text cut, for numbers inside rows. */
private val InterText = FontFamily(inter(FontWeight.Medium, opticalSize = 14f))

/** The only places Inter appears in the native apps: numbers (ODD 050, D2). */
object OrdoNumerals {
    /** The focus timer, e.g. 25:00. */
    val Timer = TextStyle(
        fontFamily = InterDisplay,
        fontWeight = FontWeight.SemiBold,
        fontSize = 72.sp,
        lineHeight = 80.sp,
        fontFeatureSettings = NUMERAL_FEATURES,
    )

    /** Day progress and large counters, e.g. 4/9. */
    val Counter = TextStyle(
        fontFamily = InterDisplay,
        fontWeight = FontWeight.SemiBold,
        fontSize = 32.sp,
        lineHeight = 40.sp,
        fontFeatureSettings = NUMERAL_FEATURES,
    )

    /** Times and streak counts inside list rows. */
    val Inline = TextStyle(
        fontFamily = InterText,
        fontWeight = FontWeight.Medium,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        fontFeatureSettings = NUMERAL_FEATURES,
    )
}
