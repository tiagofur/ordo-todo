# Puente Zapier (técnico, temporal)

> **Última actualización**: 2026-10-19
> **Estado**: 🚧 En desarrollo (ODD 002-T4/S4)

Hasta que ODD 003 publique integraciones propias, Zapier actúa como
puente: Zaps existentes disparan acciones en Ordo vía su API pública,
y Ordo emite eventos vía webhooks que Zapier consume. Espejo técnico
de la guía de usuario `/guide/connect/zapier`.

Check S4: guía probada con cuenta Zapier de test (registrar fecha +
resultado en el ODD `## Log`).

## Dirección Zapier → Ordo

Zap con acción HTTP o app Ordo (cuando exista en ODD 003):

- Crear tarea: `POST https://ordotodo.app/v1/tasks` con
  `Authorization: Bearer ordo_pat_...` (PAT del usuario, scope
  `tasks:write`).
- Completar tarea: `PATCH https://ordotodo.app/v1/tasks/:id`
  con `{"status": "COMPLETED"}`.

Contratos completos en `docs/reference/api-reference.md`.

## Dirección Ordo → Zapier

1. Crear suscripción webhook: `POST /v1/webhooks` con
   `{"url": "<catch-hook-zapier>", "events": ["task.created", ...]}`.
2. Zapier Catch Hook recibe `POST` firmado (`ordo-signature` /
   `ordo-timestamp`, HMAC-SHA256).
3. Verificar firma con el secreto (mostrado una sola vez al crear).

Eventos disponibles hoy: `task.created`, `task.updated`,
`task.completed`, `task.deleted`, `project.created`,
`project.updated`, `comment.created`.

## Ejemplo canónico

Disparador `Gmail → Nuevo email importante` ⇒ acción
`Ordo → Crear tarea` con título `{{asunto}}` en proyecto
"Bandeja de entrada". Es el ejemplo de la guía de usuario y el caso
de prueba S4.

## Retirada

Cuando ODD 003 publique la app Zapier propia, este puente se marca
deprecated y las guías apuntan al flujo nativo. No borrar: los Zaps
existentes de usuarios siguen funcionando sobre `/v1` + webhooks.

## 📚 Referencias

- Guía usuario: `/guide/connect/zapier`
- `docs/reference/api-reference.md` (endpoints, firma webhooks)
