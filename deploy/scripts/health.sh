#!/usr/bin/env bash
# =============================================================================
# Estado de Ordo en el VPS (contenedores, salud, endpoints, recursos, errores).
#
#   ./scripts/health.sh                     informe completo
#   ./scripts/health.sh --wait backend web  espera (máx HEALTH_TIMEOUT=150s) a que
#                                           los servicios estén "healthy"; si no,
#                                           muestra sus logs y sale con error.
# Lo usa el deploy de GitHub Actions y la revisión periódica.
# =============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -f .env ]; then set -a; . ./.env; set +a; fi
API_PORT=${API_PORT:-3001}
WEB_PORT=${WEB_PORT:-3003}
WEBPAGE_PORT=${WEBPAGE_PORT:-3002}

health_of() {
  docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "ordo-$1" 2>/dev/null || echo missing
}

if [ "${1:-}" = "--wait" ]; then
  shift
  timeout=${HEALTH_TIMEOUT:-150}
  start=$(date +%s)
  for svc in "$@"; do
    while :; do
      st=$(health_of "$svc")
      if [ "$st" = healthy ]; then echo "✔ $svc healthy"; break; fi
      if [ $(( $(date +%s) - start )) -ge "$timeout" ]; then
        echo "✖ $svc sigue en estado '$st' tras ${timeout}s. Últimos logs:"
        docker compose logs --tail 80 "$svc" || true
        exit 1
      fi
      sleep 5
    done
  done
  exit 0
fi

code() { curl -s -o /dev/null -m 8 -w '%{http_code}' "$1" 2>/dev/null || echo ERR; }

echo "== Contenedores =="
docker compose ps --format 'table {{.Name}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null || docker compose ps

echo; echo "== Salud y reinicios =="
for s in postgres backend web webpage; do
  printf '%-9s %-10s reinicios=%s\n' "$s" "$(health_of "$s")" \
    "$(docker inspect --format '{{.RestartCount}}' "ordo-$s" 2>/dev/null || echo -)"
done

echo; echo "== Endpoints (127.0.0.1, lo que ve Plesk) =="
echo "API  /api/v1/health/live   -> $(code "http://127.0.0.1:${API_PORT}/api/v1/health/live")"
echo "API  /api/v1/health/ready  -> $(code "http://127.0.0.1:${API_PORT}/api/v1/health/ready")"
echo "Web  /                     -> $(code "http://127.0.0.1:${WEB_PORT}/")"
echo "Land /                     -> $(code "http://127.0.0.1:${WEBPAGE_PORT}/")"

echo; echo "== Versión desplegada (.env) =="
grep -E '^(IMAGE_TAG|MARKETING_IMAGE_TAG)=' .env 2>/dev/null | sed 's/ *#.*//' || echo "(sin .env)"

echo; echo "== Recursos del servidor =="
df -h / | awk 'NR==2{print "disco /: "$5" usado, "$4" libre"}'
free -h | awk '/^Mem:/{print "memoria: "$3" usada de "$2" ("$7" disponible)"}'
docker system df --format 'docker: imágenes {{.Size}} ({{.Reclaimable}} recuperable)' 2>/dev/null | head -1 || true

echo; echo "== Líneas con error en los últimos 30 min =="
for s in backend web webpage; do
  n=$(docker compose logs --since 30m --no-log-prefix "$s" 2>/dev/null | grep -ciE '\b(error|exception|unhandled)\b' || true)
  echo "$s: ${n:-0}"
done

echo; echo "== Backups más recientes =="
ls -t backups/ordo_*.dump 2>/dev/null | head -3 || true
[ -z "$(ls backups/ordo_*.dump 2>/dev/null)" ] && echo "(ninguno)"
