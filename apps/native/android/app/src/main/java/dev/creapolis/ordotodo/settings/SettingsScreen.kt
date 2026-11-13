package dev.creapolis.ordotodo.settings

import android.content.Intent
import android.os.Build
import android.provider.Settings
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.ListItem
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import dev.creapolis.ordotodo.BuildConfig
import dev.creapolis.ordotodo.R
import dev.creapolis.ordotodo.data.ApiClient
import dev.creapolis.ordotodo.data.SessionStore
import dev.creapolis.ordotodo.data.TimerRepository
import dev.creapolis.ordotodo.data.UnauthorizedException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import org.json.JSONObject

@Serializable
private data class PlanWire(
    val plan: String = "FREE",
)

@Serializable
private data class ProfileWire(
    val name: String = "",
    val username: String = "",
    val email: String = "",
    val subscription: PlanWire = PlanWire(),
)

/**
 * Ajustes tab (S19): perfil, apariencia (tema + Dynamic Color opt-in),
 * horas del día, Pomodoro del servidor, antelación de recordatorios,
 * notificaciones, idioma, acerca de, zona de peligro y, al final y en voz
 * baja, cerrar sesión. Sin Google nativo: el backend solo ofrece OAuth web.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    session: SessionStore,
    settings: AppSettings,
    timers: TimerRepository,
    onPomodoroSaved: suspend () -> Unit,
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var showDelete by remember { mutableStateOf(false) }
    var deleting by remember { mutableStateOf(false) }
    var deleteError by remember { mutableStateOf(false) }
    val scrollBehavior = TopAppBarDefaults.pinnedScrollBehavior()
    val api = remember(session) { ApiClient(BuildConfig.API_BASE_URL, session) }
    val json = remember { Json { ignoreUnknownKeys = true } }

    val themeMode by settings.themeMode.collectAsState(initial = SettingsLogic.THEME_SYSTEM)
    val dynamicColor by settings.dynamicColor.collectAsState(initial = false)
    val availableMinutes by settings.availableMinutes.collectAsState(initial = 480)
    val reminderLead by settings.reminderLeadMinutes.collectAsState(initial = 0)

    var profile by remember { mutableStateOf<ProfileWire?>(null) }
    var profileFailed by remember { mutableStateOf(false) }
    LaunchedEffect(session) {
        try {
            profile = json.decodeFromString<ProfileWire>(api.get("/users/me/profile"))
            profileFailed = false
        } catch (_: Exception) {
            profileFailed = true
        }
    }

    var forgotEmail by remember(profile) { mutableStateOf(profile?.email.orEmpty()) }
    var forgotSending by remember { mutableStateOf(false) }
    var forgotSent by remember { mutableStateOf(false) }
    var forgotError by remember { mutableStateOf(false) }

    var pomoWork by remember { mutableStateOf("") }
    var pomoShort by remember { mutableStateOf("") }
    var pomoLong by remember { mutableStateOf("") }
    var pomoCount by remember { mutableStateOf("") }
    var pomoLoaded by remember { mutableStateOf(false) }
    var pomoSaving by remember { mutableStateOf(false) }
    var pomoSaved by remember { mutableStateOf(false) }
    var pomoError by remember { mutableStateOf(false) }
    LaunchedEffect(timers) {
        try {
            val config = timers.getPreferences()
            pomoWork = config.workDurationMinutes.toString()
            pomoShort = config.shortBreakMinutes.toString()
            pomoLong = config.longBreakMinutes.toString()
            pomoCount = config.pomodorosUntilLongBreak.toString()
            pomoLoaded = true
        } catch (_: Exception) {
        }
    }
    val pomoNumbers = listOf(pomoWork, pomoShort, pomoLong, pomoCount).map { it.toIntOrNull() }
    val pomoValid =
        SettingsLogic.validPomodoro(pomoNumbers[0], pomoNumbers[1], pomoNumbers[2], pomoNumbers[3])

    Scaffold(
        modifier = Modifier.nestedScroll(scrollBehavior.nestedScrollConnection),
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.settings_title)) },
                scrollBehavior = scrollBehavior,
            )
        },
    ) { inner ->
        Column(
            Modifier
                .fillMaxSize()
                .padding(inner)
                .padding(horizontal = 16.dp)
                .verticalScroll(rememberScrollState()),
        ) {
            Spacer(Modifier.height(8.dp))

            // Cuenta: perfil + recuperar contraseña
            SectionLabel(stringResource(R.string.settings_account))
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Column(Modifier.padding(vertical = 4.dp)) {
                    if (profile != null) {
                        val displayName = profile!!.name.ifBlank { profile!!.username }.ifBlank { profile!!.email }
                        ListItem(
                            headlineContent = { Text(displayName) },
                            supportingContent = {
                                Text(
                                    text = profile!!.email + " · " +
                                        context.getString(R.string.settings_profile_plan, profile!!.subscription.plan),
                                )
                            },
                            leadingContent = {
                                Icon(
                                    imageVector = Icons.Default.Person,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary,
                                )
                            },
                            colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                        )
                    } else if (profileFailed) {
                        ListItem(
                            headlineContent = { Text(stringResource(R.string.settings_profile)) },
                            supportingContent = { Text(stringResource(R.string.auth_error_network)) },
                            leadingContent = {
                                Icon(
                                    imageVector = Icons.Default.Person,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.error,
                                )
                            },
                            colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                        )
                    }
                }
            }
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = forgotEmail,
                onValueChange = {
                    forgotEmail = it
                    forgotSent = false
                    forgotError = false
                },
                label = { Text(stringResource(R.string.settings_forgot_email)) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.height(8.dp))
            Text(
                text = stringResource(R.string.settings_forgot_hint),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(start = 8.dp),
            )
            Spacer(Modifier.height(8.dp))
            OutlinedButton(
                onClick = {
                    forgotSending = true
                    forgotSent = false
                    forgotError = false
                    scope.launch {
                        try {
                            api.post(
                                "/auth/forgot-password",
                                JSONObject().put("email", forgotEmail.trim()).toString(),
                            )
                            forgotSent = true
                        } catch (_: Exception) {
                            forgotError = true
                        } finally {
                            forgotSending = false
                        }
                    }
                },
                enabled = !forgotSending && "@" in forgotEmail,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(stringResource(R.string.settings_forgot_send))
            }
            if (forgotSent) {
                Spacer(Modifier.height(8.dp))
                Text(
                    text = stringResource(R.string.settings_forgot_sent),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(start = 8.dp),
                )
            }
            if (forgotError) {
                Spacer(Modifier.height(8.dp))
                Text(
                    text = stringResource(R.string.settings_forgot_error),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.padding(start = 8.dp),
                )
            }

            Spacer(Modifier.height(16.dp))

            // Apariencia: tema + Dynamic Color opt-in (D5)
            SectionLabel(stringResource(R.string.settings_appearance))
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        for ((mode, label) in
                            listOf(
                                SettingsLogic.THEME_SYSTEM to stringResource(R.string.settings_theme_system),
                                SettingsLogic.THEME_LIGHT to stringResource(R.string.settings_theme_light),
                                SettingsLogic.THEME_DARK to stringResource(R.string.settings_theme_dark),
                            )
                        ) {
                            FilterChip(
                                selected = themeMode == mode,
                                onClick = { scope.launch { settings.setThemeMode(mode) } },
                                label = { Text(label) },
                            )
                        }
                    }
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                        ListItem(
                            headlineContent = { Text(stringResource(R.string.settings_dynamic_color)) },
                            supportingContent = { Text(stringResource(R.string.settings_dynamic_color_hint)) },
                            trailingContent = {
                                Switch(
                                    checked = dynamicColor,
                                    onCheckedChange = { scope.launch { settings.setDynamicColor(it) } },
                                )
                            },
                            colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                        )
                    }
                }
            }

            Spacer(Modifier.height(16.dp))

            // Día: horas disponibles para la barra de capacidad (S10)
            SectionLabel(stringResource(R.string.settings_day_hours))
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(12.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    for (hours in listOf(4, 6, 8, 10, 12)) {
                        FilterChip(
                            selected = availableMinutes == hours * 60,
                            onClick = { scope.launch { settings.setAvailableMinutes(hours * 60) } },
                            label = {
                                Text(context.getString(R.string.settings_hours_unit, hours))
                            },
                        )
                    }
                }
            }

            Spacer(Modifier.height(16.dp))

            // Pomodoro del servidor (PATCH /users/me/preferences)
            SectionLabel(stringResource(R.string.settings_pomodoro))
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        OutlinedTextField(
                            value = pomoWork,
                            onValueChange = { pomoWork = it.filter(Char::isDigit); pomoSaved = false; pomoError = false },
                            label = { Text(stringResource(R.string.settings_pomo_work)) },
                            singleLine = true,
                            enabled = pomoLoaded,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(1f),
                        )
                        OutlinedTextField(
                            value = pomoShort,
                            onValueChange = { pomoShort = it.filter(Char::isDigit); pomoSaved = false; pomoError = false },
                            label = { Text(stringResource(R.string.settings_pomo_short)) },
                            singleLine = true,
                            enabled = pomoLoaded,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(1f),
                        )
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        OutlinedTextField(
                            value = pomoLong,
                            onValueChange = { pomoLong = it.filter(Char::isDigit); pomoSaved = false; pomoError = false },
                            label = { Text(stringResource(R.string.settings_pomo_long)) },
                            singleLine = true,
                            enabled = pomoLoaded,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(1f),
                        )
                        OutlinedTextField(
                            value = pomoCount,
                            onValueChange = { pomoCount = it.filter(Char::isDigit); pomoSaved = false; pomoError = false },
                            label = { Text(stringResource(R.string.settings_pomo_count)) },
                            singleLine = true,
                            enabled = pomoLoaded,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(1f),
                        )
                    }
                    Button(
                        onClick = {
                            pomoSaving = true
                            pomoSaved = false
                            pomoError = false
                            scope.launch {
                                try {
                                    api.patch(
                                        "/users/me/preferences",
                                        "{\"pomodoroDuration\":${pomoNumbers[0]}," +
                                            "\"shortBreakDuration\":${pomoNumbers[1]}," +
                                            "\"longBreakDuration\":${pomoNumbers[2]}," +
                                            "\"pomodorosUntilLongBreak\":${pomoNumbers[3]}}",
                                    )
                                    onPomodoroSaved()
                                    pomoSaved = true
                                } catch (_: Exception) {
                                    pomoError = true
                                } finally {
                                    pomoSaving = false
                                }
                            }
                        },
                        enabled = pomoLoaded && pomoValid && !pomoSaving,
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text(stringResource(R.string.settings_pomo_save))
                    }
                    if (pomoSaved) {
                        Text(
                            text = stringResource(R.string.settings_pomo_saved),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.padding(start = 8.dp),
                        )
                    }
                    if (pomoError) {
                        Text(
                            text = stringResource(R.string.settings_pomo_error),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.error,
                            modifier = Modifier.padding(start = 8.dp),
                        )
                    }
                }
            }

            Spacer(Modifier.height(16.dp))

            // Recordatorios: antelación por defecto (S9)
            SectionLabel(stringResource(R.string.settings_reminders))
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = stringResource(R.string.settings_reminder_lead),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        for ((lead, label) in
                            listOf(
                                0 to stringResource(R.string.settings_lead_at_time),
                                10 to stringResource(R.string.settings_lead10),
                                30 to stringResource(R.string.settings_lead30),
                            )
                        ) {
                            FilterChip(
                                selected = reminderLead == lead,
                                onClick = { scope.launch { settings.setReminderLeadMinutes(lead) } },
                                label = { Text(label) },
                            )
                        }
                    }
                }
            }

            Spacer(Modifier.height(16.dp))

            // Preferencias del sistema (notificaciones + idioma)
            SectionLabel(stringResource(R.string.settings_notifications))
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Column {
                    ListItem(
                        headlineContent = { Text(stringResource(R.string.settings_notifications)) },
                        supportingContent = { Text(stringResource(R.string.settings_open_settings)) },
                        leadingContent = {
                            Icon(
                                imageVector = Icons.Default.Notifications,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                            )
                        },
                        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                        modifier = Modifier
                            .clip(RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp))
                            .clickable {
                                context.startActivity(
                                    Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
                                        putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
                                    },
                                )
                            },
                    )

                    if (Build.VERSION.SDK_INT >= 33) {
                        ListItem(
                            headlineContent = { Text(stringResource(R.string.settings_language)) },
                            supportingContent = { Text(stringResource(R.string.settings_open_settings)) },
                            leadingContent = {
                                Icon(
                                    imageVector = Icons.Default.Settings,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary,
                                )
                            },
                            colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                            modifier = Modifier
                                .clip(RoundedCornerShape(bottomStart = 16.dp, bottomEnd = 16.dp))
                                .clickable {
                                    context.startActivity(
                                        Intent(Settings.ACTION_APP_LOCALE_SETTINGS).apply {
                                            putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
                                        },
                                    )
                                },
                        )
                    }
                }
            }

            Spacer(Modifier.height(16.dp))

            // Acerca de
            SectionLabel(stringResource(R.string.settings_about))
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow),
                modifier = Modifier.fillMaxWidth(),
            ) {
                ListItem(
                    headlineContent = { Text(stringResource(R.string.settings_about)) },
                    supportingContent = {
                        Text("${stringResource(R.string.settings_version)} ${BuildConfig.VERSION_NAME}")
                    },
                    leadingContent = {
                        Icon(
                            imageVector = Icons.Default.Info,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                        )
                    },
                    colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                )
            }

            Spacer(Modifier.height(16.dp))

            // Zona de peligro
            SectionLabel(
                text = stringResource(R.string.settings_danger),
                color = MaterialTheme.colorScheme.error,
            )
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.2f)),
                modifier = Modifier.fillMaxWidth(),
            ) {
                ListItem(
                    headlineContent = {
                        Text(
                            stringResource(R.string.settings_delete_account),
                            color = MaterialTheme.colorScheme.error,
                        )
                    },
                    leadingContent = {
                        Icon(
                            imageVector = Icons.Default.Delete,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.error,
                        )
                    },
                    colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .clickable { showDelete = true },
                )
            }

            if (deleteError) {
                Spacer(Modifier.height(8.dp))
                Text(
                    text = stringResource(R.string.settings_delete_error),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.padding(start = 8.dp),
                )
            }

            Spacer(Modifier.height(16.dp))

            // Cerrar sesión: la última fila, en voz baja (S19)
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow),
                modifier = Modifier.fillMaxWidth(),
            ) {
                ListItem(
                    headlineContent = { Text(stringResource(R.string.settings_sign_out)) },
                    leadingContent = {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    },
                    colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .clickable {
                            CoroutineScope(Dispatchers.Main).launch { session.clear() }
                        },
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

@Composable
private fun SectionLabel(
    text: String,
    color: androidx.compose.ui.graphics.Color = MaterialTheme.colorScheme.primary,
) {
    Text(
        text = text,
        style = MaterialTheme.typography.labelLarge,
        color = color,
        modifier = Modifier.padding(start = 8.dp, top = 8.dp, bottom = 8.dp),
    )
}
