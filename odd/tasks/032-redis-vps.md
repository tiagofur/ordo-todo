# ODD 032 — Redis obligatorio en el VPS (activa 031)

Objetivo: encender Redis en producción para activar lo ya implementado:
caché compartida, blacklist global, locks distribuidos de cron (031) y
pub/sub. Alcance: solo `deploy/docker-compose.plesk.yml` (+ ejemplo de
env). Sin código de app.

Cambios:
- Servicio `redis` (redis:7-alpine, sin puertos publicados, AOF +
  volumen `redis_data`, `volatile-lru` 256 MB — solo se desaloja lo que
  tiene TTL, como la blacklist —, healthcheck, backend lo espera
  healthy).
- Defaults del compose: `REDIS_ENABLED=true`,
  `REDIS_URL=redis://redis:6379` (el `.env` del VPS los puede
  sobreescribir; si no los tiene, igual funciona).
- `.env.plesk.example` actualizado a los mismos valores.

Runner: `docker compose -f deploy/docker-compose.plesk.yml config`
(interpolación OK). El deploy real lo valida el workflow en el VPS.

## Specs

S1: "El compose del VPS levanta redis healthy antes que el backend, sin
puertos publicados y con persistencia AOF; los defaults activan Redis
aunque el .env no traiga las keys".

## Tasks

- [x] T1 (S1): servicio redis + env example + validación de config.

## Log

L1: "hagamos" (2026-11-03) tras explicar qué da Redis. Faltaba solo
infra: el código (031) ya estaba listo y en main.
