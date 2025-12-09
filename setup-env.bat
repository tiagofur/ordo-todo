@echo off
echo ================================================
echo   Ordo-Todo - Setup de Desarrollo
echo ================================================
echo.

REM Crear .env para packages/db
echo [1/3] Creando packages/db/.env...
(
echo # Database
echo DATABASE_URL="postgresql://ordo:ordo_dev_password@localhost:3433/ordo_todo"
) > packages\db\.env
echo ✓ Creado packages/db/.env

REM Crear .env.local para apps/web
echo [2/3] Creando apps/web/.env.local...
(
echo # Database
echo DATABASE_URL="postgresql://ordo:ordo_dev_password@localhost:3433/ordo_todo"
echo.
echo # NextAuth
echo NEXTAUTH_SECRET="dev-secret-key-change-in-production-min-32-chars-long"
echo NEXTAUTH_URL="http://localhost:3000"
echo.
echo # OAuth ^(opcional para desarrollo^)
echo # GOOGLE_CLIENT_ID=""
echo # GOOGLE_CLIENT_SECRET=""
) > apps\web\.env.local
echo ✓ Creado apps/web/.env.local

echo [3/3] Archivos .env creados exitosamente
echo.
echo ================================================
echo   Próximos pasos:
echo ================================================
echo   1. docker-compose up -d
echo   2. cd packages/db ^&^& npx prisma generate
echo   3. npx prisma db push
echo   4. npm run dev
echo ================================================
