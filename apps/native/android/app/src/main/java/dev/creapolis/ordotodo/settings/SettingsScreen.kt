package dev.creapolis.ordotodo.settings

import android.content.Intent
import android.os.Build
import android.provider.Settings
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import dev.creapolis.ordotodo.BuildConfig
import dev.creapolis.ordotodo.R
import dev.creapolis.ordotodo.data.ApiClient
import dev.creapolis.ordotodo.data.SessionStore
import dev.creapolis.ordotodo.data.UnauthorizedException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Ajustes tab (F3b/F5a): sign out, system notification and language
 * screens, the version, and the danger zone (delete account).
 * Server-side plan and pomodoro tuning do not exist in the API, so the
 * app does not pretend to offer them.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(session: SessionStore) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var showDelete by remember { mutableStateOf(false) }
    var deleting by remember { mutableStateOf(false) }
    var deleteError by remember { mutableStateOf(false) }
    Scaffold(
        topBar = {
            TopAppBar(title = { Text(stringResource(R.string.settings_title)) })
        },
    ) { inner ->
        Column(
            Modifier.fillMaxSize().padding(inner).padding(horizontal = 16.dp).verticalScroll(
                rememberScrollState(),
            ),
        ) {
            Text(
                text = stringResource(R.string.settings_account),
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 12.dp, bottom = 8.dp),
            )
            Button(
                onClick = {
                    CoroutineScope(Dispatchers.Main).launch { session.clear() }
                },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(stringResource(R.string.settings_sign_out))
            }
            Spacer(Modifier.height(16.dp))
            Text(
                text = stringResource(R.string.settings_notifications),
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(bottom = 8.dp),
            )
            OutlinedButton(
                onClick = {
                    context.startActivity(
                        Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
                            putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
                        },
                    )
                },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(stringResource(R.string.settings_open_settings))
            }
            if (Build.VERSION.SDK_INT >= 33) {
                Spacer(Modifier.height(16.dp))
                Text(
                    text = stringResource(R.string.settings_language),
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(bottom = 8.dp),
                )
                OutlinedButton(
                    onClick = {
                        context.startActivity(
                            Intent(Settings.ACTION_APP_LOCALE_SETTINGS).apply {
                                putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
                            },
                        )
                    },
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text(stringResource(R.string.settings_open_settings))
                }
            }
            Spacer(Modifier.height(16.dp))
            Text(
                text = stringResource(R.string.settings_about),
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(bottom = 8.dp),
            )
            Text(
                text = "${stringResource(R.string.settings_version)} ${BuildConfig.VERSION_NAME}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(16.dp))
            Text(
                text = stringResource(R.string.settings_danger),
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.error,
                modifier = Modifier.padding(bottom = 8.dp),
            )
            OutlinedButton(
                onClick = { showDelete = true },
                colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(stringResource(R.string.settings_delete_account))
            }
            if (deleteError) {
                Spacer(Modifier.height(8.dp))
                Text(
                    text = stringResource(R.string.settings_delete_error),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.error,
                )
            }
            Spacer(Modifier.height(24.dp))
        }
    }
    if (showDelete) {
        AlertDialog(
            onDismissRequest = { if (!deleting) showDelete = false },
            title = { Text(stringResource(R.string.settings_delete_title)) },
            text = { Text(stringResource(R.string.settings_delete_text)) },
            confirmButton = {
                Button(
                    onClick = {
                        deleting = true
                        deleteError = false
                        scope.launch {
                            try {
                                ApiClient(BuildConfig.API_BASE_URL, session).delete("/users/me")
                                session.clear()
                            } catch (_: UnauthorizedException) {
                                session.clear()
                            } catch (_: Exception) {
                                deleting = false
                                deleteError = true
                                showDelete = false
                            }
                        }
                    },
                    enabled = !deleting,
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
                ) {
                    Text(stringResource(R.string.settings_delete_yes))
                }
            },
            dismissButton = {
                OutlinedButton(onClick = { showDelete = false }, enabled = !deleting) {
                    Text(stringResource(R.string.actions_cancel))
                }
            },
        )
    }
}
