package dev.creapolis.ordotodo.hoy

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import dev.creapolis.ordotodo.R
import dev.creapolis.ordotodo.data.TodayTask
import dev.creapolis.ordotodo.ui.theme.OrdoNumerals
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle
import java.util.Locale

/** The Day list: every section in one scroll, done tasks closing it (F1b makes the circles tappable). */
@Composable
fun HoyScreen(viewModel: HoyViewModel) {
    val state by viewModel.state.collectAsState()
    when (val current = state) {
        is HoyUiState.Loading -> LoadingDay()
        is HoyUiState.Offline -> OfflineDay(onRetry = viewModel::refresh)
        is HoyUiState.Content -> DayList(current)
    }
}

@Composable
private fun LoadingDay() {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        CircularProgressIndicator()
    }
}

@Composable
private fun OfflineDay(onRetry: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = stringResource(R.string.auth_error_network),
            style = MaterialTheme.typography.bodyLarge,
        )
        Spacer(Modifier.height(16.dp))
        Button(onClick = onRetry) {
            Text(stringResource(R.string.today_empty_retry))
        }
    }
}

@Composable
private fun DayList(content: HoyUiState.Content) {
    val dateLine =
        LocalDate.now().format(
            DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM).withLocale(Locale.getDefault()),
        )
    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth().padding(top = 16.dp, bottom = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column(Modifier.weight(1f)) {
                    Text(
                        text = dateLine,
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.primary,
                    )
                    Text(
                        text = stringResource(R.string.tabs_today),
                        style = MaterialTheme.typography.headlineLarge,
                    )
                    Text(
                        text = stringResource(R.string.today_progress, content.done, content.total),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                DayRing(done = content.done, total = content.total)
            }
        }
        if (content.sections.isEmpty()) {
            item {
                Column(Modifier.fillMaxWidth().padding(vertical = 48.dp)) {
                    Text(
                        text = stringResource(R.string.today_empty_title),
                        style = MaterialTheme.typography.titleLarge,
                    )
                    Text(
                        text = stringResource(R.string.today_empty_body),
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
            }
        }
        for (section in content.sections) {
            item(key = "header-${section.kind}") {
                SectionHeader(kind = section.kind, count = section.tasks.size)
            }
            items(section.tasks, key = { "task-${it.id}" }) { task ->
                TaskRow(task)
            }
        }
        item { Spacer(Modifier.height(24.dp)) }
    }
}

@Composable
private fun DayRing(done: Int, total: Int) {
    val progress = if (total == 0) 0f else done.toFloat() / total.toFloat()
    val track = MaterialTheme.colorScheme.surfaceVariant
    val bar = MaterialTheme.colorScheme.primary
    val label = "$done/$total"
    Row(verticalAlignment = Alignment.CenterVertically) {
        Text(
            text = label,
            style = OrdoNumerals.Counter,
            color = MaterialTheme.colorScheme.primary,
        )
        Spacer(Modifier.width(12.dp))
        Canvas(Modifier.size(40.dp)) {
            drawArc(track, 0f, 360f, false, style = Stroke(width = 8f, cap = StrokeCap.Round))
            if (progress > 0f) {
                drawArc(bar, -90f, 360f * progress, false, style = Stroke(width = 8f, cap = StrokeCap.Round))
            }
        }
    }
}

@Composable
private fun SectionHeader(kind: DaySectionKind, count: Int) {
    val name =
        when (kind) {
            DaySectionKind.OVERDUE -> stringResource(R.string.today_sections_overdue)
            DaySectionKind.MORNING -> stringResource(R.string.today_sections_morning)
            DaySectionKind.AFTERNOON -> stringResource(R.string.today_sections_afternoon)
            DaySectionKind.EVENING -> stringResource(R.string.today_sections_evening)
            DaySectionKind.ANYTIME -> stringResource(R.string.today_sections_anytime)
            DaySectionKind.DONE -> stringResource(R.string.today_sections_done, count)
        }
    Text(
        text = name,
        style = MaterialTheme.typography.labelLarge,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        modifier = Modifier.padding(top = 12.dp, bottom = 2.dp),
    )
}

@Composable
private fun TaskRow(task: TodayTask) {
    val scheme = MaterialTheme.colorScheme
    Card(
        colors =
            CardDefaults.cardColors(
                containerColor = scheme.surfaceContainerLow,
            ),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            CheckDot(done = task.isDone)
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(
                    text = task.title,
                    style = MaterialTheme.typography.bodyLarge,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    textDecoration = if (task.isDone) TextDecoration.LineThrough else null,
                    color = if (task.isDone) scheme.onSurfaceVariant else scheme.onSurface,
                )
                TaskMeta(task)
            }
            if (task.scheduledTime != null) {
                Spacer(Modifier.width(12.dp))
                Text(
                    text = task.scheduledTime,
                    style = OrdoNumerals.Inline,
                    color = scheme.onSurfaceVariant,
                )
            }
        }
    }
}

@Composable
private fun TaskMeta(task: TodayTask) {
    val scheme = MaterialTheme.colorScheme
    val bits = mutableListOf<String>()
    task.project?.let { bits.add(it.name) }
    if (task.subTasks.isNotEmpty()) bits.add("${task.doneSubTasks}/${task.subTasks.size}")
    if (bits.isEmpty()) return
    Row(verticalAlignment = Alignment.CenterVertically) {
        task.project?.color?.let { hex ->
            ProjectDot(hex)
            Spacer(Modifier.width(5.dp))
        }
        Text(
            text = bits.joinToString(" · "),
            style = MaterialTheme.typography.bodySmall,
            color = scheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun ProjectDot(hex: String) {
    val color =
        try {
            Color(android.graphics.Color.parseColor(hex))
        } catch (_: IllegalArgumentException) {
            Color.Gray
        }
    Canvas(Modifier.size(8.dp)) { drawCircle(color) }
}

@Composable
private fun CheckDot(done: Boolean) {
    val scheme = MaterialTheme.colorScheme
    val ring = if (done) scheme.primary else scheme.primary.copy(alpha = 0.45f)
    Canvas(Modifier.size(22.dp)) {
        if (done) drawCircle(ring) else drawCircle(ring, style = Stroke(width = 5f))
    }
}
