# 🚀 Estado del Despliegue - Ordo-Todo

> **Última actualización:** 11 de Diciembre 2024, 23:01 hrs
> **Estado:** ⏳ En progreso - Esperando que GitHub Actions termine de construir las imágenes

---

## 📋 Resumen del Progreso

### ✅ Completado

| Paso | Descripción | Estado |
|------|-------------|--------|
| 1 | Dominio `ordotodo.app` configurado en Plesk | ✅ |
| 2 | Subdominio `api.ordotodo.app` configurado | ✅ |
| 3 | SSL/HTTPS habilitado en ambos dominios | ✅ |
| 4 | Docker instalado en VPS (via Plesk) | ✅ |
| 5 | PostgreSQL corriendo en el servidor | ✅ |
| 6 | Archivo `.env` creado en `/opt/ordo-todo/` | ✅ |
| 7 | Archivo `docker-compose.yml` creado | ✅ |
| 8 | Login a GitHub Container Registry | ✅ |
| 9 | GitHub Secrets configurados | ✅ |
| 10 | Dockerfiles creados (backend + web) | ✅ |
| 11 | Workflows de GitHub Actions creados | ✅ |

### ⏳ En Progreso

| Paso | Descripción | Estado |
|------|-------------|--------|
| 12 | GitHub Actions construyendo imágenes Docker | ⏳ Esperando |
| 13 | Pull de imágenes en el servidor | ⏳ Pendiente |
| 14 | Configurar reverse proxy en Plesk | ⏳ Pendiente |
| 15 | Verificar que todo funcione | ⏳ Pendiente |

---

## 🔑 Información Importante

### Servidor VPS (IONOS)
- **IP:** `74.208.234.244`
- **Usuario:** `root`
- **Panel Plesk:** `https://74.208.234.244:8443`

### Dominios
- **Web:** `https://ordotodo.app`
- **API:** `https://api.ordotodo.app`

### Ubicación de Archivos en el Servidor
```
/opt/ordo-todo/
├── .env                    # Variables de entorno (secretos)
├── docker-compose.yml      # Configuración de Docker
└── backups/                # Backups de base de datos
```

### Credenciales Generadas (guardadas en .env del servidor)
- `POSTGRES_PASSWORD`: uuGY6FYl5kyclHailPnqNHw5wUXm1er
- `JWT_SECRET`: +3lRZsue9iXtFmByR/kZxQjBJpJB7URaxJdH3/2qbO6pFF9po4jQlTVcwwvdEiQ18XBsL7LTPZtuOTxUKi1BJQ==
- `JWT_REFRESH_SECRET`: eJB3mvgtnTOxiizKDdoQ9WBUCosKNQzt163gKm3IZ+5PQDFUV9N4w3rV4e76T87pb3RlSPFT4KoFlQ3FzOgQnA==
- `NEXTAUTH_SECRET`: Kcv5GrtE0lf7G9qZ4fnZAnVekouSbixx60JisCI38gY=

### GitHub Secrets Configurados
- `VPS_HOST`: 74.208.234.244
- `VPS_USER`: root
- `VPS_SSH_PORT`: 22
- `VPS_SSH_KEY`: (clave SSH privada)

---

## 📝 Pasos para Continuar Mañana

### Paso 1: Verificar GitHub Actions

1. Ve a: https://github.com/tiagofur/ordo-todo/actions
2. Busca el workflow más reciente
3. Verifica si tiene ✅ (éxito) o ❌ (error)

**Si tiene ✅:** Continúa al Paso 2
**Si tiene ❌:** Ve a la sección "Troubleshooting" abajo

### Paso 2: Descargar las imágenes Docker

Conéctate al servidor via la terminal de Plesk:

```bash
cd /opt/ordo-todo
docker compose pull
```

Si te pide login:
```bash
docker login ghcr.io -u tiagofur -p TU_GITHUB_TOKEN
docker compose pull
```

### Paso 3: Iniciar los contenedores

```bash
cd /opt/ordo-todo

# Ejecutar migraciones
docker compose up migrations

# Iniciar todos los servicios
docker compose up -d

# Verificar que estén corriendo
docker compose ps
```

Deberías ver:
```
ordo-postgres   running (healthy)
ordo-backend    running
ordo-web        running
```

### Paso 4: Probar que funcionan

```bash
# Probar backend
curl http://localhost:3001/health

# Probar web
curl http://localhost:3000
```

### Paso 5: Configurar Reverse Proxy en Plesk

#### Para ordotodo.app:
1. Plesk → Websites & Domains → ordotodo.app
2. Apache & nginx Settings
3. En "Additional nginx directives", pegar:

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

4. Click OK/Apply

#### Para api.ordotodo.app:
1. Plesk → Websites & Domains → api.ordotodo.app
2. Apache & nginx Settings
3. En "Additional nginx directives", pegar:

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
}
```

4. Click OK/Apply

### Paso 6: Verificar en el navegador

1. Abre https://ordotodo.app → Debería cargar la app
2. Abre https://api.ordotodo.app/health → Debería mostrar `{"status":"healthy",...}`

---

## 🔧 Troubleshooting

### Error: "manifest unknown" al hacer docker compose pull

Las imágenes no se han construido aún. Verifica GitHub Actions.

### Error en GitHub Actions: "prisma..."

Si el error menciona Prisma, probablemente es un problema de configuración.
Intenta hacer un push vacío para re-ejecutar:
```bash
git commit --allow-empty -m "retry: trigger CI"
git push origin main
```

### Error: "Connection refused" en Plesk

Los contenedores no están corriendo. Verifica con:
```bash
docker compose ps
docker compose logs
```

### Ver logs de un servicio específico

```bash
docker compose logs -f backend   # Para backend
docker compose logs -f web       # Para web
docker compose logs -f postgres  # Para base de datos
```

### Reiniciar servicios

```bash
docker compose restart
```

### Recrear todo desde cero

```bash
docker compose down
docker compose pull
docker compose up -d
```

---

## 📁 Archivos Creados en este Proceso

### Archivos de Despliegue
- `deploy/docker-compose.prod.yml` - Para uso con Traefik (no Plesk)
- `deploy/docker-compose.plesk.yml` - Para uso con Plesk
- `deploy/.env.example` - Template de variables
- `deploy/.env.plesk.example` - Template para Plesk
- `deploy/PLESK-GUIDE.md` - Guía detallada para Plesk
- `deploy/README.md` - Documentación general
- `deploy/scripts/setup-vps.sh` - Script de configuración VPS
- `deploy/scripts/generate-secrets.sh` - Generador de secretos

### Dockerfiles
- `apps/backend/Dockerfile` - Imagen Docker del backend
- `apps/web/Dockerfile` - Imagen Docker de la web

### GitHub Workflows
- `.github/workflows/deploy.yml` - Workflow de deploy automático
- `.github/workflows/ci.yml` - Workflow de CI (modificado)

### Otros
- `.dockerignore` - Archivos a ignorar en Docker build
- `apps/backend/src/health/` - Endpoint de health check
- `apps/web/next.config.ts` - Modificado para standalone output

---

## 🎯 Flujo de Actualización Futuro

Una vez que todo funcione, para actualizar la app:

1. Haz cambios en el código
2. Commit y push a main:
   ```bash
   git add .
   git commit -m "feat: nueva funcionalidad"
   git push origin main
   ```
3. GitHub Actions automáticamente:
   - Construye nuevas imágenes
   - Las sube a GHCR
   - Hace deploy al VPS via SSH
   - Ejecuta migraciones de base de datos

¡Todo automático! 🚀

---

## ⚠️ Notas de Seguridad

1. **Regenerar token de GitHub** - El token `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` fue compartido. Ve a https://github.com/settings/tokens y revócalo/regeneralo.

2. **Cambiar contraseñas si es necesario** - Si sientes que alguna credencial fue comprometida, regenera los secretos en el servidor.

---

> **¿Preguntas?** Continúa la conversación cuando estés listo.
