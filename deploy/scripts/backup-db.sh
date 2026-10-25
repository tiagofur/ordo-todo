#!/usr/bin/env bash
# =============================================================================
# Backup de Ordo: volcado de Postgres (formato custom comprimido) + adjuntos.
#
#   ./scripts/backup-db.sh            → backups/ordo_<fecha>.dump + uploads_<fecha>.tgz
#   BACKUP_KEEP_DAYS=14               retención (por defecto 14 días)
#
# Restaurar (¡sobrescribe la BD actual!):
#   docker compose exec -T postgres pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
#       --clean --if-exists --no-owner < backups/ordo_<fecha>.dump
# Copiar fuera del servidor: Plesk → Backup Manager (incluir /opt/ordo-todo/backups).
# =============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a

mkdir -p backups
ts=$(date +%Y-%m-%d_%H%M%S)
keep=${BACKUP_KEEP_DAYS:-14}

echo "[$(date)] Volcando ${POSTGRES_DB}..."
docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc > "backups/ordo_${ts}.dump"

echo "[$(date)] Empaquetando adjuntos..."
docker run --rm \
  -v "${UPLOADS_VOLUME:-ordo-todo_backend_uploads}:/data:ro" \
  -v "$PWD/backups:/out" \
  alpine:3.20 tar czf "/out/uploads_${ts}.tgz" -C /data .

find backups -name 'ordo_*.dump'   -mtime +"$keep" -delete
find backups -name 'uploads_*.tgz' -mtime +"$keep" -delete

ls -lh "backups/ordo_${ts}.dump" "backups/uploads_${ts}.tgz"
echo "[$(date)] ✔ Backup completado (retención ${keep} días)"
