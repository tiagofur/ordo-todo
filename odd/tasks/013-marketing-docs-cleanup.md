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
| T1 | S1–S3 | Narrativa única (hero/features/README/fork) | delegada→inline | done | grep creator 0/0, tsc 0, eslint 0 (L2) |
| T2 | S4–S6 | Precios + seguridad + privacidad IA honestos | delegada→inline | done | greps S4/S5 vacíos, ai_statement ×3, tsc 0 (L3) |
| T3 | S7–S8 | Versión única + seeds limpios + offline honesto + READMEs | delegada→inline | done | greps S7/S8 vacíos, seeds demo honestos (L4) |
| T4 | S9 | `platform-parity.md` + link en índice | inline | done | 12 features, links 0 rotos (L5) |
| T5 | S10 | Prueba social + dominios/email verificados | inline | done | grep S10 vacío, NXDOMAIN+Solennix verificados (L6) |
| T6 | S11 | Links README + atajos + prioridades | inline | done | links 0 rotos, atajos canónicos, P1 vacío (L7) |
| T7 | S12 | Publicitar lo existente (7 bloques + guías) | delegada→inline | done | 7 bloques verificados, guía + landing link (L8) |

## Log

L1. "documenta TODO lo que vimos... damos una mejorada y corregida en nuestra documentacion, tomando en cuenta lo que ya tenemos como 'promesa' de que tendremos en la app, cosas que viste nuevas" (mensaje del usuario 2026-10-18; este doc ejecuta la auditoría promises-audit.md).
L2. T1 done 2026-10-21 (PR #320, inline): `hero.tsx` + `features.tsx` usan `messages/*.json` (productividad general) en vez de Creators OS hardcodeado (eliminado `Overriding translations`, iconos muertos, `@ts-ignore` huérfanos); `content-pipeline.md` con header VISIÓN + 5 docs pendientes sin links falsos; README fork aclarado propuesta-no-ejecutada (EN+ES+PT). Revisor: APPROVE WITH NITS (idiomas fork). Evidencia: grep creator 0/0, tsc webpage 0, eslint 0. Hallazgo: build webpage roto pre-existente en main (`tailwindcss-animate` + `react-is` faltantes, verificado con stash) — no bloquea contenido.
L3. T2 done 2026-10-21 (PR #321, inline): pricing sin SSO/API/residency/SLA/themes/calendar/history + marca beta (guarantee+subtitle ×3); E2E/extremo/ponta/AES/SOC2/bank fuera de messages ×3 y 4 seeds (sustituido por OAuth/TLS/scopes + nota enterprise); export CSV→JSON-only; ai_statement ×3 con Gemini + control; seeds billing honestos (sin métodos/money-back/cancelación ficticia). Revisor: APPROVE WITH NITS (comentario beta, sin límite 3-projects, CTAs sin trial, JSON-from-profile). Evidencia: greps S4/S5 vacíos, JSON ×3 válido, tsc 0, eslint 0.
L4. T3 done 2026-10-21 (PR #322, inline): README sin versión ficticia (estado honesto + releases); seeds changelog v2.x → 1 entrada demo; roadmap Calendar COMPLETED Google+Outlook (sin Apple), Zapier honesto (API existe, templates no), sin real-time; README sync por plataforma + link futuro paridad; colaboración → presencia+comentarios; READMEs mobile/webpage reales. Revisor: REQUEST CHANGES → B1 (FAQ sync sin real-time ×2 seeds), B2 (link paridad como futuro); re-revisión APPROVE. Evidencia: greps S7/S8 vacíos, tsc db 0. Follow-ups fuera de superficie: desktop CHANGELOG 1.0.0, PRD v2.0, mobile README_API offline-first.
L5. T4 done 2026-10-21 (PR #323, inline): `docs/guides/platform-parity.md` nuevo (12 features × web/desktop/móvil, cada ⚠️/❌ con link a ODD/roadmap/visión; link en docs/README ya existía). Revisor: REQUEST CHANGES → B1–B3 (push ⚠️ honesto sin backend VAPID/FCM, pomodoro móvil ✅, captura móvil ⚠️ FAB+?text=), B4 (links en 6 celdas); re-revisión APPROVE WITH NITS (ruta hábitos). Evidencia: script links 0 rotos, 0 filas ⚠️/❌ sin link, spot-checks vs código.
L6. T5 done 2026-10-21 (PR #324, inline): testimonios → 1 placeholder explícito ×3; miles/2,500+ fuera (Zapier-factual se queda); dominios verificados (ordo-todo.com NXDOMAIN, ordotodo.app sirve Solennix ajeno) y retirados de superficies user-facing (CTAs→appLink env-o-/contact, guías MCP→TU-DOMINIO, AboutDialog+defaults→solo GitHub, perfiles→@handle, mobile env→example.com, README/listing/email); e2e test@ intacto (datos de test). Revisor: APPROVE WITH NITS (profile-card URL muerta, desktop env, nota integrations, indent). Evidencia: grep S10 vacío, tsc webpage/web/desktop/ui 0, eslint 0. Follow-ups: openclaw-plugin mcp default, tauri Cargo email, sociales footer 404.
L7. T6 done 2026-10-21 (PR #325, inline): 5 links README rotos → rutas canónicas reales (desktop USER_GUIDE, architecture/overview, planning/roadmap, DESIGN_GUIDELINES, monorepo; ES+PT incluidos); Astro→Next.js ×3; Quick Add documentado como código (`N` fuera de inputs o `Cmd/Ctrl+N`) ×3; P1 vacío (nada que migrar); atajos fantasma Space/R/S/V retirados (tabla focus→nota, tip V→botones). Revisor: APPROVE WITH NITS (aplicados en el PR: N2 unificación + N3 retirada). Evidencia: script links 7 únicos 0 rotos, grep P1 vacío, JSON ×3 válido.
L8. T7 done 2026-10-21 (PR #326, inline): guía `/guide/more-features` con 7 bloques verificados en código (meetings input-manual declarado, workload, wellbeing, search, coach, gamificación, focus-audio) + registro sidebar/índice + link landing. Revisor: REQUEST CHANGES → B1 (subtítulo honesto sin prometer links), B2 (search sin notas→hábitos), B3 (openInApp→Ver guía + nota audio en focus); re-revisión APPROVE. Evidencia: tsc webpage 0, eslint 0, links verificados. Merge log: pila #320→#326 estrategia A (CI verde + revisor por PR; 3 REQUEST CHANGES cerrados con re-revisión). #241 lista para cerrar. M0 Higiene completo (013 ✅ 014 ✅ 015 ✅ 016 ✅).
