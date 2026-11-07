# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Stack

Dos apps nativas puras que reemplazan a largo plazo la app Tauri actual (`apps/mobile`, ODD 020 — "el móvil ES la desktop responsiva", descartada como enfoque):

- **iOS**: SwiftUI (`apps/native/ios`)
- **Android**: Jetpack Compose (`apps/native/android`)

Decisión del owner (06-nov-2026). No comparten lógica TS con el monorepo: hablan con la API NestJS existente (`/api/v1`), igual que web/desktop. Estructura de directorios propuesta, ajustable. **Orden: Android primero**, iOS después (owner, 06-nov-2026). Plan de ejecución en `odd/tasks/050-native-mobile-apps.md`.

## Users

- **Profesionales y equipos** (mismo público primario que la web), en movimiento: entre reuniones, en transporte, lejos del escritorio. Sesiones de 10–60 segundos, casi siempre con una mano. Llegan a capturar algo antes de olvidarlo, a decidir qué sigue, a correr un Pomodoro o a marcar un hábito.
- **Usuarios sin escritorio a mano**: el teléfono es su única ventana a Ordo en ese momento; los módulos pesados deben remitir honestamente a web/desktop.

## Product Purpose

La app móvil nativa es el **complemento del día** de Ordo Todo: capturar en <10 s, ejecutar la vista Hoy, correr el timer Pomodoro con alarmas fiables del sistema, marcar hábitos y recibir notificaciones. El móvil no es un escritorio en miniatura (lección aprendida de la app actual); los módulos pesados (Kanban, OKRs, reports, reuniones) se quedan en web/desktop.

Éxito: capturar desde la intención en <10 s; llevar el día a término sin abrir el escritorio; el timer suena siempre aunque la app esté cerrada; en iOS se siente una app de iOS y en Android una app de Android.

## Positioning

Heredado del producto (ver `apps/web/PRODUCT.md`): el todo-en-uno que une ejecución con persona completa. El ángulo móvil: el companion sereno de bolsillo — captura instantánea y ejecución del día con sensación nativa por SO, cosa que ni Todoist ni Motion logran con sus apps multiplataforma de piel única.

## Operating Context

- Backend NestJS compartido con web/desktop (producción estable en VPS); auth email + OAuth Google/GitHub con JWT; deep link `ordo://` ya registrado en Android.
- i18n EN/ES/PT-BR desde el día uno, sin textos en duro.
- Modo oscuro de primera clase en ambos SO.
- Notificaciones: hoy solo locales (no existe infra de push en el backend — no fabricarla).
- Convive durante la transición con `apps/mobile` (Tauri), que se mantiene con arreglos críticos hasta que la nativa Android llegue a v1 y después se retira (owner, 06-nov-2026).

## Capabilities and Constraints

Alcance v1 confirmado (entrevista 06-nov-2026, "complemento del día"):

- Captura rápida de tareas (parse de lenguaje natural del backend si procede)
- Vista Hoy: las tareas del día
- Tareas: lista, detalle, crear/editar, completar, subtareas básicas
- Timer Pomodoro/continuo con alarma del sistema (exacta en Android)
- Hábitos: check-in del día y rachas visibles
- Notificaciones locales inteligentes (vencimientos, planning diario)

Fuera de v1: Kanban, OKRs, reports, reuniones, notas, gestión de workspaces, coach IA / chat IA, vista de calendario completa (los bloques de tiempo sí viven dentro de Hoy). Lo excluido enlaza a web/desktop honestamente.

Funciona sin conexión desde v1 (owner, 06-nov-2026): copia local + cola de cambios para ver el día, completar, capturar y marcar hábitos; sincroniza al volver la red.

Restricciones durables:

- **Honestidad radical**: sin push inventada, sin integraciones presentadas como reales (hoy son stub), sin "próximamente" muertos.
- Trilingüe día uno.
- Los agentes (MCP) no se superficiean en móvil v1.

## Brand Commitments

- Nombre **Ordo Todo**; BrandMark cuadrado morado `#AD46FF` con radio generoso e icono CheckSquare blanco (íconos de app).
- Violeta semántico `#7C3AED` (claro) / `#A78BFA` (oscuro) como voz de acción in-app; `#AD46FF` solo identidad, nunca botón.
- Firma de color por sección (tareas violeta, hábitos verde, calendario azul…) como sistema de reconocimiento.
- **Diseño adaptativo pleno** (owner, 06-nov-2026): iOS habla HIG (Dynamic Type, large titles, sheets, SF Symbols), Android habla Material 3 (color roles, FAB, navegación Material, Dynamic Color evaluado); la marca vive en color, firmas y contenido. **Tipografía** (owner, 06-nov-2026): fuentes del sistema (SF Pro / Roboto) en todo el texto, con Dynamic Type / escala de fuente; Inter solo en numerales de display (timer, progreso, rachas).

## Evidence on Hand

- `apps/web/PRODUCT.md` (registro del producto completo) y `apps/web/DESIGN.md` ("El cockpit sereno") — el mundo visual establecido.
- `.impeccable/critique/` — 35+ auditorías UX de las superficies web reales.
- `odd/tasks/020-mobile-tauri.md` — historia y lecciones de la app actual.
- Backend vivo en producción; apps hermanas web/desktop/móvil operando contra él.

## Product Principles

1. **El móvil no es un escritorio pequeño**: cada pantalla nace del uso real de bolsillo, no de adaptar la desktop.
2. **Capturar en segundos** desde cualquier contexto del sistema.
3. **Nativo por SO**: cada app respeta los patrones de su plataforma; cero "piel única multiplataforma".
4. **Serenidad**: el cockpit sereno también cabe en un teléfono — menos ruido, no menos potencia.
5. **Paridad honesta**: lo que no vive en móvil enlaza a donde sí vive.

## Accessibility & Inclusion

- Dynamic Type (iOS) y font scale (Android) desde el día uno — nada de tamaños fijos.
- VoiceOver/TalkBack en los flujos principales; contraste AA mínimo.
- Reduce Motion (iOS) y Remove animations (Android) respetados.
