# 🚀 Despliegue con Plesk Obsidian

Cómo preparar el VPS con Plesk para que el deploy automático de GitHub Actions
funcione. La operación del día a día (estado, rollback, backups, rotación de
secretos) está en [RUNBOOK.md](./RUNBOOK.md).

## 📋 Requisitos

- VPS con Plesk Obsidian y Docker instalado (ya los hay).
- Dominios `ordotodo.app`, `api.ordotodo.app` y `ordotodo.com` dados de alta en Plesk (ya lo están).
- Acceso SSH como `root` con clave (sin contraseña).

> El VPS está **compartido** con otros proyectos. Ordo solo usa `/opt/ordo-todo`
> y los puertos `3001`, `3002` y `3003` en `127.0.0.1`. El `3000` y el `5432`
> del host pertenecen a otros servicios: no usarlos.

---

## 1️⃣ Dominios y SSL en Plesk

Para cada dominio (`ordotodo.app`, `api.ordotodo.app`, `ordotodo.com`):

1. **Websites & Domains** → dominio → *Hosting type*: **No hosting** (sirve Docker).
2. **SSL/TLS Certificates** → *Install* → **Let's Encrypt**, marcando "Redirect from HTTP to HTTPS" y, en `ordotodo.app`/`ordotodo.com`, el alias `www`.

---

## 2️⃣ Directorio y `.env`

```bash
mkdir -p /opt/ordo-todo/backups /opt/ordo-todo/scripts
cd /opt/ordo-todo
curl -fsSL https://raw.githubusercontent.com/tiagofur/ordo-todo/main/deploy/.env.plesk.example -o .env
nano .env     # rellenar TODOS los CHANGE_ME y los dominios/puertos
chmod 600 .env
```

Secretos: `openssl rand -base64 64 | tr -d '\n'` (JWT_SECRET, ≥64 caracteres),
`openssl rand -base64 32` (NEXTAUTH_SECRET), `openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32` (POSTGRES_PASSWORD).
Guarda una copia del `.env` en tu gestor de contraseñas.

**No descargues el compose a mano**: el deploy copia `deploy/docker-compose.plesk.yml`
a `/opt/ordo-todo/docker-compose.yml` en cada ejecución. La base de datos es
`pgvector/pgvector:pg16` (el schema necesita la extensión `vector`).

---

## 3️⃣ Proxy inverso en Plesk

En cada dominio → **Apache & nginx Settings** → *Additional nginx directives*.
Cambia solo el puerto; no añadas cabeceras CORS (las pone el backend y, duplicadas, el navegador las rechaza).

**`ordotodo.app`** → web (`WEB_PORT`, por defecto **3003**):

```nginx
location / {
    proxy_pass http://127.0.0.1:3003;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

**`api.ordotodo.app`** → backend (`API_PORT`, por defecto **3001**): el mismo bloque con `proxy_pass http://127.0.0.1:3001;` y, para subidas de adjuntos, `client_max_body_size 25m;`.

**`ordotodo.com`** → landing (`WEBPAGE_PORT`, por defecto **3002**): el mismo bloque con `proxy_pass http://127.0.0.1:3002;`.

---

## 4️⃣ Clave SSH para GitHub Actions

Usa una clave **dedicada** para Ordo (no la de otros proyectos), así se puede revocar sin afectar a nadie:

```bash
ssh-keygen -t ed25519 -C "github-actions-ordo" -f /root/.ssh/github_actions_ordo -N ""
cat /root/.ssh/github_actions_ordo.pub >> /root/.ssh/authorized_keys
cat /root/.ssh/github_actions_ordo    # ← contenido para el secret VPS_SSH_KEY
```

Secrets del repositorio (Settings → Secrets and variables → Actions):

| Secret | Valor |
|--------|-------|
| `VPS_HOST` | `74.208.234.244` |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | clave privada anterior |
| `VPS_SSH_PORT` | `22` |

---

## 5️⃣ Primer despliegue y comprobación

1. Actions → **Deploy** → *Run workflow* (rama `main`). Sigue el log: tests → imágenes → migraciones → arranque → espera a "healthy".
2. Actions → **Deploy Marketing** → *Run workflow* para la landing.
3. En el VPS: `cd /opt/ordo-todo && ./scripts/health.sh`.
4. En el navegador: `https://ordotodo.app` (login), `https://api.ordotodo.app/api/v1/health` (200), `https://ordotodo.com`.
5. Primer backup: `./scripts/backup-db.sh` y programarlo (RUNBOOK §5).

---

## 🔧 Problemas típicos

- **502 Bad Gateway**: el puerto de la directiva nginx no coincide con el de `.env`, o el contenedor no está sano → `./scripts/health.sh`.
- **`permission denied (publickey)` en el deploy**: la clave de `VPS_SSH_KEY` no está en `/root/.ssh/authorized_keys`.
- **Migraciones fallan**: el deploy aborta sin arrancar la versión nueva; leer el log del job y ver RUNBOOK §4/§5.
