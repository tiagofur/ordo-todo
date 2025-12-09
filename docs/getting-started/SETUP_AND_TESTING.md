---
description: Guía completa para configurar y probar la aplicación Ordo-Todo
---

# 🚀 Guía de Setup y Testing - Ordo-Todo

Esta guía te llevará paso a paso para configurar el entorno de desarrollo y probar la aplicación web.

## 📋 Pre-requisitos

Antes de comenzar, asegúrate de tener instalado:

- ✅ **Node.js** (v18 o superior)
- ✅ **npm** o **pnpm**
- ✅ **Docker Desktop** (para PostgreSQL)
- ✅ **Git**

## 🐳 Paso 1: Levantar la Base de Datos (Docker)

### 1.1 Iniciar PostgreSQL con Docker Compose

```bash
# Desde la raíz del proyecto
docker-compose up -d
```

Este comando:
- Descarga la imagen de PostgreSQL 15
- Crea un contenedor llamado `ordo-todo-db`
- Expone el puerto 3433
- Crea la base de datos `ordo_todo`
- Usuario: `ordo`
- Password: `ordo_dev_password`

### 1.2 Verificar que el contenedor está corriendo

```bash
docker ps
```

Deberías ver algo como:
```
CONTAINER ID   IMAGE                COMMAND                  STATUS         PORTS                    NAMES
xxxxx          postgres:15-alpine   "docker-entrypoint.s…"   Up 10 seconds  0.0.0.0:3433->5432/tcp   ordo-todo-db
```

### 1.3 Verificar conexión a la base de datos

```bash
docker exec -it ordo-todo-db psql -U ordo -d ordo_todo
```

Si conecta correctamente, verás el prompt de PostgreSQL:
```
ordo_todo=#
```

Sal con `\q`

## ⚙️ Paso 2: Configurar Variables de Entorno

### 2.1 Crear archivo .env para la base de datos

```bash
# En packages/db/
cp .env.example .env
```

El archivo `.env` ya debe contener:
```bash
DATABASE_URL="postgresql://ordo:ordo_dev_password@localhost:3433/ordo_todo"
```

### 2.2 Crear archivo .env para la aplicación web

```bash
# En apps/web/
cp .env.example .env
```

Asegúrate de que contenga:
```bash
# Database
DATABASE_URL="postgresql://ordo:ordo_dev_password@localhost:3433/ordo_todo"

# NextAuth
NEXTAUTH_SECRET="tu-secret-key-super-segura-cambiala-en-produccion"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (opcional para testing inicial)
# GOOGLE_CLIENT_ID="..."
# GOOGLE_CLIENT_SECRET="..."
```

## 📦 Paso 3: Instalar Dependencias

```bash
# Desde la raíz del proyecto
npm install

# O si usas pnpm
pnpm install
```

## 🗄️ Paso 4: Configurar la Base de Datos con Prisma

### 4.1 Generar el cliente de Prisma

```bash
cd packages/db
npx prisma generate
```

### 4.2 Aplicar el schema a la base de datos

```bash
npx prisma db push
```

Este comando:
- Lee el archivo `schema.prisma`
- Crea todas las tablas en PostgreSQL
- Aplica relaciones y constraints

### 4.3 (Opcional) Abrir Prisma Studio para ver la DB

```bash
npx prisma studio
```

Esto abre una interfaz web en `http://localhost:5555` donde puedes ver y editar datos.

## 🏗️ Paso 5: Compilar el Proyecto

### 5.1 Compilar el paquete core

```bash
# Desde la raíz
npx turbo run build --filter=@ordo-todo/core
```

### 5.2 Verificar que no hay errores de TypeScript

```bash
cd apps/web
npx tsc --noEmit
```

Si todo está bien, no debería mostrar ningún error.

## 🚀 Paso 6: Levantar el Backend/Frontend

### 6.1 Modo Desarrollo

```bash
# Desde la raíz del proyecto
npm run dev

# O específicamente para web
cd apps/web
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

### 6.2 Verificar que el servidor está corriendo

Deberías ver en la consola:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in Xs
```

## 🧪 Paso 7: Probar la Aplicación Web

### 7.1 Crear una cuenta

1. Abre http://localhost:3000
2. Ve a "Sign Up" o "Registrarse"
3. Crea una cuenta con email y contraseña

### 7.2 Flujo de prueba completo

#### A. Workspaces
1. Navega a la página principal
2. En el sidebar, haz clic en el selector de workspace (abajo)
3. Crea un nuevo workspace:
   - Nombre: "Mi Workspace de Prueba"
   - Tipo: Personal/Work/Team
   - Color: Elige uno

#### B. Projects
1. Ve a "Proyectos" en el sidebar
2. Clic en "Nuevo Proyecto"
3. Crea un proyecto:
   - Nombre: "Proyecto de Prueba"
   - Color: Elige uno
   - Descripción: (opcional)

#### C. Tags
1. Ve a "Etiquetas" en el sidebar
2. Clic en "Nueva Etiqueta"
3. Crea algunas etiquetas:
   - "Urgente" (rojo)
   - "Personal" (azul)
   - "Trabajo" (verde)

#### D. Tasks
1. Ve a "Tareas" en el sidebar
2. Clic en "Nueva Tarea"
3. Crea una tarea:
   - Título: "Mi primera tarea"
   - Descripción: "Descripción de prueba"
   - Prioridad: Alta
   - Fecha de vencimiento: Mañana
4. Asigna etiquetas a la tarea
5. Marca la tarea como completada
6. Prueba los filtros (por estado, prioridad)
7. Cambia entre vista List/Grid

#### E. Timer/Pomodoro Avanzado
1. Ve a "Timer" en el sidebar
2. Selecciona una tarea del buscador ("Seleccionar tarea...")
3. Inicia el timer (Play)
4. **Prueba de Cambio de Tarea:**
   - Mientras el timer corre, selecciona *otra* tarea diferente
   - Verifica que el timer NO se detiene
   - Verifica que internamente se registraron dos sesiones (una para cada tarea)
5. **Prueba de Completado Continuo:**
   - Mientras trabajas en una tarea, haz clic en el botón ✅ verde junto al selector
   - Verifica que la tarea se marca como completada
   - Verifica que el selector se limpia
   - Verifica que el timer SIGUE corriendo para que elijas la siguiente tarea
6. Prueba pausar/reanudar y detener
7. Observa el widget en el sidebar actualizándose en tiempo real

#### F. Settings
1. Ve a "Configuración" en el sidebar
2. Ajusta configuraciones del timer:
   - Duración de trabajo
   - Duración de descansos
   - Auto-inicio
3. Guarda cambios

### 7.3 Verificar datos en la base de datos

```bash
cd packages/db
npx prisma studio
```

Verifica que se crearon:
- ✅ Usuarios en la tabla `User`
- ✅ Workspaces en `Workspace`
- ✅ Projects en `Project`
- ✅ Tasks en `Task`
- ✅ Tags en `Tag`
- ✅ Relaciones en `TaskTag`
- ✅ Sesiones de timer en `TimeSession`

## 🐛 Troubleshooting

### Problema: "Error connecting to database"

**Solución:**
```bash
# Verifica que Docker está corriendo
docker ps

# Si no está, inicia el contenedor
docker-compose up -d

# Verifica la conexión
docker exec -it ordo-todo-db psql -U ordo -d ordo_todo
```

### Problema: "Prisma Client not generated"

**Solución:**
```bash
cd packages/db
npx prisma generate
```

### Problema: "Module not found" o errores de importación

**Solución:**
```bash
# Reinstala dependencias
rm -rf node_modules
npm install

# Regenera Prisma
cd packages/db
npx prisma generate

# Recompila core
cd ../..
npx turbo run build --filter=@ordo-todo/core
```

### Problema: Puerto 3433 ya en uso

**Solución:**
```bash
# Detén otros servicios de PostgreSQL
# O cambia el puerto en docker-compose.yml:
ports:
  - "3434:5432"  # Usa 3434 en lugar de 3433

# Y actualiza DATABASE_URL:
DATABASE_URL="postgresql://ordo:ordo_dev_password@localhost:3434/ordo_todo"
```

## 🧹 Limpiar y Reiniciar

### Detener la base de datos

```bash
docker-compose down
```

### Eliminar datos y reiniciar

```bash
# Elimina el contenedor y los datos
docker-compose down -v

# Vuelve a crear
docker-compose up -d

# Reaplica el schema
cd packages/db
npx prisma db push
```

## ✅ Checklist de Testing

- [ ] Docker corriendo
- [ ] Base de datos conectada
- [ ] Dependencias instaladas
- [ ] Prisma generado
- [ ] Schema aplicado
- [ ] Servidor corriendo en localhost:3000
- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Crear workspace funciona
- [ ] Crear proyecto funciona
- [ ] Crear tarea funciona
- [ ] Crear tag funciona
- [ ] Asignar tag a tarea funciona
- [ ] Completar tarea funciona
- [ ] Filtros de tareas funcionan
- [ ] Timer funciona
- [ ] Widget de timer actualiza en tiempo real
- [ ] Settings guarda cambios

## 🎉 ¡Listo!

Si todos los pasos funcionaron correctamente, tienes una aplicación Ordo-Todo completamente funcional corriendo localmente.

**Próximos pasos:**
- Implementar Analytics/Dashboard con datos reales
- Agregar más funcionalidades (sub-tareas, dependencias, etc.)
- Configurar OAuth para login social
- Deploy a producción

---

**¿Problemas?** Revisa la sección de Troubleshooting o verifica los logs:
```bash
# Logs de Docker
docker logs ordo-todo-db

# Logs de Next.js
# Aparecen en la terminal donde corriste npm run dev
```
