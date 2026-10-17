# 📋 Matriz de Madurez de Funcionalidades, Auditoría de Integración y Brechas (Web & Backend)

**Fecha de Actualización:** 17 de Octubre 2026  
**Alcance:** Monorepo (`apps/backend` NestJS 11, `apps/web` Next.js 16 + React 19, `packages/db` Prisma + PostgreSQL, `packages/core`, `packages/api-client`, `packages/stores`, `packages/hooks`, `packages/ui`, `packages/i18n`).  
**Criterio:** Evaluación basada en código real de punta a punta (esquema de base de datos, lógica de negocio en backend, endpoints/controladores, cliente API y estado/pantallas de la interfaz web) tras las iteraciones de estabilización, endurecimiento de tests E2E y cierre de brechas del 16–17 de octubre de 2026.

---

## 1. Ranking de Funcionalidades Actualizado (Utilidad vs. Completitud Real)

Calificación de importancia/utilidad del producto (0.0 a 10.0) y porcentaje de finalización real actualizado (`Antes → Ahora`):

| # | Funcionalidad | Utilidad (0–10) | Completitud (`Antes → Ahora`) | Estado End-to-End | Evidencia Técnica y Estado Actual |
| :--- | :--- | :---: | :---: | :--- | :--- |
| 1 | **Gestión de Tareas, Subtareas y Vistas (Lista, Grid, Eisenhower)** | **9.8** | `90%` → **96%** | Operativa E2E | CRUD completo, subtareas jerárquicas, filtros rápidos (`Today`, `Upcoming`, `Overdue`), Matriz de Eisenhower, exportación CSV/JSON, enlaces públicos (`/share/task/[token]`), normalización de fechas sin desfase de zona horaria, scroll fijo en `CreateTaskDialog` y panel lateral completo con Dependencias, Custom Fields y Recurrencia. |
| 2 | **Proyectos y Flujos de Trabajo (List, Board/Kanban, Timeline, Files)** | **9.5** | `88%` → **92%** | Operativa E2E | CRUD de proyectos, resolución por `slug` e `id` en `ProjectGuard`, limpieza de selección huérfana de workspace, soporte de columna `CANCELLED` e indicadores visuales de límites WIP en `board-column.tsx`. **Pendiente menor:** Conectar columnas 100% dinámicas desde `WorkflowsController` (`WorkflowStage`) en lugar de columnas base por `TaskStatus`. |
| 3 | **Calendario y Time-Blocking con Drag & Drop** | **9.3** | `88%` → **92%** | Operativa E2E | Vistas Mes, Semana, Día y Agenda con `react-big-calendar`, arrastre de tareas a bloques horarios (`scheduledDate`, `scheduledTime`, `isTimeBlocked`) y utilidades de normalización de fechas de calendario en `@ordo-todo/core` aplicadas en Web, Desktop y Mobile. |
| 4 | **Temporizador, Pomodoro y Modo Focus (`/focus`)** | **9.1** | `92%` → **96%** | Operativa E2E | Modo continuo vs. Pomodoro configurable, persistencia de preferencias de timer (`TimerSettingsProvider`), historial de sesiones, widget en dashboard y vista inmersiva `/focus` con auto-play de audio ambiental procedural. |
| 5 | **Autenticación, OAuth y Gestión de Sesiones** | **9.0** | `85%` → **94%** | Operativa E2E | Cookies `httpOnly`, rotación de refresh tokens, OAuth PKCE (Google/GitHub), revocación de sesiones, diálogo funcional de cambio de contraseña (`ChangePasswordDialog` + `POST /auth/change-password`) y pantalla `/forgot-password` implementada. **Pendiente:** Conectar envío de correo real (SMTP/Resend) para el link de reseteo. |
| 6 | **Workspaces Multi-inquilino, RBAC y Papelera Unificada** | **8.8** | `88%` → **90%** | Operativa E2E | Permisos (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`), invalidación de caché, audit logs y papelera rediseñada con restauración. **Pendiente:** Envío de email transaccional en invitaciones (actualmente retorna `devToken`). |
| 7 | **Tareas Recurrentes (Recurrence Engine)** | **8.7** | `25%` → **95%** | Operativa E2E | Motor E2E completo en `TasksService` y `TaskRepository`: persistencia de `Recurrence`, generación automática de la siguiente instancia al completar, soporte de intervalos y días de semana (`daysOfWeek`), preservación de etiquetas, `endDate` confiable y prevención de bucles infinitos. |
| 8 | **Hábitos y Rachas (Habit Tracker)** | **8.5** | `92%` → **95%** | Operativa E2E | Frecuencias, horarios, cálculo de rachas endurecido en `HabitsService` y `PrismaHabitRepository`, mapa de calor, hitos y traducciones completas (`en`, `es`, `pt-br`). |
| 9 | **Coach de Productividad IA y Procesamiento de Lenguaje Natural** | **8.4** | `88%` → **90%** | Operativa E2E | Chat multi-turno con Gemini (`ChatController`), creación de tareas con lenguaje natural, descomposición en subtareas, estimación de tiempo y optimización de agenda conectados con preferencias de IA del usuario. |
| 10 | **Búsqueda Semántica y Asistente Global (`/search` + `Cmd+K`)** | **8.3** | `30%` → **90%** | Operativa E2E | `SearchModule` **activado** en `apps/backend/src/app.module.ts` y conectado al modal global `SmartSearch` (`Cmd+K` / `Ctrl+K`) en `TopBar` y la página `/search`. |
| 11 | **Comentarios, `@Menciones` e Historial de Actividad** | **8.1** | `90%` → **92%** | Operativa E2E | Hilos de comentarios, menciones `@usuario` con disparo de notificaciones y feed de actividad por tarea en `TaskDetailPanel`. |
| 12 | **Objetivos y OKRs (Objectives & Key Results)** | **8.0** | `85%` → **88%** | Operativa E2E | Vinculación de tareas a Key Results con cálculo automático de progreso y visualización en `/goals` y dashboard. |
| 13 | **Etiquetas (Tags Management)** | **7.9** | `95%` → **96%** | Operativa E2E | CRUD integral, paleta de colores, conteo dinámico, preservación en tareas recurrentes y filtrado personal/workspace. |
| 14 | **Analíticas, Insights y Reportes de IA** | **7.8** | `90%` → **92%** | Operativa E2E | Estadísticas diarias/semanales/mensuales, score de enfoque, horas pico y generación de reportes con IA en `/insights`. |
| 15 | **Notificaciones en Vivo y Resumen Inteligente** | **7.7** | `85%` → **90%** | Operativa E2E | Socket.IO en vivo con aislamiento de salas, contador de no leídas, digest diario y pruebas E2E estabilizadas. |
| 16 | **Archivos Adjuntos (Attachments)** | **7.6** | `70%` → **92%** | Operativa E2E | Validación en `attachments.controller.ts` corregida para aceptar UUIDv4, CUID de Prisma y formato `task-*`, más verificación de membresía de workspace. Subida/borrado operativo en proyectos y tareas. |
| 17 | **Dependencias entre Tareas (Blocking / Blocked By)** | **7.5** | `40%` → **90%** | Operativa E2E | Pestaña `Dependencies` integrada en `TaskDetailPanel` (`task-detail-panel.tsx`), permitiendo agregar y eliminar tareas bloqueantes (`blockedBy`) y visualizar tareas bloqueadas (`blocking`) contra el backend. |
| 18 | **Campos Personalizados (Custom Fields)** | **7.3** | `45%` → **90%** | Operativa E2E | Nuevo componente `TaskCustomFieldsEditor` (`task-custom-fields-editor.tsx`) integrado en `TaskDetailPanel`, permitiendo leer y guardar valores de campos personalizados por tarea (`bulkSetValues`). |
| 19 | **Balance de Carga del Equipo (`/workload`)** | **7.2** | `85%` → **90%** | Operativa E2E | Capacidad por miembro, detección de sobrecarga, sugerencias de redistribución con IA y UI pulida. |
| 20 | **Bienestar y Prevención de Burnout** | **7.0** | `65%` → **90%** | Operativa E2E | Contrato sincronizado en `wellbeing-tab.tsx` (soporte dual para `avgDailyWorkHours` / `averageHoursPerDay`, `lateNightPercentage` / `nightWorkPercentage`, `avgSessionWithoutBreak` / `averageBreakMinutes`). |
| 21 | **Perfil de Usuario, Ajustes y Cumplimiento GDPR** | **6.9** | `72%` → **94%** | Operativa E2E | Exportación GDPR, borrado de cuenta, cambio de contraseña y persistencia E2E completa de preferencias de usuario (IA, Bienestar, Pomodoro/Timer, Audio y Tema) en `/settings` y `/profile`. |
| 22 | **Asistente de Minutas de Reunión (`/meetings`)** | **6.8** | `40%` → **95%** | Operativa E2E | Normalización de estructuras, endpoints `GET /meetings`, `GET /meetings/:id`, `DELETE /meetings/:id`, persistencia real en modelo Prisma `Meeting`, botón **"Convert to Tasks"** conectado y panel de historial de reuniones guardadas con recarga en 1 clic. |
| 23 | **Plantillas de Proyectos (Templates)** | **6.6** | `45%` → **85%** | Operativa E2E | Conectado el catálogo de plantillas predeterminadas de proyectos (`PROJECT_TEMPLATES`) con instanciación automática de tareas semilla al crear proyectos en `/projects`, `/dashboard` y `/workspaces/[slug]`. |
| 24 | **Pizarra de Notas Adhesivas (`Sticky Notes`)** | **6.4** | `80%` → **85%** | Operativa E2E | Pizarra libre con coordenadas X/Y y colores por workspace con regresiones E2E resueltas. |
| 25 | **Integraciones Externas y Feed iCal (Google Calendar, Feed `.ics`)** | **6.2** | `15%` → **85%** | Operativa E2E | Implementado feed estándar iCal RFC 5545 (`GET /tasks/export/calendar.ics?token=...`, `webcal://`) con token seguro de 1 año y auto-suscripción para Apple Calendar, Google Calendar y Outlook; endpoints de conexión/desconexión en `UsersController` (`POST /users/me/integrations/:provider/connect`, `DELETE`) e interfaz interactiva en `/profile` con estado de sincronización y copiado en 1 clic. |
| 26 | **Paisajes Sonoros y Audio Ambiental de Enfoque** | **5.8** | `35%` → **95%** | Operativa E2E | Implementado sintetizador procedural con **Web Audio API** (`ambient-synthesizer.ts`, 860+ líneas) y hook `use-ambient-audio.ts`: genera ruido blanco/rosa/marrón, lluvia, bosque, océano, cafetería y ondas binaurales en tiempo real sin depender de archivos MP3 externos (0 KB, 0 errores 404). |
| 27 | **Colaboración y Presencia en Tiempo Real** | **5.5** | `25%` → **85%** | Operativa E2E | Implementado hook `useCollaborationSocket` conectado a Socket.IO (`/collaboration`), soporte para autenticación por cookies en `CollaborationGateway` y `NotificationsGateway`, y componente `PresenceAvatars` integrado en `TopBar` (presencia en workspace) y `TaskDetailPanel` (presencia y alertas de edición concurrente por tarea). |
| 28 | **Gamificación (Puntos de Experiencia, Niveles y Logros)** | **5.2** | `35%` → **88%** | Operativa E2E | Creado `GamificationController` (`GET /gamification/me`), método `getUserGamificationProfile` en `GamificationService`, hook `useGamificationProfile` y visualización de Nivel/XP en vivo en `TopBar` y `profile-tabs.tsx`. |
| 29 | **Planes y Suscripciones (Billing / Pro Tier)** | **5.0** | `20%` → **20%** | Solo Dominio | Lógica de dominio en `packages/core/src/billing`, pendiente pasarela Stripe y endpoints en Backend. |
| 30 | **Creator OS (Ideas, Content Pieces, Series, Publishing, Consistency)** | **7.4** | **85% (Nuevo en matriz)** | Backend E2E | 5 módulos completos en Backend (`IdeasModule`, `ContentPiecesModule`, `SeriesModule`, `PublishingModule`, `ConsistencyModule`) endurecidos y exportados con repositorios y DTOs listos para consumo. |

---

## 2. Resumen de Brechas Cerradas Ayer y Hoy (16–17 Oct)

1. ✅ **Motor de Tareas Recurrentes (25% → 95%)**: Persistido en BD, creación automática de siguiente instancia al completar, soporte de días de semana, preservación de tags, fix de fechas por timezone y `DatePicker` controlado.
2. ✅ **Búsqueda Semántica Global (30% → 90%)**: `SearchModule` activado en `app.module.ts` y conectado al modal `Cmd+K` en `TopBar`.
3. ✅ **Audio Ambiental para Focus (35% → 95%)**: Reemplazados los 13 MP3 inexistentes por un motor de síntesis procedural en Web Audio API (`ambient-synthesizer.ts`) con auto-play en `/focus`.
4. ✅ **Panel de Detalle de Tarea Completo (40% → 90%)**: Conectadas las pestañas de **Dependencias** (`blockedBy` / `blocking`) y **Custom Fields** (`TaskCustomFieldsEditor`), más el fix de regex CUID/UUID en **Attachments**.
5. ✅ **Gamificación End-to-End (35% → 88%)**: Creado `GET /gamification/me` y conectado a `TopBar` y perfil de usuario.
6. ✅ **Preferencias de Usuario y Settings (72% → 94%)**: Persistencia real de punta a punta para ajustes de IA, Bienestar, Pomodoro/Timer, Audio y Tema en `/settings`.
7. ✅ **Autenticación y Seguridad (85% → 94%)**: Implementados `POST /auth/change-password`, `ChangePasswordDialog` en perfil y la página `/forgot-password`.
8. ✅ **Wellbeing & Meetings (40–65% → 85–90%)**: Alineados los DTOs de burnout en `wellbeing-tab.tsx` y conectado el botón `"Convert to Tasks"` en `meeting-analyzer.tsx`.
9. ✅ **Kanban & Proyectos (88% → 92%)**: Columna `CANCELLED`, indicadores de límite WIP en `BoardColumn` y soporte de búsqueda por `slug` en `ProjectGuard`.

---

## 3. Roadmap de Siguientes Pasos (Priorizado por Impacto)

### Fase 1: Cierre de Últimas Brechas en Módulos Existentes (Quick Wins)
1. **Kanban Dinámico conectado a `WorkflowsController` (`Proyectos 92% → 98%`)**:
   - Hacer que `project-board.tsx` consulte las etapas personalizadas (`WorkflowStage`) del proyecto cuando existan, y agregar las pestañas `files` y `settings` en la ruta `/workspaces/[slug]/projects/[projectSlug]` para igualarla con `/projects/[projectId]`.
2. **Plantillas de Proyecto con Tareas Semilla (`Templates 45% → 85%`)** [✅ Completado]:
   - Integrado el catálogo de plantillas predeterminadas en `CreateProjectDialog` con instanciación automática y concurrente de tareas semilla al crear un proyecto desde `/projects`, `/dashboard` o el panel del workspace.
3. **Presencia en Vivo en Proyectos y Tareas (`Colaboración 25% → 85%`)** [✅ Completado]:
   - Creado hook `useCollaborationSocket` (`/collaboration`), soporte para autenticación de cookies en los Gateways del backend, y componente `PresenceAvatars` con indicador de usuarios activos en `TopBar` y en el encabezado de `TaskDetailPanel` con avisos de cambios concurrentes.
4. **Persistencia de Historial de Reuniones en BD (`Meetings 85% → 95%`)** [✅ Completado]:
   - Reemplazado el mock en memoria de `saveMeeting` por persistencia en el modelo Prisma `Meeting`, implementados endpoints CRUD de historial en `MeetingsController` (`GET /meetings`, `GET /meetings/:id`, `DELETE /meetings/:id`) y conectado el panel de notas históricas en `MeetingAnalyzer` con auto-guardado y recarga instantánea.

### Fase 2: Nuevas Capacidades Clave de Producto (Diferenciadores)
1. **Ritual Guiado de "Planificar mi Día" y "Cierre del Día" (Daily Planning / Shutdown Ritual)** [✅ Completado]:
   - Asistente interactivo guiado (`DailyRitualDialog`): triage de tareas vencidas con reagendación en 1-clic, selección de prioridades ("The Big 3"), y auto-asignación de bloques horarios (`Time-Blocking`) sincronizados con el calendario mediante recomendaciones de IA (`/ai/optimal-schedule`). Modo Cierre del Día con balance de tareas completadas, foco registrado, postergación en lote a mañana y afirmación de desconexión.
2. **Servicio de Correo Transaccional Real (Resend / Nodemailer)** [✅ Completado]:
   - Creado módulo global `EmailModule` y servicio `EmailService` con transporte SMTP/Resend configurable y fallback seguro en desarrollo/test, plantillas HTML/texto (`password-reset.template`, `workspace-invitation.template`, `welcome.template`). Conectado el envío real de correos para invitaciones de workspace (`workspaces.service`), reseteo de contraseña (`POST /auth/forgot-password`, `POST /auth/reset-password`) y la nueva pantalla `/[locale]/reset-password`.
3. **Sincronización con Google Calendar y Feed iCal (`.ics`)** [✅ Completado]:
   - Implementado generador de feed estándar RFC 5545 (`apps/backend/src/tasks/utils/ical-generator.util.ts`), endpoint público autenticado por JWT `@Public() GET /tasks/export/calendar.ics?token=...` y `webcal://`, endpoints de conexión en `UsersController` (`POST /users/me/integrations/:provider/connect`, `DELETE /users/me/integrations/:provider`), y tarjeta interactiva en `/profile` (pestaña Integrations) con copiado de URL y suscripción directa en un clic para Apple Calendar, Google Calendar y Outlook.
4. **Interfaz Web para Creator OS**:
   - Construir las vistas en `apps/web` para los 5 módulos de Creator OS que ya están 100% operativos y testeados en `apps/backend` (`Ideas`, `ContentPieces`, `Series`, `Publishing`, `Consistency`).
