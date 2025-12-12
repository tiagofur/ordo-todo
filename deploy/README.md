# 🚀 Guía de Despliegue - Ordo-Todo

Esta guía te llevará paso a paso para desplegar Ordo-Todo en tu VPS con IONOS.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configurar el VPS](#1-configurar-el-vps)
3. [Configurar DNS](#2-configurar-dns)
4. [Configurar GitHub Secrets](#3-configurar-github-secrets)
5. [Primer Despliegue](#4-primer-despliegue)
6. [Actualizaciones Continuas](#5-actualizaciones-continuas)
7. [Comandos Útiles](#6-comandos-útiles)
8. [Troubleshooting](#7-troubleshooting)

---

## Requisitos Previos

- ✅ VPS con Ubuntu 22.04+ (IONOS)
- ✅ Acceso SSH al servidor
- ✅ Dominio `ordotodo.app` configurado
- ✅ Repositorio en GitHub

---

## 1. Configurar el VPS

### 1.1 Conectarse al VPS

```bash
ssh root@TU_IP_DEL_VPS
```

### 1.2 Ejecutar Script de Setup

```bash
# Descargar y ejecutar el script de configuración
curl -sSL https://raw.githubusercontent.com/tiagofur/ordo-todo/main/deploy/scripts/setup-vps.sh | sudo bash
```

O si prefieres hacerlo manualmente:

```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Instalar Docker Compose plugin
apt install -y docker-compose-plugin

# Crear usuario y directorios
useradd -m -s /bin/bash -G docker ordo
mkdir -p /opt/ordo-todo/backups
chown -R ordo:ordo /opt/ordo-todo

# Configurar firewall
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 1.3 Crear Usuario SSH para Deployments

```bash
# Como root, crear clave SSH para GitHub Actions
su - ordo
mkdir -p ~/.ssh
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions -N ""

# Agregar clave pública a authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Mostrar la clave privada (copiar esto para GitHub Secrets)
cat ~/.ssh/github_actions
```

### 1.4 Generar Secretos

```bash
# Generar passwords seguros
echo "POSTGRES_PASSWORD: $(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)"
echo "JWT_SECRET: $(openssl rand -base64 64)"
echo "JWT_REFRESH_SECRET: $(openssl rand -base64 64)"
echo "NEXTAUTH_SECRET: $(openssl rand -base64 32)"

# Generar credenciales para Traefik dashboard
apt install -y apache2-utils
htpasswd -nb admin TU_PASSWORD_SEGURO
```

### 1.5 Crear Archivo de Configuración

```bash
# Como usuario ordo
su - ordo
cd /opt/ordo-todo

# Copiar el archivo de ejemplo
nano .env
```

Contenido del archivo `.env`:

```env
# Domain
DOMAIN=ordotodo.app
ACME_EMAIL=tu-email@gmail.com

# GitHub
GITHUB_REPOSITORY_OWNER=tiagofur
IMAGE_TAG=latest

# Database
POSTGRES_USER=ordo_prod
POSTGRES_PASSWORD=TU_PASSWORD_GENERADO_ARRIBA
POSTGRES_DB=ordo_todo_prod

# JWT (copiar los valores generados arriba)
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# NextAuth
NEXTAUTH_SECRET=...

# Traefik (escapar $ como $$)
TRAEFIK_DASHBOARD_AUTH=admin:$$apr1$$...

# AI (opcional)
GEMINI_API_KEY=
```

### 1.6 Copiar docker-compose.prod.yml

```bash
cd /opt/ordo-todo
curl -O https://raw.githubusercontent.com/tiagofur/ordo-todo/main/deploy/docker-compose.prod.yml
```

---

## 2. Configurar DNS

En tu panel de IONOS o donde tengas el dominio, configura:

| Tipo | Host | Valor | TTL |
|------|------|-------|-----|
| A | @ | TU_IP_DEL_VPS | 3600 |
| A | www | TU_IP_DEL_VPS | 3600 |
| A | api | TU_IP_DEL_VPS | 3600 |
| A | traefik | TU_IP_DEL_VPS | 3600 |

**Espera 5-10 minutos** para que los DNS se propaguen.

Para verificar:
```bash
dig ordotodo.app +short
dig api.ordotodo.app +short
```

---

## 3. Configurar GitHub Secrets

Ve a tu repositorio en GitHub → Settings → Secrets and variables → Actions

### Secrets Requeridos:

| Secret | Descripción | Ejemplo |
|--------|-------------|---------|
| `VPS_HOST` | IP o dominio del VPS | `123.45.67.89` |
| `VPS_USER` | Usuario SSH | `ordo` |
| `VPS_SSH_KEY` | Clave SSH privada | Contenido de `~/.ssh/github_actions` |
| `VPS_SSH_PORT` | Puerto SSH (opcional) | `22` |

### Crear Environment "production":

1. Ve a Settings → Environments
2. Crea un environment llamado `production`
3. (Opcional) Agrega protección: require reviewers antes de deploy

---

## 4. Primer Despliegue

### 4.1 Iniciar Servicios Base

En el VPS:

```bash
cd /opt/ordo-todo

# Iniciar Traefik y PostgreSQL primero
docker compose -f docker-compose.prod.yml up -d traefik postgres

# Verificar que estén corriendo
docker compose -f docker-compose.prod.yml ps
```

### 4.2 Hacer Push para Activar el Deploy

En tu máquina local:

```bash
git add .
git commit -m "feat: add production deployment configuration"
git push origin main
```

Esto activará GitHub Actions que:
1. ✅ Ejecutará tests
2. ✅ Construirá imágenes Docker
3. ✅ Subirá imágenes a GitHub Container Registry
4. ✅ Desplegará al VPS vía SSH
5. ✅ Ejecutará migraciones de Prisma

### 4.3 Verificar Despliegue

```bash
# En el VPS
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f

# Probar endpoints
curl https://ordotodo.app
curl https://api.ordotodo.app/health
```

---

## 5. Actualizaciones Continuas

A partir de ahora, cada vez que hagas push a `main`:

```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
```

GitHub Actions automáticamente:
1. Construirá nuevas imágenes
2. Ejecutará migraciones de base de datos
3. Desplegará con zero-downtime

### Deploy Manual de Emergencia

Si necesitas hacer un deploy sin tests:

1. Ve a GitHub → Actions → Deploy
2. Click "Run workflow"
3. Marca "Skip tests (emergency deploy)"
4. Click "Run workflow"

---

## 6. Comandos Útiles

### Logs

```bash
# Ver todos los logs
docker compose -f docker-compose.prod.yml logs -f

# Solo backend
docker compose -f docker-compose.prod.yml logs -f backend

# Solo web
docker compose -f docker-compose.prod.yml logs -f web
```

### Reiniciar Servicios

```bash
# Reiniciar todo
docker compose -f docker-compose.prod.yml restart

# Reiniciar un servicio específico
docker compose -f docker-compose.prod.yml restart backend
```

### Base de Datos

```bash
# Conectarse a PostgreSQL
docker compose -f docker-compose.prod.yml exec postgres psql -U ordo_prod -d ordo_todo_prod

# Backup manual
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U ordo_prod ordo_todo_prod | gzip > backup_$(date +%Y%m%d).sql.gz

# Restaurar backup
gunzip < backup_20231211.sql.gz | docker compose -f docker-compose.prod.yml exec -T postgres psql -U ordo_prod -d ordo_todo_prod
```

### Migraciones Prisma

```bash
# Ejecutar migraciones pendientes
docker compose -f docker-compose.prod.yml run --rm migrations

# Ver estado de migraciones
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate status --schema=/app/packages/db/prisma/schema.prisma
```

---

## 7. Troubleshooting

### Error: "Permission denied" en SSH

```bash
# Verificar permisos de la clave
chmod 600 ~/.ssh/github_actions
chmod 700 ~/.ssh
```

### Error: "Cannot connect to Docker"

```bash
# Agregar usuario al grupo docker
sudo usermod -aG docker ordo
# Reloguearse
su - ordo
```

### Error: SSL Certificate

```bash
# Verificar Traefik
docker compose -f docker-compose.prod.yml logs traefik

# Recrear certificados
docker compose -f docker-compose.prod.yml restart traefik
```

### Ver Health de Contenedores

```bash
docker inspect --format='{{.State.Health.Status}}' ordo-backend
docker inspect --format='{{.State.Health.Status}}' ordo-web
```

### Limpiar Docker

```bash
# Limpiar imágenes no usadas
docker system prune -af

# Limpiar todo (¡cuidado con los volumes!)
docker system prune -af --volumes
```

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs: `docker compose -f docker-compose.prod.yml logs -f`
2. Verifica GitHub Actions: Ve a la pestaña "Actions" en GitHub
3. Revisa los secretos de GitHub están correctos

---

## 🔐 Seguridad

- ✅ SSL automático con Let's Encrypt
- ✅ Firewall configurado (solo 80, 443, SSH)
- ✅ Fail2Ban para protección contra brute-force
- ✅ Usuario no-root para containers
- ✅ Secretos en GitHub Secrets (no en código)
- ✅ Backups automáticos diarios
