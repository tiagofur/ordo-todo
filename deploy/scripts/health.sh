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

# Lee KEY del .env con la semántica de Compose (sin ejecutarlo: un valor como
# "Ordo <no-reply@…>" rompería un `source`). Comillas opcionales; en valores sin
# comillas, " #" empieza un comentario.
envval() {
  local raw; raw=$(grep -E "^$1=" .env 2>/dev/null | tail -1 | cut -d= -f2-)
  case $raw in
    \"*) raw=${raw#\"}; raw=${raw%%\"*} ;;
    \'*) raw=${raw#\'}; raw=${raw%%\'*} ;;
    *)   raw=${raw%%[[:space:]]#*}; raw=${raw%"${raw##*[![:space:]]}"} ;;
  esac
  printf '%s' "$raw"
}
API_PORT=$(envval API_PORT); API_PORT=${API_PORT:-3001}
WEB_PORT=$(envval WEB_PORT); WEB_PORT=${WEB_PORT:-3003}
WEBPAGE_PORT=$(envval WEBPAGE_PORT); WEBPAGE_PORT=${WEBPAGE_PORT:-3002}
HEALTH_TIMEOUT=${HEALTH_TIMEOUT:-$(envval HEALTH_TIMEOUT)}

health_of() {
  local st
  st=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "ordo-$1" 2>/dev/null) || st=""
  printf '%s' "${st:-missing}"
}
restarts_of() {
  local n
  n=$(docker inspect --format '{{.RestartCount}}' "ordo-$1" 2>/dev/null) || n=""
  printf '%s' "${n:--}"
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
  printf '%-9s %-10s reinicios=%s\n' "$s" "$(health_of "$s")" "$(restarts_of "$s")"
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
if ls backups/ordo_*.dump >/dev/null 2>&1; then
  ls -t backups/ordo_*.dump | head -3
else
  echo "(ninguno)"
fi
