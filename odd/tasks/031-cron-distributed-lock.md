# ODD 031 — Lock distribuido de crons (follow-up 027 T7)

Objetivo: que el anti-solape de ticks funcione con N réplicas, no solo
en una instancia. Sin Redis todo queda EXACTAMENTE igual que hoy
(in-memory por instancia); cuando Redis conecta, el mismo decorador
adquiere el lock distribuido automáticamente. Sin fallo cerrado: si
Redis falla a mitad, se avisa por log y el tick corre (fail-open, como hoy).

Diseño:
- `scheduling/distributed-lock.ts`: backend pluggable (undefined =
  solo in-memory local), `InMemory` no se usa como backend (el path sin
  Redis es el código previo intacto), `RedisCronLockBackend` con
  `SET key val NX PX` atómico + release.
- `SkipOnOverlap(cronKey, skipValue?, opts?: { ttlMs? })`: TTL default
  15 min (cubre el sweep más largo; un crash salta como mucho un ciclo).
  Orden: chequeo in-memory por instancia (igual que hoy) → acquire
  distribuido → skip si otro la tiene → release en finally si adquirió.
- `RedisService`: bindea el backend al conectar, lo suelta al destruir.
  Sin cambios de env: REDIS_URL/REDIS_ENABLED como hoy.

Runner: `NODE_OPTIONS=--experimental-vm-modules npx jest --config
package.json --rootDir src "cron-batch|distributed-lock"` + tsc.

## Specs

S1: "Sin Redis bindeado, el decorador se comporta byte a byte como hoy
(tests existentes en verde sin tocar)". S2: "Con backend fake bindeado:
el segundo tick concurrente (otra instancia, misma key) saltea; al
liberar, el siguiente corre; TTL y release se propagan al cliente".
S3: "RedisBackend: tryAcquire true→false→(release)→true con cliente
fake de semántica NX".

## Tasks

- [x] T1 (S1-S3): backend + decorador + bind + specs. Estado: done
  (RED en decorador cross-instance, GREEN tras el cambio; backend 4/4,
  decorator 2 nuevas + 7 existentes intactas; suite completa 1608 verde,
  tsc limpio, 0 errores eslint en tocados). Sin Redis todo idéntico a
  hoy; con Redis los 12 ticks (incl. executeJob por jobId) deduplican
  entre réplicas con TTL 15 min y fail-open.

## Log

L1: "seguimos" (2026-11-03). Se hace el lock distribuido diferido en
027 por "requerir Redis obligatorio": con fail-open y sin env nuevas,
Redis deja de ser obligatorio.
