# 🚀 Despliegue con Plesk Obsidian

Esta guía te muestra cómo desplegar Ordo-Todo en un VPS con Plesk Obsidian.

## 📋 Requisitos

- ✅ VPS con Plesk Obsidian instalado
- ✅ Extensión Docker en Plesk
- ✅ Dominio `ordotodo.app` configurado

---

## 1️⃣ Configurar Dominio en Plesk

### 1.1 Agregar el dominio principal

1. En Plesk → **Websites & Domains** → **Add Domain**
2. Domain name: `ordotodo.app`
3. Hosting type: **No hosting** (usaremos Docker)

### 1.2 Agregar subdominio para API

1. En el dominio `ordotodo.app` → **Add Subdomain**
2. Subdomain: `api`
3. Esto crea `api.ordotodo.app`

### 1.3 Configurar SSL

1. En cada dominio/subdominio → **SSL/TLS Certificates**
2. Click **Install** → **Let's Encrypt**
3. Marcar: "Redirect from HTTP to HTTPS"

---

## 2️⃣ Configurar Docker en Plesk

### 2.1 Verificar extensión Docker

1. Plesk → **Extensions** → Buscar "Docker"
2. Si no está instalado, instalarlo

### 2.2 Acceder por SSH

En Plesk, ve a **Tools & Settings** → **SSH Keys** para configurar acceso SSH.

O usa la terminal web de Plesk: **Server Management** → **Terminal**

### 2.3 Crear directorio del proyecto

```bash
mkdir -p /opt/ordo-todo/backups
cd /opt/ordo-todo
```

### 2.4 Descargar archivos de configuración

```bash
# Descargar docker-compose
curl -O https://raw.githubusercontent.com/tiagofur/ordo-todo/main/deploy/docker-compose.plesk.yml

# Renombrar
mv docker-compose.plesk.yml docker-compose.yml
```

### 2.5 Crear archivo .env

```bash
nano .env
```

Contenido (reemplaza los valores):

```env
DOMAIN=ordotodo.app
GITHUB_REPOSITORY_OWNER=tiagofur
IMAGE_TAG=latest

# Database
POSTGRES_USER=ordo_prod
POSTGRES_PASSWORD=TU_PASSWORD_SEGURO_32_CARACTERES
POSTGRES_DB=ordo_todo_prod

# JWT Secrets (genera con: openssl rand -base64 64)
JWT_SECRET=TU_JWT_SECRET
JWT_REFRESH_SECRET=TU_JWT_REFRESH_SECRET
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# NextAuth (genera con: openssl rand -base64 32)
NEXTAUTH_SECRET=TU_NEXTAUTH_SECRET

# AI (opcional)
GEMINI_API_KEY=
```

### 2.6 Login a GitHub Container Registry

```bash
# Necesitas un Personal Access Token de GitHub con permisos 'read:packages'
echo "TU_GITHUB_TOKEN" | docker login ghcr.io -u TU_USUARIO_GITHUB --password-stdin
```

### 2.7 Iniciar servicios

```bash
cd /opt/ordo-todo

# Descargar imágenes
docker compose pull

# Iniciar PostgreSQL primero
docker compose up -d postgres

# Esperar 10 segundos
sleep 10

# Ejecutar migraciones
docker compose up migrations

# Iniciar todos los servicios
docker compose up -d
```

### 2.8 Verificar que todo corra

```bash
docker compose ps
docker compose logs -f
```

---

## 3️⃣ Configurar Reverse Proxy en Plesk

Plesk necesita enviar el tráfico a los contenedores Docker.

### 3.1 Para ordotodo.app (Web Frontend)

1. En Plesk → **Websites & Domains** → `ordotodo.app`
2. Click en **Apache & nginx Settings**
3. En **Additional nginx directives**, agregar:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
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

4. Click **OK** o **Apply**

### 3.2 Para api.ordotodo.app (Backend API)

1. En Plesk → **Websites & Domains** → `api.ordotodo.app`
2. Click en **Apache & nginx Settings**
3. En **Additional nginx directives**, agregar:

```nginx
location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # CORS headers
    add_header Access-Control-Allow-Origin "https://ordotodo.app" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    add_header Access-Control-Allow-Credentials "true" always;
    
    # Handle preflight
    if ($request_method = 'OPTIONS') {
        return 204;
    }
}
```

4. Click **OK** o **Apply**

---

## 4️⃣ Configurar GitHub Actions para Plesk

### 4.1 Crear clave SSH para deploy

En el servidor (via terminal de Plesk o SSH):

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_deploy -N ""
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Mostrar clave privada (copiar para GitHub)
cat ~/.ssh/github_deploy
```

### 4.2 Configurar Secrets en GitHub

Ve a tu repositorio → Settings → Secrets → Actions:

| Secret | Valor |
|--------|-------|
| `VPS_HOST` | `74.208.234.244` |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | Contenido de `~/.ssh/github_deploy` |
| `VPS_SSH_PORT` | `22` |

---

## 5️⃣ Actualizar Workflow para Plesk

El workflow de deploy ya creado funcionará. Solo asegúrate de que el script use `docker-compose.yml` (no `docker-compose.prod.yml`).

---

## 6️⃣ Comandos Útiles

### Ver logs
```bash
docker compose logs -f
docker compose logs -f backend
docker compose logs -f web
```

### Reiniciar servicios
```bash
docker compose restart
```

### Actualizar manualmente
```bash
cd /opt/ordo-todo
docker compose pull
docker compose up migrations
docker compose up -d
```

### Backup de base de datos
```bash
docker compose exec postgres pg_dump -U ordo_prod ordo_todo_prod > backup.sql
```

---

## 🔧 Troubleshooting

### Error: "Bad Gateway" o "502"
- Verifica que los contenedores estén corriendo: `docker compose ps`
- Verifica logs: `docker compose logs backend`

### Error: "Connection refused"
- Verifica que los puertos estén correctos en nginx
- Verifica que los contenedores escuchen en los puertos correctos

### SSL no funciona
- En Plesk, reinstala el certificado Let's Encrypt
- Verifica que el dominio apunte al servidor correcto
