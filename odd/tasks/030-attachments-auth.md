# ODD 030 — Descarga de adjuntos con auth (follow-up 027 S2)

Objetivo: cerrar `/uploads/` público. Hoy `main.ts` sirve `./uploads`
estático sin auth (solo obscuridad de nombres) y el web además sube a su
propio `public/uploads` vía `app/api/upload/route.ts`. Estrategia en
fases para no romper clientes a mitad de camino.

Fases:
- T1 (backend, esta sesión): `GET /attachments/:id/download` con el
  `AttachmentGuard` existente (misma membresía que los metadatos),
  streaming con content-type/disposition, 404 si falta el archivo.
  El estático sigue encendido.
- T2 (agente frontend, handoff con prompt): el web sube por el backend
  y renderiza vía el endpoint con credenciales; elimina su route
  `app/api/upload` y `public/uploads`.
- T3 (backend, tras confirmación de T2): apagar `useStaticAssets` de
  uploads en `main.ts`. Cambio de comportamiento intencional: los links
  externos `/uploads/x` viejos mueren (ese era el leak); los archivos
  siguen sirviéndose por el endpoint guardado (resuelve el mismo
  `storagePath`).

Runner: `NODE_OPTIONS=--experimental-vm-modules npx jest --config
package.json --rootDir src attachments` + tsc.

## Specs

S1: "Descarga guardada: GET /attachments/:id/download exige el mismo
AttachmentGuard que GET :id; resuelve el archivo desde `storagePath`
con basename (sin traversal); 404 si el adjunto o el archivo faltan;
content-type del mimeType guardado y disposition attachment".
S2: "Handoff frontend: prompt con las URLs a migrar y el criterio de
aceptación (sin referencias a /uploads/ en el web)".

## Tasks

- [x] T1 (S1): endpoint + servicio + specs. Estado: done (service 22/22
  con 4 tests RED→GREEN, controller download 2/2, suite completa 1600
  verde, tsc limpio, 0 errores nuevos eslint — 1 prettier preexistente
  verificado en HEAD en el mock de PlanLimitsService).
- [x] T2 (S2): prompt de handoff para el agente frontend (entregado al
  owner en el chat; el web migra subidas y render a URLs del backend,
  elimina su route y public/uploads).
- [ ] T3: apagar estático (tras T2 confirmado, en otra sesión).

## Log

L1: "hagamos todo cordinado con frontend" (2026-11-02). Alcance completo
en fases; T1+T2 en esta sesión, T3 espera al frontend.
