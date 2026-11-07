package dev.creapolis.ordotodo.ui.catalog

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.LargeTopAppBar
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import dev.creapolis.ordotodo.R
import dev.creapolis.ordotodo.ui.theme.OrdoNumerals
import dev.creapolis.ordotodo.ui.theme.OrdoSectionColors
import java.util.Locale

/**
 * F0 design-system catalog (ODD 050). Renders the generated tokens, the native
 * string catalog and the type ramp so both themes and all three locales can be
 * checked on a device. It is developer-facing, so its technical labels stay
 * untranslated; F1 replaces it with the Today screen.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DesignSystemCatalog() {
    val scrollBehavior = TopAppBarDefaults.exitUntilCollapsedScrollBehavior()
    val locale = LocalConfiguration.current.locales[0].toLanguageTag()
    val pairs = colorPairs(MaterialTheme.colorScheme)

    Scaffold(
        modifier = Modifier.nestedScroll(scrollBehavior.nestedScrollConnection),
        topBar = {
            LargeTopAppBar(
                title = { Text(stringResource(R.string.app_name)) },
                scrollBehavior = scrollBehavior,
            )
        },
    ) { innerPadding ->
        LazyColumn(
            contentPadding = PaddingValues(
                start = 16.dp,
                end = 16.dp,
                top = innerPadding.calculateTopPadding(),
                bottom = innerPadding.calculateBottomPadding() + 24.dp,
            ),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            item { SectionTitle("Strings · $locale") }
            item { StringsSample() }
            item { SectionTitle("Numerals · Inter") }
            item { NumeralsSample() }
            item { SectionTitle("Type · system face") }
            item { TypeSample() }
            item { SectionTitle("Section signatures") }
            items(sectionSignatures) { (name, color) -> SignatureRow(name, color) }
            item { SectionTitle("Color scheme") }
            items(pairs) { pair -> ColorPairRow(pair) }
        }
    }
}

private data class ColorPair(val name: String, val background: Color, val content: Color)

private fun colorPairs(scheme: ColorScheme): List<ColorPair> = listOf(
    ColorPair("primary", scheme.primary, scheme.onPrimary),
    ColorPair("primaryContainer", scheme.primaryContainer, scheme.onPrimaryContainer),
    ColorPair("secondary", scheme.secondary, scheme.onSecondary),
    ColorPair("secondaryContainer", scheme.secondaryContainer, scheme.onSecondaryContainer),
    ColorPair("tertiary", scheme.tertiary, scheme.onTertiary),
    ColorPair("tertiaryContainer", scheme.tertiaryContainer, scheme.onTertiaryContainer),
    ColorPair("error", scheme.error, scheme.onError),
    ColorPair("errorContainer", scheme.errorContainer, scheme.onErrorContainer),
    ColorPair("surface", scheme.surface, scheme.onSurface),
    ColorPair("surfaceContainerLowest", scheme.surfaceContainerLowest, scheme.onSurface),
    ColorPair("surfaceContainerLow", scheme.surfaceContainerLow, scheme.onSurface),
    ColorPair("surfaceContainer", scheme.surfaceContainer, scheme.onSurface),
    ColorPair("surfaceContainerHigh", scheme.surfaceContainerHigh, scheme.onSurface),
    ColorPair("surfaceContainerHighest", scheme.surfaceContainerHighest, scheme.onSurface),
    ColorPair("surfaceVariant", scheme.surfaceVariant, scheme.onSurfaceVariant),
    ColorPair("inverseSurface", scheme.inverseSurface, scheme.inverseOnSurface),
)

private val sectionSignatures = listOf(
    "dashboard" to OrdoSectionColors.Dashboard,
    "tasks" to OrdoSectionColors.Tasks,
    "projects" to OrdoSectionColors.Projects,
    "workspaces" to OrdoSectionColors.Workspaces,
    "calendar" to OrdoSectionColors.Calendar,
    "goals" to OrdoSectionColors.Goals,
    "habits" to OrdoSectionColors.Habits,
    "notes" to OrdoSectionColors.Notes,
    "wellbeing" to OrdoSectionColors.Wellbeing,
)

private fun Color.hex(): String = String.format(Locale.ROOT, "#%06X", 0xFFFFFF and toArgb())

@Composable
private fun SectionTitle(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.titleSmall,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier.padding(top = 16.dp, bottom = 4.dp),
    )
}

@Composable
private fun CatalogCard(content: @Composable ColumnScope.() -> Unit) {
    Surface(
        color = MaterialTheme.colorScheme.surfaceContainerLow,
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            content = content,
        )
    }
}

@Composable
private fun StringsSample() {
    val tabs = listOf(R.string.tabs_today, R.string.tabs_tasks, R.string.tabs_habits, R.string.tabs_settings)
    val sections = listOf(
        R.string.today_sections_overdue,
        R.string.today_sections_morning,
        R.string.today_sections_afternoon,
        R.string.today_sections_evening,
        R.string.today_sections_anytime,
    )
    val actions = listOf(
        R.string.actions_add_task,
        R.string.actions_complete,
        R.string.actions_undo,
        R.string.actions_move_to_tomorrow,
        R.string.actions_start_focus,
    )
    CatalogCard {
        Text(tabs.map { stringResource(it) }.joinToString(" · "), style = MaterialTheme.typography.titleMedium)
        Text(sections.map { stringResource(it) }.joinToString(" · "), style = MaterialTheme.typography.bodyMedium)
        Text(
            listOf(
                stringResource(R.string.today_sections_done, 3),
                stringResource(R.string.today_progress, 4, 9),
                pluralStringResource(R.plurals.habits_streak, 1, 1),
                pluralStringResource(R.plurals.habits_streak, 12, 12),
            ).joinToString(" · "),
            style = MaterialTheme.typography.bodyMedium,
        )
        Text(stringResource(R.string.today_empty_title), style = MaterialTheme.typography.titleMedium)
        Text(
            stringResource(R.string.today_empty_body),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Text(actions.map { stringResource(it) }.joinToString(" · "), style = MaterialTheme.typography.labelLarge)
    }
}

@Composable
private fun NumeralsSample() {
    CatalogCard {
        Text("25:00", style = OrdoNumerals.Timer, color = MaterialTheme.colorScheme.primary)
        Row(horizontalArrangement = Arrangement.spacedBy(24.dp)) {
            Text("4/9", style = OrdoNumerals.Counter)
            Text("1469", style = OrdoNumerals.Counter)
        }
        Text(
            "11:00 · 16:49 · 12",
            style = OrdoNumerals.Inline,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun TypeSample() {
    val type = MaterialTheme.typography
    val roles: List<Pair<String, TextStyle>> = listOf(
        "displaySmall" to type.displaySmall,
        "headlineMedium" to type.headlineMedium,
        "titleLarge" to type.titleLarge,
        "titleMedium" to type.titleMedium,
        "bodyLarge" to type.bodyLarge,
        "bodyMedium" to type.bodyMedium,
        "labelLarge" to type.labelLarge,
        "labelMedium" to type.labelMedium,
    )
    CatalogCard {
        roles.forEach { (name, style) ->
            Text(name, style = style, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
    }
}

@Composable
private fun SignatureRow(name: String, color: Color) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
    ) {
        Box(
            Modifier
                .size(20.dp)
                .background(color, CircleShape),
        )
        Spacer(Modifier.width(12.dp))
        Text(name, style = MaterialTheme.typography.bodyLarge, modifier = Modifier.weight(1f))
        Text(
            color.hex(),
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun ColorPairRow(pair: ColorPair) {
    Surface(
        color = pair.background,
        contentColor = pair.content,
        shape = RoundedCornerShape(12.dp),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text("Aa", style = MaterialTheme.typography.titleLarge)
            Spacer(Modifier.width(16.dp))
            Column(Modifier.weight(1f)) {
                Text(pair.name, style = MaterialTheme.typography.labelLarge)
                Text(
                    "${pair.background.hex()} / ${pair.content.hex()}",
                    style = MaterialTheme.typography.bodySmall,
                )
            }
        }
    }
}
