package dev.creapolis.ordotodo.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

/**
 * Ordo's Material 3 theme. The schemes come from the shared tokens
 * (OrdoTokens.kt, generated); wallpaper-based Dynamic Color is an opt-in the
 * user turns on in Settings, never the default, so the brand violet stays the
 * action voice (ODD 050, D5).
 */
@Composable
fun OrdoTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit,
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> OrdoDarkColorScheme
        else -> OrdoLightColorScheme
    }
    MaterialTheme(colorScheme = colorScheme, typography = OrdoTypography, content = content)
}
