# 🚀 Comandos Rápidos - Despliegue Ordo-Todo

## En el Servidor (via Plesk Terminal)

### Ubicación
```bash
cd /opt/ordo-todo
```

### Ver estado de contenedores
```bash
docker compose ps
```

### Ver logs
```bash
docker compose logs -f           # Todos
docker compose logs -f backend   # Solo backend
docker compose logs -f web       # Solo web
```

### Descargar imágenes nuevas
```bash
docker compose pull
```

### Iniciar/Reiniciar servicios
```bash
docker compose up -d             # Iniciar
docker compose restart           # Reiniciar
docker compose down              # Detener
```

### Ejecutar migraciones
```bash
docker compose up migrations
```

### Login a GitHub Container Registry
```bash
docker login ghcr.io -u tiagofur -p TU_TOKEN
```

---

## En tu Máquina Local (PowerShell/Git Bash)

### Hacer deploy manualmente
```bash
git add .
git commit -m "feat: tu mensaje"
git push origin main
```

### Re-ejecutar CI si falló
```bash
git commit --allow-empty -m "retry: trigger CI"
git push origin main
```

---

## URLs Importantes

| Recurso | URL |
|---------|-----|
| Web App | https://ordotodo.app |
| API | https://api.ordotodo.app |
| API Health | https://api.ordotodo.app/health |
| Plesk Panel | https://74.208.234.244:8443 |
| GitHub Actions | https://github.com/tiagofur/ordo-todo/actions |
| GitHub Secrets | https://github.com/tiagofur/ordo-todo/settings/secrets/actions |
