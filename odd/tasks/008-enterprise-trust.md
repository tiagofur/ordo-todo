# ODD: Confianza enterprise (SSO, política de datos, admin)

Objective: vender a empresas sin miedo — SSO/SAML, política de datos honesta y verificable, controles de admin sobre integraciones y agentes, audit exportable.
Branch: `feature/enterprise-trust` (sugerida; el padre es dueño de git)
Delivery strategy: work-unit commits; PRs ≤300 líneas ideal; política primero (docs), luego SSO, luego controles; cobertura ≥70%.
Test runner: Jest (backend).

## Context (leer primero — presupuesto: estos paths, nada más)

- `docs/vision/agent-first-strategy.md` (sección "Modelo de permisos y confianza")
- `docs/vision/promises-audit.md` (§C seguridad, §B Team/Enterprise)
- `apps/backend/src/auth/` (OAuth Google/GitHub actual — base del SSO)
- `apps/backend/src/workspaces/` (roles OWNER/ADMIN/MEMBER/VIEWER, audit log)
- `odd/tasks/009-public-api-webhooks.md` (leer hasta `## Log` — tokens/OAuth a gobernar)
- `odd/tasks/001-mcp-server.md` (leer hasta `## Log` — grants MCP a gobernar)

## Specs

S1. **SSO/SAML**: login empresarial vía SAML 2.0 (mínimo: 1 IdP genérico + Okta/M365 documentados) + SCIM básico o provisioning JIT; mapeo de grupos → roles de workspace; coexiste con OAuth social sin romperlo. Check: login round-trip contra IdP de test (stub SAML) → usuario provisionado con rol correcto.
S2. **Política de datos pública y honesta**: documento versionado — qué datos van a qué proveedor (Gemini hoy), retención por tipo de dato, no-entrenamiento exigible contractualmente, borrado (cuenta + gracia definida), residencia (dónde están hoy los datos, sin inventar). Debe contradecir en cero puntos a `promises-audit.md`. Check: revisión humana punto por punto contra código + infra real.
S3. **Controles de admin sobre agentes/integraciones**: por workspace — permitir/bloquear conectores (MCP/OAuth apps), revocar grants de miembros, definir scopes máximos, ver audit log de acciones de agentes. Check: admin bloquea "OpenClaw" → nuevas conexiones denegadas + existentes revocables en 1 clic.
S4. **Audit exportable**: export CSV/JSON del audit log del workspace (acciones humanas y de agentes diferenciadas) + retención configurable. Check: export con 10k eventos → archivo válido en <30s.
S5. **Permisos granulares a nivel proyecto**: extender roles de workspace con overrides por proyecto (ver/comentar/editar/admin); el MCP y la API `/v1` los respetan (test de conformidad cruzado con 001-S4). Check: miembro con "ver" en proyecto P → `PATCH /v1` y tool MCP → 403.
S6. **DPA + seguridad base**: DPA estándar publicado; checklist interno de hardening (secretos, headers, rate limits, backups verificados) ejecutado y evidenciado; roadmap visible SOC 2 Tipo II (sin afirmar certificación). Check: DPA publicado + checklist firmado con evidencia por ítem.

Fuera de alcance: facturación (012), E2E (no-meta hasta re-evaluación explícita), data residency multi-región (futuro).

## Allowed edit surfaces

- `apps/backend/src/auth/` (SSO/SAML + provisioning; sin romper OAuth actual)
- `apps/backend/src/workspaces/` (roles por proyecto + controles admin + export audit)
- `apps/backend/src/audit/` (nuevo módulo si el audit actual no basta, si no extender existente)
- `packages/db/prisma/schema.prisma` (+ migraciones: SSO config, grants admin, roles proyecto)
- `apps/web/src/` (UI admin mínima: conectores, miembros, audit, export)
- `apps/webpage/src/app/[locale]/` (páginas: política de datos, DPA, seguridad)
- `packages/i18n/src/locales/*.json` (solo claves admin/seguridad)

## Verification

- `cd apps/backend && npx jest src/auth src/workspaces src/audit --runInBand` → verde
- `cd apps/backend && npx tsc --noEmit -p tsconfig.build.json` → 0 errores
- Conformidad cruzada: suites de 001 (permisos MCP) y 009 (scopes) siguen verdes
- Gates raíz (padre): `npm run lint`, `npm run check-types`, `npm run test`

## Tasks

| ID | Cubre | Unidad | Ruta sugerida | Estado | Evidencia |
|---|---|---|---|---|---|
| T1 | S2+S6 | Política de datos + DPA + checklist hardening | inline | pending | — |
| T2 | S1 | SSO/SAML + provisioning JIT + mapeo roles | delegada | pending | — |
| T3 | S3 | Controles admin de conectores/agentes | delegada | pending | — |
| T4 | S4–S5 | Audit exportable + roles por proyecto + conformidad MCP/API | delegada | pending | — |

## Log

L1. "quiero que seamos la mejor de lejos" + corrección de promesas falsas de seguridad (E2E/SOC2) auditadas el 2026-10-18 (este doc cubre confianza enterprise real en lugar de afirmaciones).
