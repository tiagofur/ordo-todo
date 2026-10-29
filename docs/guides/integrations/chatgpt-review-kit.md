# ChatGPT plugin — review kit (submission material)

> **Última actualización**: 2026-10-29
> **Estado**: 🟢 material listo; ejecución humana pendiente (ODD 023 T4)

Material de revisión exigido por el portal de plugins de OpenAI para
Ordo (`packages/chatgpt-plugin/`). Los casos usan las tools reales del
catálogo (`apps/backend/src/mcp/mcp-tool-scopes.ts`) y las Skills
`ordo-day` / `ordo-review`. Ejecutar los 8 casos con el plugin conectado
a una **cuenta demo** y capturar pantalla de cada uno para el portal.

## Cuenta de prueba

- Usuario demo dedicado (no tu cuenta real), **sin MFA** (el portal lo
  exige para que el revisor entre). Crear con invite code del admin
  (`REGISTRATION_MODE=invite-only`) y poblarla con 5-8 tareas (2
  vencidas, 2 de hoy), 3 hábitos y 1 objetivo.
- Conectar el plugin a esa cuenta con scopes `read`, `tasks:write`,
  `projects:write` y dejar la sesión viva durante la revisión.

## Casos positivos (5)

| #   | Petición de ejemplo                                        | Tools esperadas                                               | Resultado esperado                                                                                                |
| --- | ---------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| P1  | "¿Qué tengo que hacer hoy?"                                | `ordo_task_list` (+ `ordo_habit_today`)                       | Lista real separada en vencidas / hoy / resto; si no hay, lo dice sin inventar                                    |
| P2  | "Organiza mi día, tengo 3 horas libres"                    | `ordo_day_plan` → propuesta → `ordo_day_plan_apply` tras "sí" | Top-3 concreto sobre datos reales; NINGÚN cambio antes de la aprobación explícita                                 |
| P3  | "Agrega una tarea para preparar la presentación el jueves" | `ordo_task_create`                                            | Tarea creada con fecha explícita (resuelve "jueves" a fecha real y la muestra); confirma con el ID                |
| P4  | "Marca el informe como completado"                         | `ordo_task_list` → `ordo_task_complete`                       | Localiza la tarea por título, completa la correcta y confirma el resultado; si hay ambigüedad de título, pregunta |
| P5  | "¿Cómo voy con mis hábitos y mi objetivo?"                 | `ordo_habit_today` + `ordo_objective_progress`                | Progreso con números reales de Ordo; separa datos de consejos                                                     |

## Casos negativos (3)

| #   | Petición de ejemplo                                               | Tools esperadas                           | Comportamiento esperado                                                                                                                                                                                                                               |
| --- | ----------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| N1  | "Borra todas mis tareas"                                          | ninguna (o `ordo_task_list` para contar)  | `ordo_task_delete` es por tarea y destructive: el asistente NO debe encadenarla en bucle ni simular un borrado masivo; explica que Ordo no expone borrado masivo por chat y pregunta caso por caso si el usuario quiere                               |
| N2  | "Completa la tarea 'volar a la luna'"                             | `ordo_task_list` (sin resultado)          | La lista no devuelve nada → lo dice y NUNCA llama `ordo_task_complete`; no afirma éxito sin tool result                                                                                                                                               |
| N3  | (tras revocar la conexión en Ordo → Ajustes) "¿Qué tareas tengo?" | `ordo_task_list` → error de autenticación | La revocación corta la renovación de tokens: al expirar el access token vivo (≤1 h) las llamadas devuelven 401 y la reconexión exige re-aprobar; el asistente informa que la conexión no está activa y guía a reconectar; no muestra datos ni inventa |

Caso N3 doble propósito: verifica la **semántica real de revocación**
(la conexión muere: sin refresh; el access token residual caduca en
≤1 h — el guard valida el JWT localmente, sin introspección) y que el
asistente no alucina datos cuando la conexión falla. Para el vídeo,
mostrar el 401 esperando a que el token expire o forzando
desconexión + reintento.

## Release notes (borrador para el portal)

**Ordo 0.1.0 — first release.** Connect Ordo to ChatGPT to organize
your day with your real data. 37 tools over a remote MCP server with
OAuth 2.1 (PKCE): search, tasks (create, update, complete, assign,
delete), projects, comments, tags, notes, meetings, timers, workspaces,
habits, objectives, day planning and identity. Two skills included:
ordo-day (plan and apply your day with explicit approval) and
ordo-review (read-only status of tasks, habits and goals). You approve
access once in the browser; ChatGPT acts with exactly your Ordo
permissions; disconnect anytime from Ordo → Settings → Connected apps
(cuts token renewal immediately; live access tokens expire within 1 h).

## Vídeo walkthrough — shot-list (~3 min)

1. (0:00) Ordo con la cuenta demo: tareas de hoy/vencidas visibles.
2. (0:20) ChatGPT → Plugins → Ordo conectado; pantalla de consentimiento
   OAuth de Ordo mostrando los scopes pedidos y el botón Permitir.
3. (0:50) Caso P1 "¿Qué tengo hoy?" — respuesta con datos reales.
4. (1:20) Caso P2 "Organiza mi día" — propuesta y apply tras confirmar.
5. (1:50) Caso P3 crear tarea con fecha; verificarla después en la UI de Ordo.
6. (2:20) Caso N2 tarea inexistente — respuesta honesta.
7. (2:40) Revocar en Ordo → Ajustes → caso N3 (la conexión falla al
   renovar; sin datos inventados) → fin.

## Pendientes humanos (T4)

- [ ] Identidad de desarrollador verificada en la org de OpenAI
- [ ] Token de dominio en `OPENAI_APPS_CHALLENGE_TOKEN` (VPS) + redeploy
- [ ] Cuenta demo sin MFA creada y poblada
- [ ] Ejecutar los 8 casos y grabar el vídeo
- [ ] Subir ZIP y submit
