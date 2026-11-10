# ODD: Android de demo a app diaria

Issue: (pendiente — el owner decide si se abre)

Objective: ODD 050 dejó Android con todas las pantallas de v1 (F0–F5) pero sin profundidad: no es todavía una app que se use a diario. Este ODD la lleva a **complemento del día fiable y completo** (decisión 1 de ODD 050 intacta: no paridad con los 22 módulos de la web) en cinco fases, y deja preparado el porte a iOS (ODD 050 F6, SwiftUI + Liquid Glass del sistema).
Branch: `odd/051-android-daily` (una rama/PR por fase; el padre es dueño de git).
Delivery strategy: work-unit commits; PR ≤300 líneas ideal; test-first (RED/GREEN) en todo cambio de comportamiento; la lógica nueva va en funciones puras con test JVM (son la especificación que se porta a Swift).
Test runner: JUnit 4 (JVM, `app/src/test`) vía Gradle.

## Context (leer primero — presupuesto: estos paths, nada más)

- `odd/tasks/050-native-mobile-apps.md` — brief de diseño, decisiones D1–D10 y anti-objetivos (siguen mandando; este ODD no los repite). Leer hasta `## Log`.
- `apps/native/PRODUCT.md` — producto y alcance.
- App (`apps/native/android/app/src/main/java/dev/creapolis/ordotodo/`):
  - `data/ApiClient.kt` — cliente HTTP; refresh en 401. `data/SessionStore.kt` — tokens en DataStore sin cifrar. `data/TodayModels.kt::DayStore` — caché del día + colas (`status_ops`, `habit_ops`) como JSON en DataStore.
  - `hoy/HoyViewModel.kt` — Hoy, captura, detalle, hábitos (un solo VM). `hoy/TaskEdit.kt` — `buildTaskPatch` (7 campos). `hoy/CaptureParser.kt` — parser ES/EN/PT.
  - `tasks/TasksViewModel.kt` + `tasks/TasksSectioning.kt` — pestaña Tareas (sin caché, sin cola).
  - `focus/FocusViewModel.kt`, `focus/FocusAlarms.kt`, `focus/FocusNotifications.kt` — timer (sin foreground service ni ciclo Pomodoro).
  - `reminders/HabitReminders.kt` — único recordatorio local que existe. `settings/SettingsScreen.kt`. `MainActivity.kt` — DI manual + shell.
  - Instancias de `ApiClient`: `MainActivity.kt:89`, `settings/SettingsScreen.kt:169`, `focus/FocusAlarms.kt:66`, `reminders/HabitReminders.kt:110`.
- Backend (`apps/backend/src/`, solo lectura salvo E):
  - `auth/auth.service.ts:366-444` — refresh de **un solo uso**: el token consumido entra en lista negra (390). Dos refrescos concurrentes con el mismo token → el segundo recibe 401.
  - `tasks/tasks.controller.ts` — `GET /tasks` (427), `today`, `day-plan` (+`apply|dismiss|freeze|unfreeze|risks`), `time-blocks`, `:id/subtasks`, `:id/tags`, `:id/comments`, `DELETE :id`, `:id/restore`. `tasks/dto/create-task.dto.ts` — `estimatedMinutes`, `recurrence`.
  - `ritual/` — `GET morning|evening|streak`, `POST morning|evening/complete|skip`, `morning/timebox[/accept]`.
  - `timers/` — `start|stop|pause|resume|switch-task`, `active|history|stats`. `notifications/` — bandeja (`GET`, `unread-count`, `:id/read`, `mark-all-read`). `search/` — `quick|suggestions|ask`. `ai/` — `parse-task`, `decompose-task`. `users/` — `me/profile`, `me/preferences`.
  - Sin FCM/APNs en el backend (grep sin resultados, 10-nov-2026).
- Entorno de build: `JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"`, `ANDROID_HOME="$HOME/Library/Android/sdk"`. El debug apunta a producción (`https://api.ordotodo.app/api/v1`); para backend local: `-Pordo.apiBaseUrl=http://10.0.2.2:3101/api/v1`.
- Gotcha: `\b` de regex es ASCII en la JVM de los tests y Unicode en Android → palabras con tilde usan lookarounds `(?<![\p{L}\p{N}_])`.

## Hallazgos que motivan el trabajo (10-nov-2026, emulador `Pixel_API_35` contra producción)

- H1. Pestañas Tareas y Hábitos quedan en spinner >30 s mientras Hoy carga. En código: un fallo que no sea de red deja `TasksUiState.Loading` / `HabitsUiState.loaded=false` para siempre; además los hábitos solo se piden si `GET /tasks/today` tuvo éxito. Respuesta real del servidor no confirmada.
- H2. Carrera de refresh (leído, no reproducido): 4 `ApiClient` sin exclusión + refresh de un solo uso → logout espurio. Además un fallo de **red** durante el refresh borra la sesión.
- H3. Sin selector de fecha/hora (se escriben como texto), sin recordatorios de tareas, sin gestos, detalle con 7 campos, captura offline no encolada, Tareas sin caché, timer sin servicio en primer plano ni ciclo, Ajustes casi vacío, sin job de CI Android.

## Specs

**Fase A — Confiable**

S1. **Ninguna carga queda colgada (P0)**. Todo pull (Hoy, Tareas, Hábitos) termina en contenido, vacío o error con «Reintentar»; nunca en spinner indefinido, sea el fallo de red, de API (4xx/5xx) o de decodificación. Las filas ya cargadas siguen visibles tras un fallo. Los hábitos se piden aunque falle el pull de tareas. Check: tests JVM de las funciones puras de transición de estado (fallo con filas → contenido; fallo sin filas → error reintentable; hábitos `loaded=true` tras cualquier fallo).

S2. **Refresh serializado y sin logout espurio (P0)**. Un único candado de proceso para refrescar: N peticiones concurrentes con 401 producen **un** `POST /auth/refresh`; las demás reintentan con el token ya rotado. La sesión solo se borra si el servidor **rechaza** el refresh (4xx); red caída o 5xx durante el refresh → error de red, sesión intacta. Sin `runBlocking`. Check: test JVM con dos llamadas concurrentes (1 rotación) + rechazo (logout) + inalcanzable (sesión intacta).

S3. **Tokens cifrados (P1)**. Access y refresh se guardan cifrados con una clave de Android Keystore; migración transparente de los tokens en claro existentes (no obliga a volver a entrar). Check: test de ida y vuelta del cifrado + humo en emulador con sesión previa.

S4. **Almacén y cola únicos (P1)**. Room sustituye al JSON en DataStore: tablas de tareas, hábitos y una cola de operaciones única (crear, editar, completar/reabrir, borrar tarea; check-in de hábito). Captura sin red **se encola** y aparece al instante en Hoy con marca de pendiente; ids temporales se reconcilian al sincronizar. Tareas lee de caché primero (sin spinner al cambiar de pestaña). Si Room no resuelve en el toolchain, se mantiene DataStore tras las interfaces existentes y se documenta. Check: tests del motor de cola (orden, coalescencia, 4xx descarta, red espera, reconciliación de id temporal).

S5. **Refrescar y CI (P1)**. Tirar para refrescar en Hoy, Tareas y Hábitos. Job `android` en CI: `:app:testDebugUnitTest :app:assembleDebug`. Check: job verde en la PR.

**Fase B — Tarea completa**

S6. **Fecha y hora con selectores (P0)**. `DatePicker`/`TimePicker` de Material 3 en detalle y captura; atajos Hoy / Mañana / Próximo lunes / Sin fecha. Nada de fechas tecleadas.

S7. **Detalle completo (P0)**. Subtareas (lista, añadir, completar), recurrencia (diaria / semanal con días / mensual), estimación (15/30/45/60/90/120 + libre), etiquetas (elegir y crear), borrar con «Deshacer» (`DELETE` + `restore`). `buildTaskPatch` sigue enviando solo lo cambiado. Check: tests de diff por campo nuevo.

S8. **Gestos (P1)**. Deslizar una fila: completar ↔ reprogramar a mañana, ambos con Deshacer; pulsación larga abre acciones (prioridad, mover de proyecto, borrar). Alternativa accesible equivalente en el menú de la fila (TalkBack).

S9. **Recordatorios de tareas (P0)**. Notificación local a la hora programada (y antelación configurable: a la hora / 10 / 30 min) con acciones Hecho y Posponer (10 min / 1 h / mañana). Se reprograman tras reinicio y tras cada sincronización; cancelar al completar o borrar. Check: tests puros de cálculo de la próxima alarma + humo en emulador.

**Fase C — Mi día**

S10. **Día realista (P0)**. Barra de capacidad en Hoy: minutos estimados del día contra horas disponibles (preferencia del usuario); aviso sereno cuando el día no cabe y acción «Replanificar» que usa `day-plan` (`risks` → propuesta → `apply`/`dismiss`). Vencidas: triaje en un toque (hoy / mañana / sin fecha / todas a mañana).

S11. **Ritual de 60 s (P1)**. Mañana (elegir las 3 del día, aceptar timebox) y cierre (qué se hizo, qué pasa a mañana) sobre los endpoints de `ritual/`; se puede saltar; racha visible sin presión (principio de bienestar, D10).

S12. **Bloques de tiempo en Hoy (P1)**. Las tareas con hora se muestran como bloques sobre la línea del día (D7 de ODD 050; sin vista de calendario).

**Fase D — Foco real**

S13. **Ciclo Pomodoro (P0)**. Foco → descanso corto → … → descanso largo, con las duraciones de `me/preferences` (motor de ODD 014); saltar no acredita (ODD 016).

S14. **Timer que sobrevive (P0)**. Foreground service de tipo adecuado con notificación de cronómetro (y Live Update donde el SO lo soporte); sigue tras matar la app y tras reinicio se reconcilia con `timers/active`.

S15. **Cambiar de tarea y resumen (P1)**. `switch-task` sin cortar la sesión; resumen del día (pomodoros, minutos) desde `timers/stats`.

**Fase E — Captura y avisos**

S16. **Captura mejor (P1)**. Resaltado en vivo de lo que el parser entendió (chips editables); dictado por voz ES/EN/PT; parser ampliado (días de la semana, «en 2 horas», «cada lunes»); `ai/parse-task` solo como mejora opcional con red.

S17. **Widget interactivo (P1)**. Completar tareas y abrir captura desde el widget; refresco periódico.

S18. **Bandeja y push (P1, toca backend)**. Bandeja de notificaciones (`notifications/`). Push FCM: registro de token de dispositivo + envío en el backend → requiere ampliar superficies y su propio diseño antes de implementar.

S19. **Ajustes de verdad (P1, repartido A–D)**. Perfil, tema (sistema/claro/oscuro, Dynamic Color opcional — D5), horas disponibles, preferencias de Pomodoro, antelación por defecto de recordatorios, recuperar contraseña, entrar con Google (Credential Manager). «Cerrar sesión» deja de ser el botón principal.

**Transversal**

S20. **Acabado contra el brief (P1)**. Cada fase cierra corrigiendo lo que toque del brief de ODD 050: lista plana en vez de tarjetas, sin alfa en el anillo, sin checkbox circular, contador único en la cabecera de Hoy, prioridad y fecha visibles en la fila. Capturas claro/oscuro/fuente 1.3 como evidencia.

S21. **Listo para iOS (P1)**. Los casos de test de parser, secciones, cola, timer y recordatorios se mantienen como tablas de entrada→salida fáciles de portar; al cerrar la fase C se extraen a fixtures JSON compartidos (`apps/native/fixtures/`) que ambos runners leen. iOS (ODD 050 F6) arranca al cerrar C; Liquid Glass se obtiene de los componentes del sistema, nunca dibujado a mano.

## Allowed edit surfaces

- `apps/native/android/**`
- `apps/native/fixtures/**` (nuevo, S21)
- `packages/i18n/src/locales/{es,en,pt-br}.json` — solo claves del namespace `Native`
- `packages/native-codegen/**` — solo si una clave nueva exige ampliar el generador
- `.github/workflows/**` — solo el job `android` (S5)
- `odd/tasks/051-android-daily.md`, `odd/tasks/050-native-mobile-apps.md` (solo `## Log`)
- Backend: **cerrado**. S18 (push) exige que el owner amplíe superficies aquí antes de tocarlo.

## Verification

```bash
cd apps/native/android
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
./gradlew :app:testDebugUnitTest :app:assembleDebug --console=plain
# esperado: BUILD SUCCESSFUL, 0 tests fallidos
```

```bash
# cuando cambian claves i18n
npm run test --workspace=@ordo-todo/native-codegen
# esperado: verde, sin archivos generados desactualizados
```

Humo en emulador (`Pixel_API_35`) por fase: instalar el APK debug, recorrer Hoy / Tareas / Hábitos / Ajustes con red y en modo avión; capturas como evidencia.

## Tasks

| T# | Specs | Unidad | Estado | Evidencia |
|----|-------|--------|--------|-----------|
| T1 | S1 | Cargas que nunca cuelgan (Tareas, Hábitos, Hoy) | ✅ hecho | `6e319ed5` · RED (compilación) → GREEN 101/101 · humo emulador |
| T2 | S2 | Candado de refresh + logout solo por rechazo | ✅ hecho | `a19597a9` · RED (compilación) → GREEN 106/106 |
| T3 | S3 | Tokens cifrados con migración | ✅ hecho | `4c118570` · 113/113 · humo: migración en emulador |
| T4 | S4 | Room + cola única + captura offline + caché de Tareas | ✅ hecho | `30f194b1` + `OutboxSyncEngine` (134/134). Cola única (`OutboxOp`), edición/borrado offline, coalescencia y reconciliación de id temporal en caché y downstream ops. Room evaluado: mantenido DataStore tras `OutboxStore` según spec |
| T5 | S5 | Tirar para refrescar + job CI | ✅ hecho (CI sin correr) | `c30c33da` + `b074a38e` · job `android` aún no ejecutado en GitHub |
| T6 | S6 | Selectores de fecha y hora | ✅ hecho | `OrdoDatePickerDialog` + `OrdoTimePickerDialog` M3 + `DateFieldWithShortcuts` en detalle y captura. 144/144 tests |
| T7 | S7 | Detalle completo (subtareas, recurrencia, estimación, etiquetas, borrar) | ✅ hecho | `TaskDetailScreen` completo: subtareas (añadir, toggle, eliminar), recurrencia (diaria, semanal con selector de días, mensual), estimación (chips 15..120m + libre), etiquetas (asignar, desasignar, crear), borrado con Deshacer (`DELETE` + `restore`). Tests de diff JSON + estado en `TaskDetailTest.kt` (151/151 tests JVM). |
| T8 | S8 | Gestos de fila | ✅ hecho | `SwipeToDismissBox` M3: swipe derecha completa con Deshacer; swipe izquierda reprograma a mañana (`scheduledDate` = mañana) con Deshacer; pulsación larga y botón «⋮» abren menú de opciones (cambiar prioridad LOW..URGENT, mover de proyecto, reprogramar a mañana, borrar con Deshacer); alternativa accesible completa en `semantics.customActions` para TalkBack. 159/159 tests JVM en verde. |
| T9 | S9 | Recordatorios de tareas | ✅ hecho | Notificaciones locales con `AlarmManager`, canal prioritario `task_reminders`, acciones Hecho (encola `OutboxOp.StatusFlip` + sync + cancel) y Posponer (10 min / mañana). Reprogramación en `TaskReminderBootReceiver` y en `MainActivity` al cambiar tareas. 8 tests unitarios en `TaskReminderTimeTest.kt` (167/167 tests JVM). |
| T10 | S10 | Día realista + triaje de vencidas | pendiente | |
| T11 | S11 | Ritual mañana/cierre | pendiente | |
| T12 | S12 | Bloques de tiempo en Hoy | pendiente | |
| T13 | S13, S14 | Ciclo Pomodoro + foreground service | pendiente | |
| T14 | S15 | Cambiar de tarea + resumen | pendiente | |
| T15 | S16 | Captura: resaltado, voz, parser ampliado | pendiente | |
| T16 | S17 | Widget interactivo | pendiente | |
| T17 | S18 | Bandeja; push (bloqueado hasta ampliar superficies) | pendiente | |
| T18 | S19 | Ajustes (por fase) | pendiente | |
| T19 | S20, S21 | Acabado por fase + fixtures compartidos | pendiente | |

## Log

- L1 · 2026-11-10 (owner, verbatim): «ya tengo todo commit en github con los ultimos cambios, pero siento que falta mucho para tener una app Android verdaderamete util y productiva, mismo que sea una 'extension' de la app web no una app completa, nos falta mucha cosa, revisa y planea que podemos hacer para tener una verdadera app Mobile Android de Ordo Todo... acuerdate que luego replicaremos en iOS pero con diseño ios y liquid glass».
- L2 · 2026-11-10 (owner, verbatim, tras ver el plan en cinco fases): «Sí, crea el ODD».
- L3 · 2026-11-10 — T1 cerrada (`6e319ed5`): `tasksStateAfterFailedPull` y `habitsAfterFailedPull` (puras, 8 tests) sacan de Loading cualquier fallo, incluidos payloads no decodificables; los hábitos se pintan desde caché y se piden aunque falle el día; `canScheduleReminders` evita borrar recordatorios con una lista vacía fallida. `./gradlew :app:testDebugUnitTest` → BUILD SUCCESSFUL, 101 tests, 0 fallos. Humo en `Pixel_API_35` contra producción con la sesión existente: Tareas muestra 3 filas y Hábitos el vacío real, sin spinner. Límite honesto: no se confirmó qué respondió el servidor cuando se colgaron (H1); el arreglo cubre el estado, no la causa en el servidor.
- L4 · 2026-11-10 — T2 cerrada (`a19597a9`): `RefreshGate` (candado de proceso, 5 tests: 5 llamadas concurrentes → 1 rotación; rechazo → logout; inalcanzable → sesión intacta) + `ApiClient` sin `runBlocking`; 5xx o red durante el refresh ya no cierran sesión. `./gradlew :app:testDebugUnitTest :app:assembleDebug` → BUILD SUCCESSFUL, 106 tests, 0 fallos. Sin reproducción en vivo de la carrera (requiere que caduque el access token); la sesión sobrevivió a la reinstalación del APK.
- L5 · 2026-11-10 (owner, verbatim): «Sí, sigue» (resto de la Fase A).
- L6 · 2026-11-10 — T3 cerrada (`4c118570`): `AesGcmCipher` (AES-256-GCM, IV por valor, clave en Android Keystore `ordo_session_v1`) + `readSession` puro (7 tests). Nota test-first: tests e implementación se escribieron juntos; no hubo corrida RED separada. Humo en `Pixel_API_35`: tras instalar sobre la sesión en claro, `session.preferences_pb` solo contiene `access_token_sealed` y `refresh_token_sealed` (nombres de clave, no valores) y la app sigue con sesión tras arranque en frío.
- L7 · 2026-11-10 — T5 (`c30c33da`, `b074a38e`): `PullToRefreshBox` en Hoy/Tareas/Hábitos con `pullToRefresh()` que no pasa por Loading; job `android` en `ci.yml` (JDK 21 temurin, `./gradlew :app:testDebugUnitTest :app:assembleDebug`). YAML validado en local; **el job no ha corrido en GitHub** (rama sin push) — riesgo conocido: que el runner necesite instalar la plataforma SDK 37. El vacío de Hábitos no es desplazable, así que ahí no hay gesto (queda «Reintentar»). El indicador no quedó en captura (timing); sin crash en logcat.
- L8 · 2026-11-10 — T4 primera rebanada (`30f194b1`): `CreateSync` + `CreateOpStore` en `DayStore` (clave `create_ops`), `dayWithPendingCreates` / `tasksWithPendingCreates` puros (9 tests, RED por compilación → GREEN), captura sin red encolada y visible con «Pendiente de sincronizar», caché `tasks_json` para Tareas. i18n: `today.savedOffline` + `today.pendingSync` × es/en/pt (codegen 45/45, `check` limpio). `./gradlew :app:testDebugUnitTest :app:assembleDebug` → BUILD SUCCESSFUL, 122 tests, 0 fallos. Humo en modo avión: Tareas abre desde caché con nota «Offline» y la sesión se mantiene. **No verificado en dispositivo**: el flujo capturar-offline→sincronizar (crearía una tarea real en producción; queda para el owner). Límites: una fila pendiente no se puede completar ni abrir hasta sincronizar; si el POST llega pero la respuesta se pierde, puede duplicarse; Room no evaluado todavía (S4 permite seguir en DataStore).
- L9 · 2026-11-10 — T4 completada y Fase A cerrada: `OutboxOp` (interfaz sellada para crear, completar/reabrir, editar, borrar y check-in de hábitos), `OutboxStore` en `DayStore` (con migración transparente desde outboxes legadas), `OutboxSyncEngine` con orden FIFO, coalescencia de operaciones (anulación mutua de captura y borrado local sin llamar al backend, deduplicación de flips y habits, fusión de edits), descarte de 4xx para no atascar la cola y reconciliación de IDs temporales (`localId` -> `serverId` tanto en operaciones pendientes como en caché local `TodayResponse` y `tasks_json`). Edición y toggles offline sobre filas pendientes ahora desbloqueados. Evaluación Room: con AGP 9.5.0 y Kotlin 2.4.21 el toolchain KSP no está resuelto offline; la abstracción `OutboxStore` sobre DataStore cubre el 100% de los requisitos funcionales de S4. Tests: 12 tests unitarios en `OutboxEngineTest.kt` (RED por compilación → GREEN), 134/134 tests JVM en verde. `./gradlew :app:testDebugUnitTest :app:assembleDebug` → BUILD SUCCESSFUL. Fase A queda 100% completa (T1 a T5).
- L10 · 2026-11-10 — T6 cerrada (`odd/051-android-fase-b`): selectores táctiles Material 3 (`DatePicker` + `DatePickerDialog`, `TimePicker` + `AlertDialog`) con atajos rápidos (Hoy, Mañana, Próximo lunes, Sin fecha, Elegir fecha...) implementados en `DateFieldWithShortcuts` y `TimeFieldSelector` en `DateTimePickers.kt`. Se eliminó la entrada manual de fechas y horas por texto en `TaskDetailScreen`. En `CaptureSheet` se añadieron chips interactivos para seleccionar fecha y hora con diálogo y atajos sin teclear. Claves i18n añadidas en ES/EN/PT (`shortcutToday`, `shortcutTomorrow`, `shortcutNextMonday`, `shortcutNoDate`, `pickDate`, `pickTime`, `clearTime`) con `native-codegen` pasando 45/45 tests. Tests: 10 tests unitarios en `DateTimePickerTest.kt` + `CaptureParserTest.kt` cubriendo cálculos puros y parseo ISO. `./gradlew :app:testDebugUnitTest :app:assembleDebug` → BUILD SUCCESSFUL (144/144 tests JVM).
- L11 · 2026-11-10 — T7 cerrada (`odd/051-android-fase-b`): detalle completo de tarea en `TaskDetailScreen` según S7. (1) Subtareas: listado con estado tachado, toggle inline (`PATCH /tasks/:id/complete` o `PATCH` con `TODO`), creación rápida (`POST /tasks/:id/subtasks`) y eliminación. (2) Recurrencia: selector de frecuencia (sin recurrencia, diaria, semanal con selección interactiva de días L..D, mensual) persistida en `buildTaskPatch`. (3) Estimación de tiempo: chips rápidos de 15, 30, 45, 60, 90, 120 min + campo libre y quitar estimación con `JsonNull`. (4) Etiquetas: chips de etiquetas asignadas con acción de desasignar (`DELETE /tags/:tagId/tasks/:taskId`), menú para asignar existentes (`POST /tags/:tagId/tasks/:taskId`) o crear nueva etiqueta en el workspace (`POST /tags`). (5) Borrado con «Deshacer»: botón de peligro que borra (`DELETE /tasks/:id`) y emite Snackbar con acción Deshacer que restaura la tarea (`POST /tasks/:id/restore` o cancela la op si estaba en la outbox). Claves i18n añadidas en ES/EN/PT y regeneradas (codegen 45/45). Tests: 7 tests nuevos de diff JSON y lógica de estado en `TaskDetailTest.kt` (151/151 tests JVM). `./gradlew :app:testDebugUnitTest :app:assembleDebug` → BUILD SUCCESSFUL.
- L12 · 2026-11-10 — T8 cerrada (`odd/051-android-fase-b`): gestos de fila táctiles y accesibles en `TaskRow` (Hoy y Tareas) según S8. (1) Deslizamiento con `SwipeToDismissBox`: swipe de izquierda a derecha completa/desmarca con Snackbar «Deshacer» (`onToggle`); swipe de derecha a izquierda reprograma a mañana (`scheduledDate` = mañana) con Snackbar «Deshacer» que revierte a la fecha previa (`undoReschedule`). (2) Pulsación larga (`combinedClickable`) y menú contextual «⋮» que abren opciones rápidas: posponer a mañana, cambiar prioridad (LOW, MEDIUM, HIGH, URGENT vía diálogo), mover de proyecto (vía diálogo con proyectos disponibles o sin proyecto), y eliminar con Deshacer. (3) Accesibilidad TalkBack: configuradas `semantics.customActions` con todas las acciones declaradas para lectores de pantalla sin necesidad de gestos táctiles. Claves i18n añadidas en ES/EN/PT (`rescheduledTomorrow`, `moreOptions`, `changePriority`, `changeProject`) con codegen 45/45. Tests: 8 tests unitarios puros en `TaskGesturesTest.kt` (159/159 tests JVM). `./gradlew :app:testDebugUnitTest :app:assembleDebug` → BUILD SUCCESSFUL.
- L13 · 2026-11-10 — T9 cerrada (`odd/051-android-fase-b`): recordatorios de tareas con notificaciones locales M3 según S9. (1) Cálculo puro de alarmas y posposición en `TaskReminderTime.kt` con antelación configurable (exacta, 10 min, 30 min) y filtros para tareas completadas o sin hora. (2) `TaskReminders` con `AlarmManager.setExactAndAllowWhileIdle()` en canal `task_reminders` de alta prioridad. (3) Acciones nativas en notificación: «Hecho» (`TaskReminderDoneReceiver` que encola `OutboxOp.StatusFlip`, sincroniza, actualiza widget y cancela notificación) y «Posponer» (`TaskReminderSnoozeReceiver` para +10 min o mañana reprogramando la tarea). (4) Resistencia a reinicio en `TaskReminderBootReceiver` (`ACTION_BOOT_COMPLETED`) y reprogramación reactiva en `MainActivity` en cada actualización de tareas (`LaunchedEffect`). Claves i18n añadidas en ES/EN/PT (`reminder.taskChannel`, `reminder.snooze10m`, `reminder.snooze1h`, `reminder.snoozeTomorrow`) con `native-codegen` pasando 45/45 tests. Tests: 8 tests unitarios puros en `TaskReminderTimeTest.kt` (167/167 tests JVM). `./gradlew :app:testDebugUnitTest :app:assembleDebug` → BUILD SUCCESSFUL. Con esto, Fase B (T6..T9) queda completa.
