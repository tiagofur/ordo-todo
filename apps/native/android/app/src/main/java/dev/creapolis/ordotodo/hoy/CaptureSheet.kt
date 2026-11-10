package dev.creapolis.ordotodo.hoy

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import dev.creapolis.ordotodo.R
import dev.creapolis.ordotodo.data.NativeProject

/**
 * Express capture sheet (F1c + `#project` in F1d): one field, local ES/EN/PT
 * parsing with a live preview, single POST on save. The caller closes the
 * sheet on the `today_task_created` event; on failure it stays open with
 * the text kept.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CaptureSheet(
    creating: Boolean,
    projects: List<NativeProject>,
    initialText: String = "",
    onSave: (String) -> Unit,
    onDismiss: () -> Unit,
) {
    var text by remember(initialText) { mutableStateOf(initialText) }
    val parsed = remember(text) { parseCapture(text) }
    val projectName =
        remember(parsed, projects) {
            resolveProjectId(parsed.projectHint, projects)?.let { id ->
                projects.firstOrNull { it.id == id }?.name
            }
        }
    val preview =
        remember(parsed, projectName) {
            listOfNotNull(
                parsed.scheduledDate?.toString(),
                parsed.scheduledTime,
                parsed.priority,
                projectName,
            ).joinToString(" · ")
        }
    val focus = remember { FocusRequester() }
    LaunchedEffect(Unit) { focus.requestFocus() }
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
    ) {
        Column(Modifier.fillMaxWidth().padding(horizontal = 20.dp).imePadding()) {
            Text(
                text = stringResource(R.string.today_capture_title),
                style = MaterialTheme.typography.titleLarge,
            )
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(
                value = text,
                onValueChange = { text = it },
                modifier = Modifier.fillMaxWidth().focusRequester(focus),
                placeholder = { Text(stringResource(R.string.today_capture_hint)) },
                supportingText = {
                    if (preview.isNotEmpty()) {
                        Text(preview, style = MaterialTheme.typography.bodySmall)
                    }
                },
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                keyboardActions =
                    KeyboardActions(
                        onDone = { if (text.isNotBlank() && !creating) onSave(text) },
                    ),
            )
            Spacer(Modifier.height(12.dp))
            Button(
                onClick = { onSave(text) },
                enabled = text.isNotBlank() && !creating,
                modifier = Modifier.fillMaxWidth(),
            ) {
                if (creating) {
                    CircularProgressIndicator()
                } else {
                    Text(stringResource(R.string.actions_save))
                }
            }
            Spacer(Modifier.height(16.dp))
        }
    }
}
