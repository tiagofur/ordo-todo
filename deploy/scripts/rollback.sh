#!/usr/bin/env bash
# =============================================================================
# Rollback de backend + web a una imagen anterior (etiquetada por SHA de commit).
#
#   ./scripts/rollback.sh <sha>        p. ej. ./scripts/rollback.sh 9152a2ee…
#
# - Las imágenes de los últimos 7 días siguen en el servidor (el deploy solo
#   borra las más antiguas), así que no hace falta acceso a GHCR.
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
