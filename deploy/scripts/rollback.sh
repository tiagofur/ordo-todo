#!/usr/bin/env bash
# =============================================================================
# Rollback de backend + web a una imagen anterior (etiquetada por SHA de commit).
#
#   ./scripts/rollback.sh <sha>        p. ej. ./scripts/rollback.sh 9152a2ee…
#
# - Desde 26-oct-2026 el deploy borra TODAS las imágenes de Ordo sin uso
#   (política 0 imágenes sin uso): si el SHA no está ya en el servidor, este
#   script necesita acceso a GHCR (docker login con un PAT read:packages).
#   Alternativa sin GHCR: Actions → Deploy → Run workflow sobre el commit
#   anterior (reconstruye y redespliega; el histórico vive en GHCR).
# - NO deshace migraciones de base de datos. Si la versión anterior no es
#   compatible con el schema actual, restaura antes un backup (ver RUNBOOK).
# - Alternativa sin tocar el servidor: Actions → Deploy → Run workflow sobre
#   el commit anterior.
# =============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."
tag=${1:?uso: rollback.sh <image-tag|sha>}

export IMAGE_TAG="$tag"
echo "[$(date)] Volviendo backend+web a ${tag}..."
docker compose pull backend web || echo "(sin acceso a GHCR: se usará la imagen local si existe)"
docker compose up -d backend web
./scripts/health.sh --wait backend web
sed -i "s/^IMAGE_TAG=.*/IMAGE_TAG=${tag}/" .env
echo "[$(date)] ✔ backend+web en ${tag}"
