# ODD 050 — Apps nativas iOS + Android: «la agenda serena»

> **Estado**: 🟢 DECISIONES CERRADAS — brief de diseño (`$impeccable shape`), sin código; D1–D4 respondidas por el owner, D5–D10 por recomendación; listo para ejecutar F0 con su OK
> **Fecha**: 2026-11-06 · **Autor**: sesión de planeación con el owner
> **Registro de producto**: `apps/native/PRODUCT.md` (plataforma `adaptive`) · **Mundo visual heredado**: `apps/web/DESIGN.md` («El cockpit sereno»)

## Header

- **Objective**: sustituir la app móvil Tauri (compila el fuente de desktop y se siente una miniatura) por dos apps nativas de verdad — SwiftUI y Jetpack Compose — diseñadas como el **complemento del día**: capturar, ejecutar Hoy, correr el Pomodoro y marcar hábitos, cada una hablando el idioma de su SO.
- **Branch sugerida**: `odd/050-native-apps` (una rama/PR por fase).
- **Delivery strategy**: F0 (fundaciones compartidas) → F1–F5 por plataforma → F6 publicación; cada fase cierra con revisión de acabado impeccable sobre capturas de Simulator/emulador.
- **Test runner**: XCTest/Swift Testing (iOS), JUnit + Compose UI tests (Android); generadores de F0 con vitest.

## Context (leer primero)

- `apps/native/PRODUCT.md` — producto, alcance v1 y restricciones (este brief no los repite).
- `apps/web/DESIGN.md` — tokens y reglas del cockpit sereno que aquí se traducen a nativo.
- `apps/native/design/lista-del-dia.html` — **boceto elegido** (copia versionada; `.impeccable/` está en `.gitignore`): contrato de composición de la primera pantalla; la revisión final audita contra él.
- `odd/tasks/020-mobile-tauri.md` — la app actual y sus lecciones (alarma Pomodoro en Android, deep links, efectos de `cancel()` en notificaciones).
- Backend: `GET /tasks/today` (`apps/backend/src/tasks/tasks.controller.ts:152`), `GET /habits/today` (`apps/backend/src/habits/habits.controller.ts:148`), Swagger en `apps/backend/src/main.ts`, `deleteAccount` en `apps/backend/src/users/users.service.ts:427`.
- Modelo (`packages/db/prisma/schema.prisma`): `Task.doDate / dueDate / scheduledTime / scheduledEndTime / estimatedMinutes / recurrence`; `Habit.timeOfDay (MORNING|AFTERNOON|EVENING|ANYTIME) / preferredTime / targetCount / targetDaysOfWeek / currentStreak / icon` (el comentario del schema dice «Lucide», pero los diálogos guardan emojis: `FORM_ICONS`, «⭐» por defecto).

## Decisiones del owner (06-nov-2026)

1. Papel: **complemento del día** (no paridad de los 22 módulos).
2. Stack: **SwiftUI + Jetpack Compose**, dos apps nativas puras.
3. Diseño por SO: **adaptativo pleno** — HIG en iOS, Material 3 en Android; la marca vive en color, firmas y contenido.
4. Estructura: **Lista del Día — la agenda serena**, elegida entre las tres estructuras que repartió el roll (seed:06148527225a7423).
5. Orden: **Android primero**; iOS como segunda plataforma (D1).
6. Tipografía: **fuentes del sistema + Inter solo en numerales de display** (D2).
7. Sin conexión: **copia local + cola de cambios** desde v1 (D3).
8. La app Tauri (`apps/mobile`) **se mantiene hasta que la nativa Android llegue a v1** y después se retira (D4).

## Brief de diseño

### 1. Trabajo y audiencia

Profesionales en movimiento, con una mano, en sesiones de 10–60 s (ver PRODUCT.md). Modo **Operate**: el éxito es completar la tarea, no admirar la pantalla. Llegan con una de cuatro preguntas: *¿qué tengo hoy?*, *apúntame esto*, *empieza el foco*, *¿ya hice mis hábitos?*

### 2. Resultado y prueba

- Abrir la app = ver el día completo en una lista ordenada por momento, sin navegar.
- Capturar desde la intención en <10 s, desde cualquier punto del SO.
- El Pomodoro sigue vivo y avisa con la app cerrada.
- Verdad propia del producto: los hábitos **entretejidos** en el día, con su racha visible; ejecución y persona completa en una sola lista, cosa que ni Todoist ni Things muestran juntas.

### 3. Dirección elegida

- **Autoridad visual**: el cockpit sereno, heredado — violeta semántico como tint/primary, firmas de sección (tareas violeta, hábitos esmeralda, calendario azul, proyectos con su color), plano por defecto, el color ordena y nunca decora.
- **Tesis**: el día entero en una lista serena, con los hábitos entretejidos y el timer siempre a un toque. Rechaza el dashboard de tarjetas y la «desktop en 390 px».
- **Secuencia**: resumen del día → secciones **Mañana / Tarde / Noche / Cuando sea** (calcadas del enum `TimeOfDay`; las tareas se ubican por `scheduledTime`) → el timer como mini-reproductor persistente → la captura a un toque.
- **Movimiento firma — la racha como línea de estaciones**: cada hábito dibuja sus últimos días objetivo como estaciones de una línea en su color; llena = cumplido, hueca = fallado, el tramo se apaga cuando la racha se rompe. La estación de hoy ES el control de check-in: tocarla cumple el hábito y la línea crece. Con `targetCount > 1` la estación es un anillo que se llena por fracciones (Agua 6/8).
- **Consecuencia de implementación**: el boceto elegido fija disposición, densidad y paleta de la primera pantalla; cada SO lo traduce con sus componentes (tabla abajo). La sesión de construcción registra el contrato de dirección en el surface brief de `apps/native` antes de escribir código; el `DESIGN.md` nativo se escribe al final, desde lo construido.

#### Traducción del boceto por SO

| Boceto | iOS (HIG) | Android (Material 3) |
|---|---|---|
| Título «Hoy» + fecha | Large title que colapsa a inline con el scroll; fecha en la cabecera del resumen | `LargeTopAppBar` con colapso; fecha en la cabecera del resumen |
| Anillo 4/9 | Cabecera de lista: anillo + «4 de 9 · 1 h 15 min de foco» | Igual, en contenedor tonal |
| Botón «+» | Botón trailing de la toolbar → sheet | FAB extendido «Tarea» que encoge con el scroll → bottom sheet |
| Secciones | `List` inset-grouped con encabezados de sección | `LazyColumn` con encabezados fijos e ítems agrupados en contenedores tonales |
| Checkbox de tarea | Círculo (convención de Recordatorios) | `Checkbox` M3 (cuadrado redondeado) |
| Hábito | Estación/anillo esmeralda + línea de racha | Igual: la firma es compartida, dibujada con Canvas |
| Bloque de foco | Fila con barra azul a la izquierda (firma de calendario) | Igual, en contenedor tonal azul |
| Mini-reproductor | `tabViewBottomAccessory` con el material del sistema y progreso violeta | Barra acoplada sobre la `NavigationBar` en rol `inverseSurface` (el negro del boceto es exactamente ese rol) |
| Pestañas | `TabView`: Hoy · Tareas · Hábitos · Ajustes (SF Symbols) | `NavigationBar` (rail en pantallas expandidas): Hoy · Tareas · Hábitos · Ajustes (Material Symbols) |

Traducciones nombradas (reglas de DESIGN.md que cambian de material, no de intención):

- **Una sola familia** → la del sistema por SO (SF Pro / Roboto) en todo texto; Inter solo en numerales de display (timer, progreso, rachas) con sus cifras abiertas cv02/03/04/11 — *ver D2*.
- **Modo oscuro frío** → en Android lo dan gratis las superficies tonales sembradas en violeta; en iOS mandan los fondos del sistema (HIG) y el frío vive solo en el tint.
- **Vidrio solo en el dashboard** → en iOS el único vidrio es el material del sistema en barras, sheets y el accesorio; nunca vidrio a mano.
- **Iconos** → SF Symbols / Material Symbols; nunca Lucide en nativo (el backend guarda nombres Lucide en `Habit.icon` → tabla de mapeo compartida).

### 4. Alcance y límites

- **Fidelidad**: dirección de diseño lista para producción de la v1; cada fase la construye y la revisa.
- **Pantallas v1**: Hoy · Captura · Detalle de tarea · Foco (timer) · Tareas (Próximos / Sin fecha / Proyectos / búsqueda) · Hábitos (lista, detalle con historial, crear/editar) · Ajustes · Auth · fuera de la app (widgets, Live Activity / notificación en curso, accesos de captura).
- **Intacto**: web, desktop, el backend salvo los prerrequisitos de F0, y `apps/mobile` (Tauri) funcionando hasta que una nativa la reemplace.
- **Anti-objetivos**: Kanban, OKRs, reports, reuniones, notas, coach IA y XP en móvil v1; piel única multiplataforma; FAB en iOS; checkbox circular de iOS en Android; barra inferior intacta en tablets Android; iconos web; vidrio a mano; push inventada; botones de compra hacia la web; enlaces «próximamente» muertos; reutilizar el fuente de desktop.

### 5. Estados y rangos

- **Hoy**: típico 3–12 tareas + 2–6 hábitos + 0–3 bloques. Mínimo 0 → vacío sereno («Día despejado» + Añadir tarea + Ver próximos). Máximo 40+ por vencidas → sección «Vencidas» arriba, plegada si pasan de 5, con acción en lote «Pasar a hoy».
- **Filas**: títulos de 1–200 caracteres, máximo 2 líneas en la lista y completo en el detalle; hasta 2 chips de etiqueta + «+N»; proyecto con punto de su color (paleta cerrada).
- **Hechas**: se quedan tachadas en su sitio durante la sesión, para ver el avance; al reabrir se pliegan en «Hechas (n)» al final de su sección.
- **Hábitos**: binarios o cuantitativos (`targetCount`); los pausados no aparecen en Hoy; racha 0–365+; solo cuentan los días objetivo (`targetDaysOfWeek`), así un día libre no rompe la línea.
- **Timer**: inactivo · foco en curso · pausado · descanso corto/largo · terminado (aviso) · interrumpido (app cerrada → se recupera de la sesión del backend) · sin conexión (manda el reloj local y sincroniza después).
- **Sincronización**: en línea · sin conexión (aviso discreto + cambios en cola) · sincronizando · conflicto (aviso, sin perder datos) — *ver D3*.
- **Permisos**: notificaciones denegadas → aviso en contexto en Foco y Ajustes; alarmas exactas denegadas (Android) → explicación + enlace al ajuste; Live Activities desactivadas → la app sigue funcionando igual.
- **Sesión**: sin sesión · OAuth en curso · token caducado (refresco silencioso; si falla, login sin perder la cola).
- **Idioma y tamaño**: ES/EN/PT-BR (ES y PT ~30 % más largos que EN). Dynamic Type hasta AX5 / escala de fuente 200 %: la hora baja bajo el título, el mini-reproductor trunca a 1 línea, los numerales del timer escalan con tope.
- **Apariencia**: claro y oscuro de primera clase; contraste aumentado (iOS) / texto de alto contraste (Android).

### 6. Interacción y layout

- **Jerarquía**: 1) la lista del día, 2) el timer en curso, 3) la captura, 4) el resumen, en voz baja.
- **Topología**: 4 pestañas, cada una con su pila; Captura = sheet / bottom sheet; Foco = pantalla completa modal; Detalle = push. iOS conserva el swipe desde el borde para volver; Android respeta el back predictivo.
- **Gestos en filas**: iOS — swipe desde el inicio = completar, swipe desde el final = «Mañana» / eliminar (a la papelera); pulsación larga = menú contextual con vista previa. Android — `SwipeToDismissBox` (inicio→fin completar, fin→inicio posponer); pulsación larga = modo selección con barra contextual para acciones en lote. Toda acción de swipe existe también como acción de accesibilidad.
- **Feedback**: completar = háptica de éxito + relleno + tachado. Deshacer, adaptado por SO: en iOS la fila tachada se queda y tocarla otra vez deshace; en Android, Snackbar «Completada · Deshacer». Errores no bloqueantes en línea (iOS) / Snackbar con reintentar (Android).
- **Captura (el camino de <10 s)**: un solo campo, con foco y teclado al abrir. Un **parser local** (fechas y horas relativas en ES/EN/PT, `#etiqueta`, `@proyecto`, `!prioridad`) subraya en vivo lo que entendió: instantáneo y sin red. La IA del backend puede enriquecer al guardar, nunca bloquea. Chips editables con pickers nativos. Intro = guardar y seguir (el campo se limpia, «3 añadidas»). Sin fecha y abierta desde Hoy → planificada para hoy.
- **Entradas a la captura**: «+» / FAB; acción rápida del icono (iOS) / app shortcut (Android); control del Centro de Control y la pantalla bloqueada (iOS) / tile de Ajustes rápidos (Android); widget; App Intent para Siri y Atajos; extensión de compartir / share target (texto y enlaces).
- **Foco**: numerales grandes, anillo de progreso violeta (el descanso en tono neutro), la tarea con sus subtareas marcables durante el foco, controles pausar/reanudar · terminar · +5 min · saltar descanso, «Pomodoro 2 de 4», pantalla siempre encendida opcional. Se abre desde el mini-reproductor con transición zoom/matched geometry (iOS) / container transform (Android) y se cierra deslizando hacia abajo / con back, de vuelta al mini-reproductor.
- **Fuera de la app**: iOS — Live Activity (pantalla bloqueada + Dynamic Island: compacta con anillo + mm:ss; expandida con pausar/terminar vía App Intents); fin de sesión con notificación time-sensitive o AlarmKit, intensidad elegible en Ajustes (aviso suave / alarma). Android — notificación en curso con la cuenta atrás del sistema y acciones, promovida a Live Update (chip en la barra de estado) donde el SO lo permita; fin con alarma exacta pedida en contexto y fallback honesto si se deniega. *(Las APIs de iOS 26 / Android 16 citadas se verifican en la documentación oficial al construir: el 06-nov la búsqueda web no tenía cuota.)*
- **Widgets**: iOS — pequeño (anillo + siguiente tarea), mediano (siguientes 3 con checkbox interactivo), pantalla bloqueada (anillo). Android (Glance) — lista de Hoy redimensionable con checkboxes + botón de captura. Leen de la caché local.
- **Notificaciones locales**: planning diario (hora elegible), vencimientos, recordatorio de hábito (usa `preferredTime`), fin de Pomodoro. iOS con niveles de interrupción (pasivo para el planning, time-sensitive para vencimientos y timer); Android con un canal por tipo.
- **Tareas**: iOS — large title + búsqueda nativa + control segmentado (Próximos · Sin fecha · Proyectos); Android — top app bar con SearchBar + tabs. Proyecto = lista agrupada por columna del workflow (leer, completar, editar) + «Abrir tablero en la web».
- **Detalle**: formulario agrupado (iOS) / lista M3 (Android): título, notas, **Planificada para** (`doDate`) frente a **Fecha límite** (`dueDate`), bloque horario, recurrencia (preajustes; la avanzada en la web), proyecto, etiquetas, prioridad, subtareas, estimación, y asignados y comentarios en solo lectura; acción primaria «Empezar foco».
- **Ajustes**: lista agrupada / preferencias M3 — cuenta (cerrar sesión, **borrar cuenta**), notificaciones por tipo, Pomodoro (duraciones, aviso/alarma, pantalla encendida), apariencia (en Android, colores del sistema opcionales), idioma con el ajuste por app del propio SO, plan (solo lectura), apps conectadas (lectura + «gestionar en la web»).
- **Tamaños**: teléfonos compactos (375 pt / 360 dp) como base. Android expandido → `NavigationRail` + lista y detalle lado a lado. iPad → `TabView` adaptable a barra lateral + detalle dividido.
- **Movimiento**: transiciones del sistema; check con resorte ≤250 ms; Reduce Motion / quitar animaciones → fundido.

### 7. Restricciones y decisiones

**Obligatorias (tiendas y plataforma)**:

- App Store 4.8: si se ofrece Google/GitHub, hace falta **Iniciar sesión con Apple** → nuevo proveedor OAuth en el backend (hoy no existe).
- App Store 5.1.1(v): borrado de cuenta dentro de la app → `deleteAccount` existe en el servicio; verificar que esté expuesto en la API.
- App Store 3.1.1 / política de pagos de Play: sin botones de compra hacia la web → el plan se muestra en solo lectura en v1.
- Android: `POST_NOTIFICATIONS` en tiempo de ejecución (13+); alarmas exactas con `SCHEDULE_EXACT_ALARM` pedido en contexto (Play reserva `USE_EXACT_ALARM` a apps de alarma o calendario); el target SDK que exija Play al publicar; back predictivo.
- Push remota: el backend no tiene APNs/FCM → v1 solo con notificaciones locales (honesto); la push es una fase de backend aparte.

**Consecuencias técnicas compartidas (F0)**:

- **Tokens**: generados desde `packages/styles` (`tokens.ts` + su test de paridad) → asset catalog con variantes claro/oscuro/alto contraste (iOS) y `ColorScheme` de Compose; cero hex a mano en las apps. Consume la paleta canónica que cierre ODD 025.
- **Textos**: catálogos nativos (`.xcstrings` / `strings.xml`) generados desde una fuente trilingüe compartida, con la paridad ES/EN/PT-BR verificada en CI.
- **API**: clientes Swift y Kotlin generados desde el OpenAPI del backend.
- **Iconos**: tabla versionada Lucide → SF Symbols / Material Symbols, coordinada con el IconPicker de ODD 025.
- **Verificación**: capturas de Simulator/emulador por clase de dispositivo, en claro/oscuro y con texto grande. El detector de impeccable solo lee web → la revisión de acabado juzga con `ios.md` / `android.md`.

**Decisiones** (D1–D4 respondidas por el owner el 06-nov-2026; D5–D10 van por recomendación salvo que el owner diga lo contrario):

- D1 — Orden de construcción: ✅ **Android primero** (owner); iOS después.
- D2 — Tipografía: ✅ **sistema en todo + Inter solo en numerales de display** (owner).
- D3 — Sin conexión en v1: ✅ **caché local (Room / SwiftData) + cola de escrituras** para completar, capturar y check-in (owner); los widgets leen de esa caché.
- D4 — Destino de `apps/mobile` Tauri: ✅ **se mantiene hasta que la nativa Android llegue a v1**, con arreglos críticos; después se retira (owner).
- D5 — Dynamic Color en Android (violeta estático por defecto; colores del sistema como opción).
- D6 — Hoy con varios workspaces (unificado, «mi día»; verificar el alcance real de `GET /tasks/today` en F0).
- D7 — Calendario (bloques de tiempo dentro de Hoy, como en el boceto; la vista de calendario queda fuera de v1).
- D8 — iPad (app universal con TabView adaptable, sin diseño dedicado en v1).
- D9 — Versiones mínimas (iOS 26+ por el accesorio del TabView, Liquid Glass y AlarmKit; Android 10 / API 29+).
- D10 — Gamificación (XP, niveles y logros fuera de v1, por el principio de bienestar).

## Tasks (fases — Android primero, D1)

- [x] F0 — Fundaciones (**07-nov**, rama `odd/050-native-apps`, sin push): ✅ generador de tokens y textos (`packages/native-codegen`, 38 tests: Material 3 con primario fijado a los tokens y AA verificado; strings es/en/pt-rBR desde el namespace `Native` con paridad y subconjunto ICU exigidos; test de archivos desactualizados); ✅ proyecto Android base (Gradle 9.6.1/AGP 9.5/Kotlin built-in, compileSdk 37, minSdk 29, mismo id que la Tauri con sufijo `.dev` en debug; tema Ordo; Inter solo en numerales con cifras abiertas+tnum; icono adaptativo con BrandMark y capa monocroma; localeFilters + idioma por-app). Verificado en emulador Pixel 7 API 35: build sin avisos, claro/oscuro, es default + en/pt-rBR (plurales correctos), fuente 1.3 envuelve sin cortar. PENDIENTE en F0→F1: cliente OpenAPI Kotlin, mapa de iconos, backend (borrado de cuenta ya expuesto en `DELETE /users/me` ✅ verificado; falta OAuth Apple — se moverá a F6; `GET /tasks/today` es por usuario, no por workspace → D6 confirmado unificado). Gotchas: MCU 0.4.0 rompe en Node (imports ESM sin extensión) → pineado a ^0.3.0; Node 26 no soporta parameter properties → `erasableSyntaxOnly`; locale raro del emulador (persist.sys.locale vacío) hace que siga al sistema tras recrear.
- [ ] F1 — Rebanada vertical Android, en slices (rama por slice sobre `odd/050-native-apps`; caché local + cola de escrituras desde el inicio, D3):
  - [x] F1a — Auth + Hoy lectura (rama `odd/050-native-f1`): login/registro email (JSON + Bearer, `POST /auth/*`), sesión en DataStore, `GET /tasks/today`, Hoy por secciones (Vencidas/Mañana/Tarde/Noche/Cuando sea + Hechas), solo lectura, sin tabs muertos. **Verificado**: RED→GREEN (SectioningTest 2/2 + TodayResponseTest 1/1), codegen 45/45, `assembleDebug` + APK 33 MB, instalado en Pixel_API_35: Auth en claro y oscuro + foco de campo (capturas). **Pendiente**: login real + Hoy con datos (sin backend alcanzable desde aquí: ni local ni prod responden; el debug apunta a `10.0.2.2:3101` para el backend del Mac).
  - [x] F1b — Completar offline (rama `odd/050-native-f1b`): toggle completar/deshacer optimista con Snackbar + Deshacer, copia local + cola de escrituras (DataStore JSON: `TodayModels.kt::DayStore`; Room queda para cuando haya red para resolver `room-runtime` + KSP 2.4 — `StatusStore`/`TaskStatusApi` ya abstraen el almacén) con reintento en cada apertura. **Verificado sin Gradle**: kotlinc 2.4.21 + plugins serialización/Compose 2.4.21 compila el main limpio (EXIT 0) y JUnit corre 10/10 en verde (3 F1a + 7 F1b). **Pendiente**: humo en `Pixel_API_35` + login/Hoy reales contra backend (sin backend alcanzable desde aquí).
  - [x] F1c — Captura (rama `odd/050-native-f1c`, commit `feat(android): F1c express capture…`): sheet con campo único + parser local ES/EN/PT (palabras relativas + `dd/mm[/aaaa]` día-primero + `dd mes` + horas `HH:mm`/`15h[30]`/`3pm` + `p1-p4`/`!`/`!!`) + `POST /tasks` con `scheduledDate`/`scheduledTime`/`priority`. Sin `#proyecto` (llega en F1d) ni cola de creados (solo reintento manual; documentado).
  - [x] F1d — Detalle (rama `odd/050-native-f1d`, commit `feat(android): F1d task detail with PATCH diff…`): pantalla de tarea (formulario agrupado M3) + `PATCH /tasks/:id` con diff (solo campos cambiados; `null` limpia fecha/hora/proyecto) + `#proyecto` en el parser (hint → `GET /projects/all`, slug exacto gana a nombre-contiene, sin coincidencia = express) + selector de proyecto en captura y detalle.
- [x] F2 — Timer Android (rama `odd/050-native-f2`, commit `feat(android): F2 focus timer…`): sesión de foco por tarea (`POST /timers/start|stop|pause|resume`, `GET /timers/active`) + mini-reproductor en Hoy + notificación en curso con acciones (sin foreground service en v1) + alarma exacta (`setExactAndAllowWhileIdle` si hay permiso; si no, inexact + aviso honesto) que cierra la sesión. Duraciones 15/25/50 + abierta; inicio requiere red (la cuenta regresiva es local). Sin Live Update (llega con widgets en F4).
- [ ] F3 — Hábitos (línea de estaciones, check-in, crear/editar) + Tareas (Próximos, Sin fecha, Proyectos, búsqueda).
- [ ] F4 — Fuera de la app (Android): widgets Glance, tile de Ajustes rápidos, app shortcuts, share target, notificaciones locales.
- [ ] F5 — Ajustes, onboarding mínimo con permisos en contexto, endurecimiento (accesibilidad, idiomas, sin conexión, errores) → **Android v1**; retiro de `apps/mobile` Tauri (D4).
- [ ] F6 — iOS: Iniciar sesión con Apple en el backend + F1–F5 en SwiftUI con sus equivalentes (Live Activity, App Intents, WidgetKit, controles del Centro de Control).
- [ ] F7 — Publicación: Play (prueba interna → producción) y TestFlight → App Store; fichas, privacidad y revisión de tiendas.

## Log

- L18 · 2026-11-10 — Login: el título no cambiaba a registro (siempre `auth_title`); añadida clave `auth.titleRegister` (ES/EN/PT) y título por modo. Canario visual para confirmar build nuevo en el emulador.


- L17 · 2026-11-10 — El borrado recurrente resultó estar atado al NOMBRE `data/AuthRepository.kt` (dentry fantasma con el contenido viejo de 94 líneas: `cat` falla pero readdir lo lista y `git status` parpadea `D`). Renombrado a `data/AuthSession.kt` + clase `AuthSession` (usos en MainActivity/AuthViewModel); sombra ERRORS:0, JUnit 53/53, nombre nuevo estable en muestreo. El árbol commiteado siempre estuvo intacto.


- L16 · 2026-11-10 — F2 GREEN (sombra): kotlinc 2.4.21 main 0 errores; JUnit 53/53 OK (12 FocusTimer nuevos, RED honesto por compilación, 0 fallos finales). Codegen 45/45 + `check` limpio (13 `timer_*` × es/en/pt). Nota: `data/AuthRepository.kt` volvió a desaparecer del disco tras `d1303918` (fantasma recurrente); restaurado con `git checkout --` desde el blob. Real `./gradlew` + humo de timer en emulador pendientes (aprobación).


- L15 · 2026-11-10 — Hallazgo grave: `data/AuthRepository.kt` nunca se commiteó en ninguna rama (F1a–F1d); AuthViewModel/MainActivity lo importan, así que ningún checkout limpio compilaba. Los verdes sombra previos pasaron por un `AuthRepository.kt` suelto sin trackear (ya borrado). Reconstruido desde el contrato (`POST /auth/login|register` → `{accessToken, refreshToken}`, sesión en DataStore), compilación sombra real ERRORS:0 + JUnit 41/41. Extra: dentry fantasma del archivo viejo (doble entrada, contenido de 94 líneas) — borrado por inodo tras respaldar; el swap de directorio no bastó.


- L14 · 2026-11-10 — F1d GREEN (sombra): kotlinc 2.4.21 compila main con 0 errores (CaptureParser+`#tag`, TaskEdit, TaskDetails, TasksRepository, HoyViewModel, TaskDetailScreen, HoyScreen, CaptureSheet); JUnit 41/41 OK (18 TaskDetailTest nuevos + 23 previos). Codegen 45/45 + `check` limpio (22 claves `detail_*` × es/en/pt). RED honesto: `TaskDetailTest` falló en compilación antes de existir la implementación; un fallo de aserción (`#casa` colgado en el título) llevó a cortar todos los tags. Real `./gradlew` + emulador siguen pendientes (aprobación).


- L13 · 2026-11-09 — F1c GREEN (sombra): kotlinc 2.4.21 compila main con 0 errores (CaptureParser+CaptureSheet+TasksRepository+HoyViewModel+HoyScreen); JUnit 23/23 OK (13 CaptureParser nuevos + 10 previos). Codegen 45/45 + `check` limpio. Nota honesta test-first: RED no se observó como corrida fallida (tests escritos antes que el parser, primera ejecución ya GREEN tras 3 defectos cazados en auto-revisión: TIME_AMPM, solape `!!`, prioridad de fecha relativa). Real `./gradlew` + emulador siguen pendientes (aprobación).
- L1 (owner, verbatim): "planeamos las apps nativas iOS y Android de Ordo Todo, porque la app que tenemos mobile es literal una miniatura de la app Desktop, usemos a [$impeccable] para planear el diseño".
- L2: entrevista — papel «Complemento del día», stack «SwiftUI + Jetpack Compose», diseño «Adaptativa plena (HIG + Material 3)».
- L3: `apps/native/PRODUCT.md` creado (plataforma `adaptive`).
- L4: el roll de superficie (operate) repartió «Ahora», «Bandeja» y «Lista del Día»; el owner eligió **Lista del Día**. Retadores del catálogo: ninguno puede ganar con el mundo visual ya fijado; la línea de estaciones de la racha viene del retador «diagrama de tránsito» y el vocabulario lleno/hueco del «horario de aerolínea».
- L5: hechos verificados — Xcode 27.2 instalado (iOS ya no está bloqueado); Swagger en el backend; `/tasks/today` y `/habits/today` existen; sin OAuth de Apple; `deleteAccount` en el servicio; `Habit.timeOfDay` incluye EVENING (→ sección Noche).
- L6 (owner, ronda de corrección): «Android primero», «Sistema + Inter en números», «Copia local + cola», «Mantener hasta reemplazo». D5–D10 sin objeción → van por recomendación. Las fases se reordenan: Android completo (F1–F5) y luego iOS (F6).
- L7 (07-nov, F0): owner dijo «empecemos» → ejecución. Commits `948192d1` (docs) + `11118909` (codegen+i18n) + `f9a9d612` (app Android). Ruta de borrado verificada: `DELETE /users/me` (users.controller.ts:384).
- L8 (07-nov): revisión independiente (1.er agente murió por límite de uso de la cuenta; reintento completó) → **NEEDS_FIXES**: 1 P2 + 6 P3. P2 resuelto: la marca vive en el tono HCT ~43 (no el 40 de M3), así que el primary clavado dejaba texto de acción a 4,42:1 — se soltó el pin de `inversePrimary` (tono de paleta, 5,03:1 en Snackbar) y los contenedores claros suben dos tonos (surfaceVariant 92, high 93, highest 92; escalera monótona) → ≥4,64:1, con los pares nuevos exigidos en tests. P3 resueltos: comillas ICU al estilo formatjs (`'<`/`'>` abren cita, `''` dentro de cita), caracteres de control rechazados (incl. \r), args numéricos documentados como Int, y 7 tests nuevos (45 total). P3 aceptados como están: el catálogo abre también en release (F0 es scaffold; F1 lo sustituye) y la dependencia MCU anidada en el lock (cosmético, `npm ci` bien). Verificado: 45/45 tests, tsc limpio, build 7 s sin avisos, reinstalado y capturado en emulador (claro/es sin defectos).
- L9 (09-nov, owner: «sigamos con la app android nativa»): F1 se slicea en F1a–d (rama por slice); F1a arranca en `odd/050-native-f1` (base `origin/odd/050-native-apps` @1e619995; el worktree `ordo-todo-050` queda intacto en F0). Auth email JSON+Bearer, Hoy solo lectura, sin tabs muertos (Tareas/Hábitos/Ajustes llegan en F3/F5).
- L10 (09-nov, F1a cerrada): RED (test compila en rojo: faltan `sectionToday`/`TodayResponse`) → GREEN (3/3 JVM). Capas: `SessionStore` (DataStore), `ApiClient` (Bearer + refresh 1 intento), `AuthRepository`, `TasksRepository`, `AuthScreen` + `HoyScreen` (secciones, anillo, numerales Inter), `MainActivity` con `Surface` (el color de contenido no venía del tema sin ella — título invisible en oscuro). i18n: `auth.*` + `today.empty.retry` en es/en/pt vía codegen. Gotchas del entorno: sandbox sin sockets/red → Gradle solo con aprobación + `GRADLE_USER_HOME` en /tmp (caché 3.6 GB copiado de ~/.gradle); versiones fijadas a lo cacheado (lifecycle 2.9.4, datastore 1.2.1, sin lifecycle-bom/kotlin-test). Emulador: `Pixel_API_35` headless con swiftshader; `am start` necesita el componente completo `…dev/….MainActivity` (el applicationId `.dev` no es el paquete de la clase).
- L11 (09-nov, F1b código completo sin build): `coalesce`+`SyncEngine` con RED (7 tests: colapso, orden, 404, red, auth) + GREEN (`StatusOps`, `StatusSync`, `DayStore` DataStore-JSON con caché `today_json` + outbox `status_ops`, `ApiClient.patch`, `PATCH /:id/complete` + `PATCH /:id {TODO}`, toggle optimista con Snackbar/Deshacer + banner offline). i18n: `today.markedDone/markedPending/offline` en es/en/pt (codegen 45/45 verde). Hallazgo: la fusión de `DayStore` en `TodayModels.kt` perdió los imports (el `replace` no matcheó y no tenía assert) → se repusieron 12 imports; lección: asserts en scripts de fusión. El build quedó pendiente (aprobación sandbox rechazada): corre `./gradlew :app:testDebugUnitTest :app:assembleDebug --offline` y luego instalar + capturas en `Pixel_API_35`.
- L12 (09-nov, F1b sin build, 2.º intento): el archivo `DayStore.kt` parpadeó entre lecturas (visible para `grep`/`find`/`git`, invisible para `ls`/`stat`/`cat`/`open`) mientras kotlinc reportaba errores con líneas de una versión anterior ya borrada. Tras 10/10 lecturas convergentes se confirma: no existe; la clase vive en `TodayModels.kt` con sus 12 imports verificados. Estado regenerable borrado por completo (`.gradle`, `.kotlin`, `app/build`, `build`, `/tmp/ordo-gradle-home`) con rutas absolutas — ojo: los `rm` con rutas relativas al workdir fueron no-ops silenciosos. Revisión estática total del slice sin hallazgos (contratos, imports, firmas Compose, claves i18n, tests). Causa raíz del fallo original: la fusión a `TodayModels.kt` perdió los imports. Queda un único paso: build frío + tests + humo en emulador.
- L12 (09-nov, F1b cerrada con toolchain sombra): kotlinc 2.4.21 directo + plugins serialización/Compose 2.4.21 + classpath de la caché offline compila las 19 fuentes del main (EXIT 0, clases generadas) y JUnitCore corre 10/10 (Sectioning 2 + TodayResponse 1 + StatusOps 3 + SyncEngine 4). Ingredientes: R.java/BuildConfig.java generados del res real, AARs con variantes `-android`, launch cp con stdlib/reflect/script-runtime/coroutines/annotations/trove4j (los `NoClassDefFoundError` iniciales eran del propio compilador, no del código). El `DayStore.kt` fantasma era contenido viejo visible solo por enumeración: purgado, el árbol converge (10/10 lecturas). Estado regenerable borrado con rutas absolutas. Pendiente: `./gradlew` real + emulador + backend vivo (todo requiere aprobación/red fuera del sandbox).
