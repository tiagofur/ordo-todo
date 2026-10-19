# Análisis competitivo: Ordo vs el mundo

> **Última actualización**: 2026-10-18
> **Autor/Mantenedor**: equipo Ordo
> **Estado**: 🚧 En desarrollo

## 📋 Índice rápido

- [Regla de lectura](#regla-de-lectura)
- [Superpoder por competidor](#superpoder-por-competidor)
- [Comparativas directas](#comparativas-directas)
- [Gaps que Ordo debe cerrar](#gaps-que-ordo-debe-cerrar)
- [Diferenciadores a proteger](#diferenciadores-a-proteger)
- [Referencias](#referencias)

---

## Regla de lectura

Este documento compara para decidir qué construir, no para copiar identidades. Cada fila termina en una acción: qué aprender, qué igualar o qué no perseguir. El trabajo resultante vive en [odd/tasks/](../../odd/tasks/).

## Superpoder por competidor

| App | Su superpoder | Lo que Ordo aprende |
|---|---|---|
| **Slack** | De chat a "plataforma de trabajo con IA": agentes invocados con @ como compañeros, Canvas, Workflows, Lists, MCP oficial bidireccional | Los agentes viven donde trabaja el usuario, invocados como personas. Integrarse, no clonarlo. |
| **Notion** | Referente en conectividad: MCP remoto con ~50 herramientas y docs de setup copy-paste por cliente (Claude, Cursor, ChatGPT, Hermes…) | Su MCP es el patrón oro a copiar tal cual: mismo transporte, misma documentación por cliente. |
| **Todoist** | La captura más rápida del mercado: Quick Add con lenguaje natural y reconocimiento de fechas/recurrencias imbatible | La fricción de captura lo es todo. Igualar o morir en el núcleo. |
| **Linear** | Velocidad obsesiva y craft keyboard-first; agente que toma tareas en la nube y propone fixes para revisión humana | Latencia y densidad de información; agente que actúa, no que chatea. |
| **Asana** | Enterprise agentic de confianza: Work Graph como capa compartida humano-agente, compañeros IA listos, conectores que actúan sin salir del chat | Confianza enterprise (no entrenar con datos, borrado tras consulta) desde el día uno. |
| **Motion** | Auto-scheduling total: replanifica decenas de veces al día, distingue fecha de hacer vs fecha límite, avisa días antes si hay riesgo | El "wow" demo más fuerte del segmento. El calendario es campo de batalla. |
| **Sunsama** | Ritual diario calmado: planificación guiada de mañana y cierre, time-boxing, analítica de foco | Barato de construir, retención altísima. |
| **Reclaim** | Defensa del calendario por IA: bloques de foco, hábitos, buffers, sync de estado con Slack | El calendario como sistema defensivo, no solo vista. |
| **Obsidian** | Soberanía local: Markdown offline, plugins, sin lock-in | Privacidad y extensibilidad como valores; export real como prueba. |

## Comparativas directas

### Vs Slack

- Ordo **no tiene** chat de equipo ni hilos persistentes, y **no los construirá** (no-meta, ver [product-vision.md](./product-vision.md)).
- Slack **no tiene** hábitos, OKRs, pomodoro, bienestar ni time-tracking personal.
- Son complementarios: la integración Slack ↔ Ordo (notificaciones, crear tarea desde mensaje, sync de estado) es obligatoria. → `odd/tasks/011-slack-integration.md`

### Vs Notion

- Las notas de Ordo son un tablero simple; Notion tiene editor de bloques colaborativo en tiempo real. Ordo **no perseguirá** ese editor.
- Notion **no tiene** time-tracking, hábitos, gamificación, coach de burnout ni foco con audio.
- De Notion se copia **su MCP y su documentación por cliente**, no su editor. → `odd/tasks/001-mcp-server.md`, `odd/tasks/002-client-integration-docs.md`

### Vs Todoist / Linear (el núcleo duele aquí)

- Compiten en tareas rápidas, donde Ordo hoy pierde: captura con fricción, atajos inconsistentes, sin paleta de comandos unificada cross-platform.
- Ordo gana en amplitud (hábitos + OKRs + pomodoro + bienestar + IA), pero la amplitud no compensa un núcleo lento.
- Acción: igualar captura y velocidad de teclado sí o sí. → `odd/tasks/007-omnipresent-capture.md`

### Vs Motion / Reclaim / Sunsama (la capa inteligente)

- Ordo tiene piezas sueltas (`optimal-schedule`, smart notifications, focus) pero no el sistema: sin Do Date vs Due Date, sin replanificación automática, sin ritual guiado, sin defensa de calendario.
- Acción: auto-scheduling + ritual diario como sistema, no como endpoints sueltos. → `odd/tasks/005-auto-scheduling.md`, `odd/tasks/006-daily-ritual.md`

## Gaps que Ordo debe cerrar

Ordenados por daño competitivo (mayor → menor):

1. **Integraciones reales** — calendario bidireccional, Slack, GitHub. Hoy son enums sin código. Sin esto no se compite con Todoist/Asana.
2. **Captura y velocidad** — Quick Add con lenguaje natural de primera, `Cmd/Ctrl+K` unificado, atajos consistentes.
3. **Conectividad agéntica** — MCP + API pública + webhooks. Sin esto Ordo es invisible para Claude/ChatGPT/Hermes/OpenClaw.
4. **Sistema inteligente** — auto-scheduling, ritual diario, defensa de calendario (piezas → sistema).
5. **Confianza** — política de datos clara, SSO/SAML, facturación real, marketing honesto.

## Diferenciadores a proteger

Lo que ningún competidor une en un solo producto y Ordo ya tiene:

1. **Bienestar/productividad sostenible** — detección de burnout, intervenciones, smart notifications, perfiles de energía. El ángulo más defendible.
2. **Amplitud coherente** — tareas + proyectos + hábitos + OKRs + pomodoro + gamificación + coach IA + reuniones en un solo backend y tres plataformas nativas.
3. **Tres plataformas serias** — PWA con offline real, desktop Tauri liviano con timer flotante, móvil nativo (no un envoltorio web).
4. **Colaboración con contexto** — workload de equipo, presencia realtime, audit logs por workspace.

Regla: ninguna feature nueva puede debilitar estos cuatro. Toda propuesta debe decir cuál refuerza.

## 📚 Referencias

- [product-vision.md](./product-vision.md) · [agent-first-strategy.md](./agent-first-strategy.md)
- [Roadmap](../planning/roadmap.md) · [Tareas ODD](../../odd/tasks/)
