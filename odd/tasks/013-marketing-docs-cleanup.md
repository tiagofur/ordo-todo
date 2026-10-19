# ODD: Limpieza marketing/docs — cero promesas falsas

Objective: que marketing, docs y código digan lo mismo — retirar o marcar como visión todo lo ❌/⚠️ de la auditoría, sin romper builds ni i18n.
Branch: `docs/marketing-docs-cleanup` (sugerida; el padre es dueño de git)
Delivery strategy: work-unit commits por superficie (webpage → seeds → READMEs → locales); PRs ≤300 líneas ideal; cada commit verificable con grep + build.
Test runner: n/a (contenido). Verificación = greps a cero + builds verdes + revisión humana final.

## Context (leer primero — presupuesto: estos paths, nada más)

- `docs/vision/promises-audit.md` (completo — cada S# cita su sección; es la spec)
- `docs/vision/product-vision.md` (decisiones cerradas 1–4)
- `apps/webpage/src/components/hero.tsx`, `features.tsx` (narrativa creators hardcodeada)
- `apps/webpage/src/messages/es.json`, `en.json`, `pt-br.json` (E2E, precios, testimonios)
- `apps/webpage/src/app/[locale]/pricing/page.tsx` (tabla pública)
- `packages/db/prisma/seed-*.sql`, `seed-marketing.ts`, `seed.ts` (changelog/FAQ/roadmap ficticios)
- `README.md` (links rotos, versión, Astro erróneo)

## Specs

S1. **Narrativa única**: `hero.tsx` + `features.tsx` dejan de vender Creators OS como presente — se reescriben a productividad general (usar `messages/*.json`, eliminar `Overriding translations`) o se marcan explícitamente "Visión / No disponible". Check: `grep -ri 'creator' apps/webpage/src/components/hero.tsx apps/webpage/src/components/features.tsx` → vacío o solo marcas de visión.
S2. **Spec creators marcada**: `docs/features/content-pipeline.md` lleva header "VISIÓN — no implementado" con link al roadmap; sus 5 docs linkeados inexistentes se listan como pendientes (no se crean aquí). Check: header presente + 0 links que finjan existir.
S3. **Fork o nada**: `README.md` aclara el estado del fork `ordo-todo-creators` (propuesta, no ejecutado) o elimina la mención. Check: 1 sola afirmación, honesta.
S4. **Precios honestos**: `pricing/page.tsx` + `messages` + seeds FAQ = 1 sola tabla marcada "beta / sujeto a cambio"; fuera: garantías de 30 días, métodos de pago específicos, límites enforced y SSO/API/Enterprise como disponibles (pasan a "roadmap"). Check: `grep -rn '\$12/user\|SSO/SAML' apps/webpage/src/app/[locale]/pricing/` → vacío; marca beta presente.
S5. **Seguridad honesta**: quitar "End-to-end encryption"/"Encriptación de extremo a extremo" de `messages/*.json`; quitar AES-256/SOC 2/TLS-1.3-garantizado/bank-level de seeds FAQ; sustituir por lo real (JWT, OAuth, TLS, audit — ver auditoría §C) + nota "política completa en 008". Check: `grep -rni 'end-to-end\|extremo a extremo\|AES-256\|SOC 2' apps/webpage/src/messages/ packages/db/prisma/seed-*` → vacío.
S6. **Privacidad IA honesta**: `AIFeatures.ai_statement` aclara que el motor usa Gemini externo (opt-in/out en settings ya existe); sin "respeta privacidad" en seco. Check: texto menciona proveedor + control del usuario.
S7. **Versión única**: `README.md`, `apps/desktop/CHANGELOG.md`, PRD y seeds cuentan la misma versión/estado; seeds de changelog ficticios (v2.x dic-2024, "3x listas", "two-way fix") eliminados o marcados demo. Check: 1 sola versión pública; `grep -rni 'two-way fix\|3x' packages/db/prisma/seed-*` → vacío.
S8. **Offline/sync honesto**: web/desktop/móvil documentan su estado real (auditoría §E) donde hoy dicen "real-time sync"/"offline-first" genérico; README mobile y webpage dejan de ser boilerplate (mínimo: qué es, estado, links). Check: 0 "real-time sync" genérico; READMEs con contenido real.
S9. **Matriz de paridad**: crear `docs/guides/platform-parity.md` (web/desktop/móvil × features clave: captura, offline, push, ritual, etc.) con ✅/⚠️/❌ honestos; linkeada desde `docs/README.md`. Check: cada ❌/⚠️ enlaza a su ODD doc o roadmap.
S10. **Prueba social**: fuera "2,500+", "miles", testimonios con nombres genéricos — salvo datos verificados aportados por negocio (si no hay, T correspondiente deja placeholders claramente marcados, no texto inventado). Verificar dominios (`ordo-todo.com`, `ordotodo.app`) y `support@ordo-todo.com`; lo no verificado se retira. Check: `grep -rni '2,500\|María García\|Carlos Ruiz\|Ana Martínez' apps/webpage/src/` → vacío.
S11. **Links y atajos**: reparar links rotos del `README.md` (USER_GUIDE, ARCHITECTURE, ROADMAP, COMPONENT_GUIDELINES, PROJECT_ORGANIZATION, Astro→Next.js); unificar atajos a los reales (ver 007-S4; hasta que 007 aterrice, documentar los que el código tiene hoy); P1–P4 → `LOW/MEDIUM/HIGH/URGENT`. Check: script de links sin 404 internos; `grep -rn 'P1\b' apps/webpage/src/messages/` → vacío.
S12. **Lo existente, publicitado**: landing + guía incluyen lo que existe y no se vende (auditoría §I: meetings IA con input manual declarado, workload, wellbeing, smart search, chat coach, gamificación, focus audio). Sin inflar: cada claim con link a la guía. Check: 7 bloques nuevos con links funcionando.

Fuera de alcance: implementar features (eso vive en 001–012), rediseño visual, SEO.

## Allowed edit surfaces

- `apps/webpage/src/components/hero.tsx`, `features.tsx` (+ `messages/*.json` solo claves tocadas)
- `apps/webpage/src/app/[locale]/pricing/page.tsx`, `faq/`, `changelog/`, `roadmap/`, `guide/`
- `packages/db/prisma/seed-*.sql`, `seed-marketing.ts`, `seed.ts` (limpieza contenido demo)
- `README.md`, `apps/mobile/README.md`, `apps/webpage/README.md`
- `docs/features/content-pipeline.md` (solo header de visión)
- `docs/guides/platform-parity.md` (nuevo), `docs/README.md` (solo link a paridad)

## Verification

- Todos los greps de S1–S12 → vacíos (evidencia: comando + salida por cada uno)
- `cd apps/webpage && npm run build` → verde (3 locales)
- `cd apps/web && npx vitest run` (si se tocaron locales compartidos) → verde
- Revisión humana final contra `promises-audit.md` checklist (8/8)
- Gates raíz (padre): `npm run lint`

## Tasks

| ID | Cubre | Unidad | Ruta sugerida | Estado | Evidencia |
|---|---|---|---|---|---|
| T1 | S1–S3 | Narrativa única (hero/features/README/fork) | delegada | pending | — |
| T2 | S4–S6 | Precios + seguridad + privacidad IA honestos | delegada | pending | — |
| T3 | S7–S8 | Versión única + seeds limpios + offline honesto + READMEs | delegada | pending | — |
| T4 | S9 | `platform-parity.md` + link en índice | inline | pending | — |
| T5 | S10 | Prueba social + dominios/email verificados | inline | pending | — |
| T6 | S11 | Links README + atajos + prioridades | inline | pending | — |
| T7 | S12 | Publicitar lo existente (7 bloques + guías) | delegada | pending | — |

## Log

L1. "documenta TODO lo que vimos... damos una mejorada y corregida en nuestra documentacion, tomando en cuenta lo que ya tenemos como 'promesa' de que tendremos en la app, cosas que viste nuevas" (mensaje del usuario 2026-10-18; este doc ejecuta la auditoría promises-audit.md).
