# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Evaluadores** (primarios): profesionales y equipos que comparan herramientas de productividad. Llegan a la landing y a pricing, deciden en minutos si prueban Ordo.
- **Usuarios actuales** (secundarios): necesitan ayuda para usar lo que ya tienen — soporte, tutoriales, FAQ.

## Product Purpose

Ordo Todo es la app de productividad todo-en-uno que une ejecución (tareas, proyectos, calendario, tiempo) con persona completa (hábitos, foco, bienestar) y se deja operar por agentes externos (MCP + API). Este sitio público convierte evaluadores en usuarios y ayuda a los usuarios sin pasar por soporte. Éxito: el evaluador se registra o conecta su agente sin fricción; el usuario resuelve sus dudas solo.

## Positioning

El único todo-en-uno que une ejecución con persona completa, conectable con un clic a los agentes que el usuario ya usa. (Ver `docs/vision/product-vision.md`.)

## Operating Context

- Next.js + next-intl con 3 locales obligatorios: EN/ES/PT-BR.
- Backend con CMS real: blog, changelog, roadmap, faq, knowledge-base, newsletter, contact.
- Precios en beta hasta que el billing sea real (issue #240); lo futuro se marca visión o no se publica.

## Capabilities and Constraints

Existe hoy: `/`, `/pricing`, `/guide` + 21 tutoriales (oct 2026: +7 guías de pantallas — workspaces, goals, notes, eisenhower, meetings, coach, wellbeing), `/faq`, `/blog`, `/changelog`, `/roadmap`, `/about`, `/contact`, `/privacy`, `/terms`, admin del blog.

Restricciones:

- Toda afirmación verificable contra `main`, o marcada beta/visión. Sin E2E/SOC2/AES-256.
- i18n completa en los 3 locales para cada página nueva o renovada.
- Solo superficies `apps/webpage/` (+ este archivo y la fila del roadmap).

Abierto: dominios productivos; método de construcción por defecto sin registrar (code-first esta sesión, no almacenado).

## Brand Commitments

Observado en código (se preserva salvo que el usuario lo cambie): nombre "Ordo Todo"; primario cyan `#06B6D4` con acentos por sección; logo Sparkles; tarjetas `rounded-2xl`; animaciones framer-motion; tono claro y directo en 3 idiomas.

## Evidence on Hand

- Capturas del dashboard: `apps/webpage/public/images/guide/*.png`.
- Módulos CMS del backend (`apps/backend/src/blog|changelog|roadmap|faq|knowledge-base|newsletter|contact/`).
- Mensajes trilingües: `apps/webpage/src/messages/*.json`.
- Ausencias que no se deben fabricar: testimonios reales, métricas de usuarios, uptime, integraciones 1-click no implementadas.

## Product Principles

1. Honestidad radical: solo lo que existe en `main`, o marcado beta/visión.
2. Evaluador primero: entender, probar y pagar sin fricción.
3. Trilingüe real desde el primer día, nunca traducido después.
4. Extender el sistema visual existente, no rediseñar.
