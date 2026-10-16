# 📋 Matriz de Madurez de Funcionalidades, Auditoría de Integración y Brechas (Web & Backend)

**Fecha de Auditoría:** 16 de Octubre 2026  
**Alcance:** Monorepo (`apps/backend` NestJS 11, `apps/web` Next.js 16 + React 19, `packages/db` Prisma + PostgreSQL, `packages/core`, `packages/api-client`, `packages/stores`, `packages/hooks`).  
**Criterio:** Evaluación basada en código real de punta a punta (esquema de base de datos, lógica de negocio en backend, endpoints/controladores, cliente API y estado/pantallas de la interfaz web).

---

## 1. Ranking de Funcionalidades (Utilidad e Importancia vs. Completitud Real)

Calificación de importancia/utilidad del producto (0.0 a 10.0) y porcentaje de finalización real (0% a 100%):

| # | Funcionalidad | Utilidad (0–10) | Completitud | Estado End-to-End | Evidencia Técnica y Puntos de Falla |
| :--- | :--- | :---: | :---: | :--- | :--- |
| 1 | **Gestión de Tareas, Subtareas y Vistas (Lista, Grid, Eisenhower)** | **9.8** | **90%** | Operativa E2E | CRUD completo, subtareas jerárquicas con recálculo de progreso, filtros rápidos (`Today`, `Upcoming`, `Overdue`), Matriz de Eisenhower (`/eisenhower`), exportación CSV/JSON y enlaces públicos (`/share/task/[token]`). Falta pulir renderizado de custom fields y dependencias dentro del panel lateral. |
| 2 | **Proyectos y Flujos de Trabajo (List, Board/Kanban, Timeline, Files)** | **9.5** | **88%** | Operativa E2E (Kanban rígido) | CRUD de proyectos, archivado, métricas globales. **Brecha técnica:** `WorkflowsController` soporta etapas dinámicas (`WorkflowStage`), pero `project-board.tsx` hardcodea 3 columnas fijas (`TODO`, `IN_PROGRESS`, `COMPLETED`) ignorando el flujo del proyecto. |
| 3 | **Calendario y Time-Blocking con Drag & Drop** | **9.3** | **88%** | Operativa E2E | Vistas Mes, Semana, Día y Agenda con `react-big-calendar`. Arrastre de tareas sin programar desde el panel lateral hacia bloques horarios de agenda (`scheduledDate`, `scheduledTime`, `isTimeBlocked`). |
| 4 | **Temporizador, Pomodoro y Modo Focus (`/focus`)** | **9.1** | **92%** | Operativa E2E | Modo continuo vs. Pomodoro configurable, cambio rápido de tarea vinculada, persistencia de sesiones de enfoque, historial y vista fullscreen en `/focus`. |
| 5 | **Autenticación, OAuth y Gestión de Sesiones** | **9.0** | **85%** | Operativa E2E | Cookies `httpOnly` (`accessToken`, `refreshToken`), rotación de tokens, revocación remota de sesiones y login con Google/GitHub. **Brechas:** La ruta `/forgot-password` devuelve 404, auditoría IP/User-Agent en auth usa stubs y el botón "Change Password" en perfil carece de `onClick`. |
| 6 | **Workspaces Multi-inquilino, RBAC y Papelera Unificada** | **8.8** | **88%** | Operativa E2E | Roles (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`), transferencias de propiedad, audit logs estructurados y papelera con restauración. **Brecha:** Las invitaciones retornan un `devToken` por API y no envían emails. |
| 7 | **Tareas Recurrentes (Recurrence Engine)** | **8.7** | **25%** | Incompleta (UI/Schema sin Backend) | La UI expone selector de recurrencia y Prisma cuenta con el modelo `Recurrence`. Sin embargo, `TasksService` **no persiste la recurrencia** y nunca programa la siguiente ocurrencia al marcar una tarea como completada. |
| 8 | **Hábitos y Rachas (Habit Tracker)** | **8.5** | **92%** | Operativa E2E | Frecuencias flexibles, franjas horarias, cálculo de rachas, matriz de calor de completitud, hitos y widget en el dashboard principal. |
| 9 | **Coach de Productividad IA y Procesamiento de Lenguaje Natural** | **8.4** | **88%** | Operativa E2E | Chat multi-turno con Gemini (`ChatController`), descomposición inteligente de tareas en subtareas, estimador de tiempos y optimizador de horarios de agenda. |
| 10 | **Búsqueda Semántica y Asistente Global (`/search`)** | **8.3** | **30%** | Desactivada en Backend | `SearchController`, `SemanticSearchService` y llamadas en `api-client.ts` están listos, pero `// SearchModule` está **comentado en `apps/backend/src/app.module.ts`**, arrojando 404 en todas las peticiones. |
| 11 | **Comentarios, `@Menciones` e Historial de Actividad** | **8.1** | **90%** | Operativa E2E | Comentarios anidados, detección de `@usuario` con disparo de notificación y feed de auditoría detallado por tarea en el panel de detalle. |
| 12 | **Objetivos y OKRs (Objectives & Key Results)** | **8.0** | **85%** | Operativa E2E | Árbol de Objetivos y Resultados Clave con vinculación directa a tareas y actualización automática del % de avance. |
| 13 | **Etiquetas (Tags Management)** | **7.9** | **95%** | Operativa E2E | CRUD integral, paleta cromática, conteo dinámico de elementos y filtros combinados. |
| 14 | **Analíticas, Insights y Reportes de IA** | **7.8** | **90%** | Operativa E2E | Métricas de rendimiento diario/semanal, horas de mayor productividad, distribución por prioridad y exportación de reportes generados con IA. |
| 15 | **Notificaciones en Vivo y Resumen Inteligente** | **7.7** | **85%** | Operativa E2E | Conexión WebSocket mediante Socket.IO, actualización instantánea de insignias de lectura, digest diario y categorización por IA. |
| 16 | **Archivos Adjuntos (Attachments)** | **7.6** | **70%** | Parcial (Bug de ID) | Carga y descarga funcional en proyectos. En tareas arroja `400 Invalid task ID format` porque el controlador valida con regex UUIDv4 mientras Prisma genera IDs en formato CUID. |
| 17 | **Dependencias entre Tareas (Blocking / Blocked By)** | **7.5** | **40%** | Backend Only | Endpoints listos en `TasksController` (`GET/POST/DELETE /tasks/:id/dependencies`), pero sin métodos en el cliente frontend ni controles en el panel lateral de la tarea. |
| 18 | **Campos Personalizados (Custom Fields)** | **7.3** | **45%** | Parcial (Sin asignación en tareas) | Configuración de campos a nivel proyecto en interfaz web, pero `TaskDetailPanel` no dibuja los inputs ni consume `POST /custom-fields/values/bulk`. |
| 19 | **Balance de Carga del Equipo (`/workload`)** | **7.2** | **85%** | Operativa E2E | Capacidad por miembro, alertas de sobrecarga y sugerencia asistida de redistribución de tareas. |
| 20 | **Bienestar y Prevención de Burnout** | **7.0** | **65%** | Parcial (Contrato desincronizado) | El backend procesa patrones de sobrecarga laboral reales, pero `wellbeing-tab.tsx` busca claves distintas en la respuesta (`averageHoursPerDay` vs `avgDailyWorkHours`), mostrando tarjetas en 0. |
| 21 | **Perfil de Usuario, Ajustes y Cumplimiento GDPR** | **6.9** | **72%** | Parcial (Settings desconectado) | Descarga de datos JSON (GDPR) y supresión de cuenta al 100%. Sin embargo, en `/settings` las tarjetas de IA, Bienestar y Audio son inputs no controlados sin persistencia. |
| 22 | **Asistente de Minutas de Reunión (`/meetings`)** | **6.8** | **40%** | Incompleta (Contrato y mock) | Errores de renderizado React al tratar arrays de objetos como strings, botón "Convert to Tasks" sin evento `onClick`, y persistencia simulada en memoria. |
| 23 | **Plantillas de Proyectos (Templates)** | **6.6** | **45%** | Desconectada | El backend dispone de CRUD de plantillas en PostgreSQL, pero la web consume una lista local estática (`project-templates.ts`). |
| 24 | **Pizarra de Notas Adhesivas (`Sticky Notes`)** | **6.4** | **80%** | Operativa E2E | Lienzo infinito con arrastre de notas por coordenadas X/Y y temas de color persistidos en base de datos. |
| 25 | **Integraciones Externas (Google Calendar, Slack, GitHub)** | **6.2** | **15%** | Solo Esquema / Mock UI | Existe modelo `UserIntegration`, pero los botones de enlace en la interfaz no ejecutan flujo OAuth ni sincronización con terceros. |
| 26 | **Paisajes Sonoros y Audio Ambiental de Enfoque** | **5.8** | **35%** | Recursos faltantes | El reproductor intenta cargar 13 pistas MP3 en `/audio/ambient/*.mp3`, pero la carpeta no existe en `apps/web/public`, produciendo 404 en el audio. |
| 27 | **Colaboración y Presencia en Tiempo Real** | **5.5** | **25%** | Backend Only | `CollaborationGateway` gestiona salas, cursores y bloqueos concurrentes de tareas en backend, pero la aplicación web no se suscribe a dicho canal. |
| 28 | **Gamificación (Puntos de Experiencia, Niveles y Logros)** | **5.2** | **35%** | Backend Service Only | `GamificationService` calcula y otorga XP/niveles en base de datos al finalizar tareas y hábitos, pero no hay controlador HTTP ni interfaz para visualizarlos. |
| 29 | **Planes y Suscripciones (Billing / Pro Tier)** | **5.0** | **20%** | Solo dominio | Modelado en base de datos y lógica de dominio en `packages/core/src/billing`, pero sin integración de pasarela de pago (Stripe) ni endpoints expuestos. |

---

## 2. Plan de Mejoras para Pantallas y Módulos Existentes

### Correcciones Críticas de Integración (Bajo Esfuerzo, Alto Impacto)
1. **Habilitación de Búsqueda Global**: Descomentar `SearchModule` en `apps/backend/src/app.module.ts` y ligar el atajo `Cmd+K` / `Ctrl+K` a un modal de búsqueda global y consultas semánticas.
2. **Corrección de Validación en Archivos Adjuntos**: Ajustar la expresión regular en `attachments.controller.ts` para validar tanto identificadores UUIDv4 como CUID de Prisma, desbloqueando la subida de archivos en tareas.
3. **Sincronización de DTOs en Bienestar y Reuniones**:
   - Alinear las propiedades devueltas por `burnout-prevention.service.ts` con los campos consumidos por `wellbeing-tab.tsx`.
   - Normalizar la respuesta de `meeting-assistant.service.ts` para que `meeting-analyzer.tsx` procese objetos estructurados sin errores de renderizado y asociar la acción "Convert to Tasks" a la API.
4. **Unificación de Preferencias y Ajustes**: Reemplazar los componentes sin estado en `/settings` con los hooks y llamadas que ya guardan preferencias en `/profile`.

### Consolidación Funcional del Dominio
1. **Motor de Tareas Recurrentes**: Implementar el ciclo de vida en `TasksService`: guardar la regla de recurrencia en base de datos y, tras completar una tarea recurrente, calcular la próxima fecha y generar la nueva instancia automáticamente.
2. **Kanban Dinámico con Etapas de Proyecto**: Modificar `project-board.tsx` para solicitar las etapas de flujo (`GET /workflows/:projectId`) y renderizar columnas dinámicas con límites WIP en lugar de columnas estáticas.
3. **Completar Panel Lateral de Tarea (`TaskDetailPanel`)**:
   - Incorporar controles para visualizar y asignar dependencias de bloqueo entre tareas.
   - Mostrar y editar los valores de campos personalizados del proyecto asociado.
4. **Visibilidad de Gamificación**: Exponer `GET /gamification/me` en el backend y ubicar una barra sutil de nivel y progreso de XP en el encabezado o perfil del usuario.

---

## 3. Capacidades Faltantes de Alto Valor para la Plataforma

Para llevar el producto a un estándar competitivo frente a herramientas líderes de productividad, se recomienda incorporar:

1. **Sincronización Bidireccional de Calendario (Google Calendar / Outlook / iCal Feed)**:
   - Permitir a los usuarios exportar su bloque de tiempo mediante enlace iCal (`.ics`) y sincronizar eventos de Google Calendar para que el time-blocking refleje reuniones reales y evite solapamientos.
2. **Servicio Transaccional de Correos Electrónicos (Resend / Postmark)**:
   - Remplazar tokens de depuración por correos reales de invitación a espacios de trabajo.
   - Implementar el flujo completo de recuperación de contraseña (`/forgot-password`).
   - Envío automático de resúmenes de productividad semanal programados.
3. **Flujo Guiado de Inicio y Cierre Diario (Daily Planning & Shutdown Ritual)**:
   - Un modal asistido de 2 minutos por la mañana para revisar tareas pendientes, seleccionar las prioridades del día y ubicarlas en bloques horarios en el calendario.
   - Un ritual de cierre al final de la jornada laboral para reprogramar tareas inconclusas y vaciar la bandeja de entrada mental.
4. **Generador Sintetizado de Ruido para Focus (Web Audio API)**:
   - Eliminar la dependencia de archivos de audio MP3 externos implementando generadores de ruido blanco, rosa, marrón y lluvia mediante la API nativa de audio del navegador (0 KB de descarga y 100% de confiabilidad offline).
5. **Modo Offline-First y Soporte PWA Completo**:
   - Estrategia de mutaciones optimistas en React Query / Zustand con almacenamiento local en IndexedDB, permitiendo registrar tareas y controlar temporizadores sin conexión y sincronizar cambios automáticamente al reconectar.
