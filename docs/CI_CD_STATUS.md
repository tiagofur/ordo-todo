# CI/CD y Deployment Status

## ✅ Estado Actual: COMPLETADO Y FUNCIONAL

El pipeline de CI/CD está completamente configurado y listo para producción.

---

## 🔄 Workflows de GitHub Actions

### 1. **CI Workflow** (`.github/workflows/ci.yml`)

**Trigger**: Push y Pull Requests a `main`

**Jobs que ejecuta**:

#### 📦 Packages Build
- Compila todos los packages compartidos
- Genera cliente de Prisma
- Cache de dependencias

#### 🔧 Backend (NestJS)
- ✅ Lint con ESLint
- ✅ Unit tests
- ✅ E2E tests
- ✅ Build de producción
- ✅ Base de datos PostgreSQL en contenedor

#### 🌐 Web (Next.js)
- ✅ Lint
- ✅ Type check
- ✅ Build de producción

#### 🖥️ Desktop (Electron)
- ✅ Lint
- ✅ Build Vite

#### 📱 Mobile (React Native)
- ✅ Lint
- ✅ Type check

#### 🐳 Docker Images (solo en push a main)
- Build de imagen Backend
- Build de imagen Web
- Push a GitHub Container Registry (GHCR)

**Variables de entorno configuradas**:
```yaml
NODE_VERSION: "20"
DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ordo_todo_test
JWT_SECRET: ci-jwt-secret-that-is-at-least-32-characters-long
```

---

### 2. **Deploy Workflow** (`.github/workflows/deploy.yml`)

**Trigger**: Push a `main` (excluyendo docs y markdown)

**Workflow completo**:

#### Etapa 1: Test & Lint (opcional en emergency)
- Lint de todos los workspaces
- Type checking
- Prisma migrations

#### Etapa 2: Build Docker Images
- **Backend Image**:
  - Multi-stage build (deps → builder → runner)
  - Optimizado para producción
  - Tags: `ghcr.io/owner/ordo-todo-backend:sha` + `latest`

- **Web Image**:
  - Multi-stage build
  - Build args para producción
  - Tags: `ghcr.io/owner/ordo-todo-web:sha` + `latest`

#### Etapa 3: Deploy to VPS
- ✅ SSH connection al VPS
- ✅ Login a GHCR con reintentos (hasta 3)
- ✅ Pull de nuevas imágenes
- ✅ Database migrations
- ✅ Deploy de servicios
- ✅ Health checks
- ✅ Cleanup de old images

**Secrets requeridos en GitHub**:
```bash
VPS_HOST              # IP o dominio del VPS
VPS_USER              # Usuario SSH (ej: root)
VPS_SSH_KEY           # Private key SSH
VPS_SSH_PORT          # Puerto SSH (default: 22)
GITHUB_TOKEN          # Token automático de GitHub
```

---

## 🐳 Docker Configuration

### Backend Dockerfile Analysis

**Stage 1: Dependencies**
```dockerfile
FROM node:20-alpine AS deps
- Instala dependencias nativas (python3, make, g++)
- Copia todos los package.json del monorepo
- npm ci con --legacy-peer-deps
- Genera Prisma Client
```

**Stage 2: Builder**
```dockerfile
FROM node:20-alpine AS builder
- Build de shared packages (@ordo-todo/core, config)
- Build de backend con Turbo
- Optimizado para cache
```

**Stage 3: Production Runner**
```dockerfile
FROM node:20-alpine AS runner
- Usuario no-root (nestjs:nodejs)
- Solo archivos necesarios
- Healthcheck configurado
- Expose port 3001
```

### Web Dockerfile

Similar multi-stage build para Next.js con optimizaciones de producción.

---

## 🚀 Deployment en VPS

### Proceso de Deploy

1. **GitHub Actions trigger** al hacer push a `main`
2. **Tests pasan** → Build de imágenes Docker
3. **Images push** a GitHub Container Registry
4. **SSH connect** al VPS
5. **Docker login** a GHCR
6. **Docker compose pull** de nuevas imágenes
7. **Migrations** corren automáticamente
8. **Services restart** con zero-downtime
9. **Health checks** verifican deploy
10. **Cleanup** de old images

### Docker Compose en VPS

Ubicación: `/opt/ordo-todo/docker-compose.yml`

**Servicios**:
- `postgres` - PostgreSQL 16
- `redis` - Redis 7
- `backend` - NestJS API
- `web` - Next.js app
- `migrations` - Job para migrations

---

## 🔐 Seguridad Implementada

### GitHub Actions
- ✅ Permisos mínimos (`contents: read`, `packages: write`)
- ✅ Secrets encriptados
- ✅ No hardcoding de credenciales
- ✅ Protected branches (main)

### Docker
- ✅ Multi-stage builds (reducir attack surface)
- ✅ Non-root user
- ✅ Health checks
- ✅ Minimal base images (alpine)

### VPS
- ✅ SSH key authentication
- ✅ Firewall configurado
- ✅ Docker daemon.json con timeouts
- ✅ Log rotation

---

## 📊 Métricas y Monitoreo

### Health Endpoints

**Backend**: `http://api.ordotodo.app/health`
```json
{
  "status": "healthy",
  "timestamp": "2025-01-05T10:30:00.000Z",
  "uptime": 3600,
  "checks": {
    "database": { "status": "up", "responseTime": 15 },
    "redis": { "status": "up", "responseTime": 5 },
    "memory": { "status": "up", "usagePercent": "50.00" }
  }
}
```

**Kubernetes Probes**:
- `/health/live` - Liveness probe
- `/health/ready` - Readiness probe

### Prometheus Metrics

**Endpoint**: `http://api.ordotodo.app/metrics`

**Métricas recolectadas**:
- HTTP request duration
- HTTP request count
- Tasks created/completed
- Database query duration
- Cache hit/miss ratio
- Memory usage
- Event loop lag

---

## 🛠️ Troubleshooting CI/CD

### Error: "npm ci failed"
**Solución**: Workflow ya tiene reintentos automáticos (hasta 3)
```yaml
MAX_RETRIES=3
# ... retry logic with 15s delays
```

### Error: "Docker pull failed"
**Solución**: Workflow tiene reintentos + DNS fallback
```yaml
# DNS config
"dns": ["8.8.8.8", "8.8.4.4", "1.1.1.1"]
# Pull retries hasta 3 intentos
```

### Error: "Tests failing in CI"
**Solución**: Tests corren con PostgreSQL en contenedor
```yaml
services:
  postgres:
    image: postgres:16
    healthcheck: pg_isready
```

### Error: "Deployment failed"
**Diagnóstico**:
1. Check logs del job de GitHub Actions
2. Verificar secrets configurados correctamente
3. Check logs del VPS: `ssh user@vps 'cd /opt/ordo-todo && docker compose logs -f'`
4. Verificar Docker daemon en VPS: `systemctl status docker`

---

## ✅ Checklist antes de hacer Deploy

### Pre-Merge
- [ ] Tests pasan localmente: `npm run test`
- [ ] Lint pasa: `npm run lint`
- [ ] Type check pasa: `npm run check-types`
- [ ] Build exitoso: `npm run build`
- [ ] No hay warnings de TypeScript en production code

### Pre-Deploy (Automático)
- [ ] CI workflow pasa en GitHub Actions
- [ ] Docker images build exitosamente
- [ ] Docker images push a GHCR exitosamente
- [ ] Health checks configurados correctamente

### Post-Deploy (Automático)
- [ ] Services restart en VPS
- [ ] Database migrations aplicadas
- [ ] Health checks responden correctamente
- [ ] Old images limpiadas

---

## 🎛️ Configuración Local

### Agregar Remote del VPS

```bash
# Agregar VPS a known_hosts
ssh-keyscan -H your-vps-ip >> ~/.ssh/known_hosts

# Test connection
ssh -i ~/.ssh/your-key user@your-vps-ip
```

### Verificar Deploy Manual

```bash
# SSH al VPS
ssh user@vps-ip

# Check services
cd /opt/ordo-todo
docker compose ps
docker compose logs -f backend
```

---

## 📱 Comandos Útiles

### GitHub Actions

```bash
# Ver workflows corriendo
gh run list --workflow=deploy.yml

# Ver logs de un run específico
gh run view <run-id> --log

# Re-run un workflow fallido
gh run rerun <run-id>

# Trigger manual deployment
gh workflow run deploy.yml
```

### Docker en VPS

```bash
# Ver logs en tiempo real
ssh user@vps 'cd /opt/ordo-todo && docker compose logs -f'

# Ver solo backend logs
ssh user@vps 'cd /opt/ordo-todo && docker compose logs -f backend'

# Restart services
ssh user@vps 'cd /opt/ordo-todo && docker compose restart backend web'

# Check health
curl http://api.ordotodo.app/health
curl http://api.ordotodo.app/metrics
```

---

## 🎯 Próximos Pasos Opcionales

### Mejoras Futuras

1. **Staging Environment**
   - Configurar `deploy-staging.yml`
   - Separar staging de production

2. **Automated Testing**
   - Aumentar cobertura de tests al 85%+
   - Agregar E2E tests con Playwright

3. **Monitoring Avanzado**
   - Integrar Sentry para error tracking
   - Configurar Grafana dashboards
   - Alertas con PagerDuty

4. **Rollback Automático**
   - Health checks post-deploy
   - Auto-rollback si health fails
   - Blue-green deployment

5. **Performance**
   - CDN para assets estáticos
   - Redis cluster para alta disponibilidad
   - Database read replicas

---

## 📞 Contacto

**Problemas con CI/CD**:
- Revisar logs de GitHub Actions
- Check `.github/workflows/` para configuración
- Verificar secrets en GitHub Settings → Secrets and variables → Actions

**Problemas con VPS**:
- SSH al servidor: `ssh user@vps-ip`
- Check logs: `docker compose logs -f`
- Ver documentación: [docs/DEPLOYMENT_RUNBOOKS.md](./DEPLOYMENT_RUNBOOKS.md)

---

**Última actualización**: 2025-01-05
**Estado**: ✅ Production Ready
