# RUNBOOK — operar Ordo en producción (VPS con Plesk)

Guía de operación para humanos. Todo lo que hay que saber para desplegar, mirar
la salud, volver atrás, hacer backups y rotar secretos **sin recordar comandos**.

> El VPS (`74.208.234.244`, Ubuntu 24.04 + Plesk Obsidian) es **compartido** con
> otros proyectos (Creapolis, Pepinillo, DevDeck, Solennix). Todo lo de Ordo vive
> en `/opt/ordo-todo` y en contenedores `ordo-*`. No tocar nada fuera de ahí.

## 1. Cómo se despliega

| Qué | Cuándo | Qué hace |
|-----|--------|----------|
| **Deploy** (`.github/workflows/deploy.yml`) | merge a `main` (o a mano en Actions → Run workflow) | tests → construye `ordo-todo-backend` y `ordo-todo-web` → las sube a GHCR etiquetadas con el SHA → copia `deploy/docker-compose.plesk.yml` + `deploy/scripts/` al VPS → migraciones → arranca backend y web → espera a que estén sanos |
| **Deploy Marketing** (`deploy-marketing.yml`) | merge a `main` que toque `apps/webpage` o paquetes de UI | lo mismo para la landing (`ordo-todo-marketing-web`), solo el servicio `webpage` |

Reglas:
- El **compose se instala desde el repo en cada deploy**: no se edita en el VPS. Lo único que vive solo en el VPS es `/opt/ordo-todo/.env`.
- Si las migraciones fallan, el deploy **aborta sin arrancar las imágenes nuevas**.
- Si backend o web no llegan a "healthy" en 150 s, el deploy hace **rollback automático** a la versión anterior (`IMAGE_TAG` previo del `.env`) y el job queda en rojo. Las migraciones no se deshacen (ver §4).
- El deploy deja en `.env` la versión desplegada (`IMAGE_TAG=<sha>`), así un `docker compose up -d` manual no cambia de imagen por accidente.
- Los dos workflows comparten el grupo de concurrencia `deploy-production`: nunca corren dos a la vez.

### Puertos y dominios (Plesk hace TLS + proxy)

| Dominio | Servicio | Puerto en 127.0.0.1 |
|---------|----------|---------------------|
| `ordotodo.app` | web (Next.js) | `3003` |
| `api.ordotodo.app` | backend (NestJS) | `3001` |
| `ordotodo.com` | landing (Next.js) | `3002` |

Postgres **no publica puerto** (el `5432` del host es el Postgres del sistema que usa otro proyecto). Los puertos se cambian en `.env` (`WEB_PORT`, `API_PORT`, `WEBPAGE_PORT`) y en la directiva nginx del dominio en Plesk.

## 2. Ver el estado

```bash
ssh ordo-vps                       # alias configurado en el Mac
cd /opt/ordo-todo && ./scripts/health.sh
```

Muestra contenedores, salud y reinicios, respuesta de los endpoints, versión desplegada, disco/memoria, líneas de error recientes y últimos backups. Logs en vivo: `docker compose logs -f backend` (o `web`, `webpage`, `postgres`).

Desde fuera: `https://api.ordotodo.app/api/v1/health` (público) debe devolver 200.

## 3. Primer despliegue — checklist

1. **`.env` completo** en `/opt/ordo-todo/.env` a partir de `deploy/.env.plesk.example` (secretos nuevos: `openssl rand -base64 64 | tr -d '\n'` para JWT, `openssl rand -base64 32` para NextAuth). Guardar copia en el gestor de contraseñas.
2. **Base de datos**: decidir si se reutiliza el volumen `ordo-todo_postgres_data` (datos de pruebas de dic-2025) o se empieza limpio con `POSTGRES_VOLUME=ordo-todo_postgres_data_v2`. Recomendado: limpio.
3. **Plesk**: `ordotodo.app` → proxy a `127.0.0.1:3003` (hoy apunta al 3000, que es de otro proyecto), `api.ordotodo.app` → `3001` (ya está), `ordotodo.com` → `3002` (añadir). Sin cabeceras CORS en nginx: las pone el backend.
4. **Clave de deploy**: `VPS_SSH_KEY` en GitHub debe corresponder a una clave en `/root/.ssh/authorized_keys`. Si hay dudas, generar una nueva dedicada (`github-actions-ordo`) y actualizar el secret.
5. Lanzar **Deploy** a mano desde Actions y seguir el log. Al terminar: `./scripts/health.sh`, abrir `https://ordotodo.app`, iniciar sesión, enviar una invitación de prueba.
6. Hacer el **primer backup** (§5) y probar que restaura.

## 4. Volver atrás (rollback)

Las imágenes van etiquetadas por commit y las de los últimos 7 días siguen en el servidor.

- **Sin tocar el servidor**: Actions → *Deploy* → *Run workflow* → elegir el commit anterior (se reconstruye y despliega esa versión).
- **En el servidor** (más rápido): `./scripts/rollback.sh <sha-anterior>`.

El rollback **no deshace migraciones**. Si la versión anterior no es compatible con el schema nuevo, restaurar antes el backup previo al deploy (§5).

## 5. Backups

```bash
./scripts/backup-db.sh          # Postgres (.dump) + adjuntos (.tgz) en /opt/ordo-todo/backups, retención 14 días
```

Programarlo a diario en el cron de root (`0 3 * * * /opt/ordo-todo/scripts/backup-db.sh >> /opt/ordo-todo/backups/backup.log 2>&1`) y **sacar copia fuera del servidor** con Plesk → Backup Manager incluyendo `/opt/ordo-todo/backups`.

Restaurar (sobrescribe la BD actual; parar antes el backend con `docker compose stop backend web`):

```bash
set -a; . ./.env; set +a
docker compose exec -T postgres pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner < backups/ordo_<fecha>.dump
docker compose start backend web
```

## 6. Cambiar variables o rotar secretos

1. Editar `/opt/ordo-todo/.env` (nunca el compose).
2. Recrear solo lo afectado: `docker compose up -d backend` (y `web` si cambió `NEXTAUTH_SECRET`).
3. `./scripts/health.sh`. Actualizar la copia del gestor de contraseñas.

Consecuencias a tener en cuenta:
- **`JWT_SECRET`**: desloguea a todos los usuarios (los refresh tokens dejan de valer). Avisar antes.
- **`POSTGRES_PASSWORD`**: cambiar primero en la BD (`docker compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "ALTER USER ... PASSWORD '...'"`), luego en `.env`, luego `docker compose up -d backend web`.
- **OAuth**: rotar en la consola de Google/GitHub y luego en `.env`.
- Calendario sugerido: JWT/NextAuth cada 6 meses, BD una vez al año, OAuth cuando lo pida el proveedor. Los secretos que estuvieron en el historial de git (oct-2026) se rotan **todos** en el primer despliegue.

## 7. Qué NO hacer en este VPS

- No ejecutar `docker compose down` en `/opt/ordo-todo` salvo mantenimiento planificado (tira la BD de Ordo mientras dura).
- No ejecutar `docker system prune -a`, `docker volume prune` ni `systemctl restart docker`: afectan a los otros cuatro proyectos. El deploy solo poda imágenes de Ordo.
- No ejecutar `deploy/scripts/setup-vps.sh` (es para un VPS vacío; aborta si detecta Plesk).
- No publicar puertos en `0.0.0.0`: todo en `127.0.0.1` detrás de Plesk.

## 8. Problemas frecuentes

| Síntoma | Causa probable | Qué hacer |
|---------|----------------|-----------|
| 502 en `ordotodo.app` | contenedor caído o puerto de la directiva nginx distinto de `WEB_PORT` | `./scripts/health.sh`; comparar puerto en Plesk |
| Deploy falla en "migrations" | migración incompatible con datos existentes | leer el log; arreglar la migración o restaurar backup; el servicio anterior sigue corriendo |
| Deploy falla en "Esperando a que estén sanos" | backend no arranca (variable que falta en `.env`) | `docker compose logs --tail 100 backend` |
| No llegan emails | `SMTP_*`/`RESEND_API_KEY` vacíos | configurar en `.env` y `docker compose up -d backend` |
| `permission denied (publickey)` en el deploy | `VPS_SSH_KEY` no está en `authorized_keys` | §3 punto 4 |
