# 🚀 Quick Start Guide - Ordo-Todo

## Pre-requisitos

- **Node.js** 18+ instalado
- **PostgreSQL** (local o cloud)
- **Docker** (opcional, recomendado para DB)
- **npm** o **pnpm**

---

## Setup en 5 Minutos

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/tiagofur/ordo-todo.git
cd ordo-todo
npm install
```

### 2. Levantar la base de datos

**Opción A: Docker (Recomendado)**
```bash
docker-compose up -d
```

**Opción B: Cloud (Free Tier)**
- [Supabase](https://supabase.com) o [Neon](https://neon.tech)
- Crea un proyecto y copia la connection string

### 3. Configurar variables de entorno

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env

# Base de datos
cp packages/db/.env.example packages/db/.env
```

Actualiza `DATABASE_URL` si es necesario:
```env
DATABASE_URL="postgresql://ordo:ordo_dev_password@localhost:5432/ordo_todo"
```

### 4. Preparar la base de datos

```bash
# Desde la raíz del proyecto
cd packages/db
npx prisma generate
npx prisma db push
```

### 5. Compilar paquetes compartidos

```bash
# Desde la raíz
npm run build --filter=@ordo-todo/core
npm run build --filter=@ordo-todo/api-client
```

### 6. Iniciar el proyecto

```bash
# Opción A: Todo junto (recomendado)
npm run dev

# Opción B: Servicios individuales
# Terminal 1: Backend
cd apps/backend && npm run start:dev

# Terminal 2: Web
cd apps/web && npm run dev

# Terminal 3: Desktop (opcional)
cd apps/desktop && npm run dev
```

### 7. Abrir en el navegador

| App | URL |
|-----|-----|
| **Web** | http://localhost:3000 |
| **Backend API** | http://localhost:3101/api |
| **Prisma Studio** | `npx prisma studio` (desde packages/db) |

---

## ✅ Verificar Instalación

1. **Web App**: Abre http://localhost:3000, debe cargar la landing page
2. **Backend**: Abre http://localhost:3101/api, debe responder con datos del API
3. **Base de datos**: Ejecuta `npx prisma studio` y verifica las tablas

---

## 🎯 Próximos Pasos

1. **Registra una cuenta** en la web app
2. **Crea un workspace** (Personal o Trabajo)
3. **Crea un proyecto** dentro del workspace
4. **Crea tareas** y prueba el timer Pomodoro

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev                    # Todos los servicios
npm run dev --filter=web       # Solo web
npm run dev --filter=backend   # Solo backend

# Base de datos
cd packages/db
npx prisma studio              # GUI de base de datos
npx prisma db push             # Aplicar cambios de schema
npx prisma generate            # Regenerar cliente

# Build
npm run build                  # Build de producción

# Linting & Types
npm run lint                   # ESLint
npm run check-types            # TypeScript
```

---

## 🐛 Troubleshooting

### Puerto en uso
```bash
npx kill-port 3000
npx kill-port 3101
```

### Error de Prisma
```bash
cd packages/db
rm -rf node_modules/.prisma
npx prisma generate
```

### Error de módulos
```bash
rm -rf node_modules
npm install
npm run build
```

---

## 📚 Más Documentación

- **[Setup Completo](./SETUP_AND_TESTING.md)** - Guía detallada paso a paso
- **[Arquitectura](../design/ARCHITECTURE.md)** - Entender la estructura del proyecto
- **[i18n](./internationalization.md)** - Configurar traducciones

---

**¿Problemas?** Revisa [troubleshooting/](../troubleshooting/) o abre un issue en GitHub.
