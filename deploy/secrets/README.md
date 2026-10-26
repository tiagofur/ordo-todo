# deploy/secrets/ — copias locales, NUNCA en git

Esta carpeta está ignorada por git (ver `.gitignore`): aquí se guardan las
copias locales de los secretos de producción para poder respaldarlos fuera del
repositorio. Contenido esperado:

- `env-vps-prod.<fecha>` — copia exacta de `/opt/ordo-todo/.env` del VPS.
- `github_actions_ordo` / `.pub` — clave SSH dedicada que usa GitHub Actions
  para desplegar (la privada está también en el secret `VPS_SSH_KEY`).

Si cambias algo en el `.env` del VPS, vuelve a copiarlo aquí:
`scp ordo-vps:/opt/ordo-todo/.env deploy/secrets/env-vps-prod.$(date +%F)`.
Respalda esta carpeta en tu gestor de contraseñas o disco cifrado.
