// GENERATED FILE — DO NOT EDIT.
// Source: packages/styles/src/tokens.ts, via @ordo-todo/native-codegen.
// Regenerate with: npm run generate -w @ordo-todo/native-codegen
package dev.creapolis.ordotodo.ui.theme

import androidx.compose.material3.ColorScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.ui.graphics.Color

/** Material 3 light scheme: primary pinned to the brand token, tonal roles from its hue. */
internal val OrdoLightColorScheme: ColorScheme = lightColorScheme(
    primary = Color(0xFF7C3AED),
    onPrimary = Color(0xFFFFFFFF),
    primaryContainer = Color(0xFFEADDFF),
    onPrimaryContainer = Color(0xFF220F46),
    inversePrimary = Color(0xFFD2BCFD),
    secondary = Color(0xFF635B70),
    onSecondary = Color(0xFFFFFFFF),
    secondaryContainer = Color(0xFFE9DEF8),
    onSecondaryContainer = Color(0xFF1E182B),
    tertiary = Color(0xFF7E525E),
    onTertiary = Color(0xFFFFFFFF),
    tertiaryContainer = Color(0xFFFFD9E1),
    onTertiaryContainer = Color(0xFF31101B),
    background = Color(0xFFFDF8FD),
    onBackground = Color(0xFF1D1B1E),
    surface = Color(0xFFFDF8FD),
    onSurface = Color(0xFF1D1B1E),
    surfaceVariant = Color(0xFFECE6EE),
    onSurfaceVariant = Color(0xFF49454C),
    surfaceTint = Color(0xFF7C3AED),
    inverseSurface = Color(0xFF323033),
    inverseOnSurface = Color(0xFFF5EFF4),
    error = Color(0xFFBA1A1A),
    onError = Color(0xFFFFFFFF),
    errorContainer = Color(0xFFFFDAD6),
    onErrorContainer = Color(0xFF410002),
    outline = Color(0xFF7A757D),
    outlineVariant = Color(0xFFCAC5CC),
    scrim = Color(0xFF000000),
    surfaceBright = Color(0xFFFDF8FD),
    surfaceContainer = Color(0xFFF2ECF1),
    surfaceContainerHigh = Color(0xFFEFE9EE),
    surfaceContainerHighest = Color(0xFFECE6EB),
    surfaceContainerLow = Color(0xFFF8F2F7),
    surfaceContainerLowest = Color(0xFFFFFFFF),
    surfaceDim = Color(0xFFDED8DD),
)

/** Material 3 dark scheme: primary pinned to the brand token, tonal roles from its hue. */
internal val OrdoDarkColorScheme: ColorScheme = darkColorScheme(
    primary = Color(0xFFA78BFA),
    onPrimary = Color(0xFF1A1A24),
    primaryContainer = Color(0xFF4F3D74),
    onPrimaryContainer = Color(0xFFEADDFF),
    inversePrimary = Color(0xFF67548E),
    secondary = Color(0xFFCDC2DB),
    onSecondary = Color(0xFF342D40),
    secondaryContainer = Color(0xFF4B4358),
    onSecondaryContainer = Color(0xFFE9DEF8),
    tertiary = Color(0xFFF0B7C5),
    onTertiary = Color(0xFF4A2530),
    tertiaryContainer = Color(0xFF643B46),
    onTertiaryContainer = Color(0xFFFFD9E1),
    background = Color(0xFF141316),
    onBackground = Color(0xFFE6E1E6),
    surface = Color(0xFF141316),
    onSurface = Color(0xFFE6E1E6),
    surfaceVariant = Color(0xFF49454C),
    onSurfaceVariant = Color(0xFFCAC5CC),
    surfaceTint = Color(0xFFA78BFA),
    inverseSurface = Color(0xFFE6E1E6),
    inverseOnSurface = Color(0xFF323033),
    error = Color(0xFFFFB4AB),
    onError = Color(0xFF690005),
    errorContainer = Color(0xFF93000A),
    onErrorContainer = Color(0xFFFFDAD6),
    outline = Color(0xFF948F96),
    outlineVariant = Color(0xFF49454C),
    scrim = Color(0xFF000000),
    surfaceBright = Color(0xFF3B383C),
    surfaceContainer = Color(0xFF211F22),
    surfaceContainerHigh = Color(0xFF2B292D),
    surfaceContainerHighest = Color(0xFF363438),
    surfaceContainerLow = Color(0xFF1D1B1E),
    surfaceContainerLowest = Color(0xFF0F0E11),
    surfaceDim = Color(0xFF141316),
)

/** Section signatures: they identify a module, never drive an action (DESIGN.md). */
object OrdoSectionColors {
    val Dashboard = Color(0xFF06B6D4)
    val Tasks = Color(0xFF8B5CF6)
    val Projects = Color(0xFFEC4899)
    val Workspaces = Color(0xFFF97316)
    val Calendar = Color(0xFF3B82F6)
    val Goals = Color(0xFFEC4899)
    val Habits = Color(0xFF10B981)
    val Notes = Color(0xFFEAB308)
    val Wellbeing = Color(0xFFF43F5E)
}

/** Brand identity: app icon and BrandMark only, never an action color (DESIGN.md). */
object OrdoBrandColors {
    val Mark = Color(0xFFAD46FF)
}

/** Closed palettes: values are picked from these lists, never invented. */
object OrdoPalettes {
    val Project: List<Color> = listOf(
        Color(0xFF3B82F6),
        Color(0xFF8B5CF6),
        Color(0xFFEC4899),
        Color(0xFFF97316),
        Color(0xFF10B981),
        Color(0xFF06B6D4),
        Color(0xFFF43F5E),
    )
    val Tag: List<Color> = listOf(
        Color(0xFFEF4444),
        Color(0xFFF97316),
        Color(0xFFF59E0B),
        Color(0xFF84CC16),
        Color(0xFF22C55E),
        Color(0xFF14B8A6),
        Color(0xFF06B6D4),
        Color(0xFF3B82F6),
        Color(0xFF8B5CF6),
        Color(0xFFEC4899),
    )
}
