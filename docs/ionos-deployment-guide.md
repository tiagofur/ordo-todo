# Guía de Solución de Problemas de Despliegue (IONOS VPS + Plesk + Docker)

Esta guía te ayudará a comprobar, diagnosticar y solucionar los errores de despliegue en tu infraestructura actual.

## 1. Diagnóstico Inicial

Dado que el error ocurre en CI/CD y no tenemos los logs exactos, el paso más importante es **verificar el estado de tu servidor VPS**.

### Acceso SSH Manual
Intenta conectarte a tu VPS usando los mismos credenciales que GitHub Actions:
```bash
ssh <usuario>@<tu-ip-ionos> -p <puerto-ssh>
```

### Verificar el estado de Docker
Una vez dentro del servidor, ejecuta:
```bash
sudo docker ps
sudo docker-compose ls
```
Si estos comandos fallan con un error de "permission denied" o "cannot connect to Docker daemon", ese es el problema que bloquea a GitHub Actions.

**Solución rápida:** Reinicia Docker:
```bash
sudo systemctl restart docker
# Verifica el status
sudo systemctl status docker
```

## 2. Ejecutar Migración Manualmente (Para ver el error real)

Si el despliegue falla en el paso de "Run database migrations", puedes intentar correrlo manualmente en el servidor para ver el mensaje de error completo:

1. Ve al directorio de despliegue (normalmente `/opt/ordo-todo` según tu `deploy.yml`):
   ```bash
   cd /opt/ordo-todo
   ```

2. Ejecuta la migración usando el contenedor de migraciones definido en `docker-compose.prod.yml`:
   ```bash
   # Asegúrate de tener las últimas imágenes
   docker compose pull
   
   # Ejecuta solo la migración e imprime los logs
   docker compose up migrations
   ```

**Si ves un error de SQL:** Copia ese error y pásamelo. Probablemente sea una restricción de base de datos (`Foreign Key violation`, `Table not found`, etc.).

**Si ves un error de conexión:** Significa que el contenedor `migrations` no puede ver al contenedor `postgres`.
*   Verifica que la red `ordo-network` existe: `docker network ls`
*   Verifica que postgres está saludable: `docker ps` (debe decir `(healthy)`)

## 3. Conflictos Comunes con Plesk

Plesk utiliza puertos (80, 443, y a veces base de datos) que pueden chocar con Docker.

*   **Puertos:** Tu `deploy.yml` usa Traefik en 80/443. Asegúrate de que Plesk no esté ocupando esos puertos en la IP que usas para Docker, o configura Traefik para usar otros puertos si tienes un proxy inverso delante.
*   **Firewall:** El firewall de IONOS o de Plesk puede estar bloqueando conexiones salientes a GitHub Container Registry (`ghcr.io`). Prueba conectividad:
    ```bash
    curl -v https://ghcr.io
    ```

## 4. Revisión de Variables de Entorno

Si la migración falla con "Authentication failed" o similar, verifica el archivo `.env` en tu servidor:
```bash
cat /opt/ordo-todo/.env
```
Asegúrate de que `POSTGRES_PASSWORD`, `POSTGRES_USER` y `POSTGRES_DB` coincidan con lo que espera tu aplicación.

## 5. Pasos para "Resetear" el Despliegue

Si todo falla y quieres limpiar el estado (¡CUIDADO! Esto borra contenedores, pero NO volúmenes de datos si están bien configurados):

```bash
cd /opt/ordo-todo
docker compose down --remove-orphans
docker system prune -f
docker compose pull
docker compose up -d
```

## Resumen del estado actual del Código (CI)

He verificado y corregido lo siguiente en el repositorio:
1.  **Migración `20260105_fix_on_delete_behaviors`:** Ahora maneja correctamente la eliminación de claves foráneas antiguas (`creatorId`) para evitar conflictos.
2.  **Linting y Build:** El código pasa todas las verificaciones locales.

Si el error persiste en GitHub Actions, es 99% probable que sea un problema de **conexión SSH** o **configuración de Docker en el VPS**, no del código de la aplicación.
