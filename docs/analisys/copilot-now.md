# 📊 Ordo-Todo - Estado Actual

## 🎯 Descripción General

Ordo-Todo es una plataforma moderna de gestión de tareas diseñada para maximizar la productividad personal. Construida sobre una arquitectura robusta de **DDD (Domain-Driven Design)** y **Clean Architecture** dentro de un monorepo gestionado por **Turborepo**.

La aplicación es verdaderamente **multiplataforma**, ofreciendo una experiencia sincronizada en:
- **Web** (PWA)
- **Mobile** (iOS/Android)
- **Desktop** (Electron)

---

## 🚀 Stack Tecnológico

El proyecto utiliza tecnologías de vanguardia para asegurar rendimiento y escalabilidad:

**Infraestructura:**
- **Monorepo:** Turborepo
- **Base de Datos:** PostgreSQL con Prisma ORM
- **Cache/Sesiones:** Redis

**Frontend:**
- **Web/Desktop:** React, TailwindCSS, Vite
- **Mobile:** React Native (Expo)
- **Desktop Wrapper:** Electron

**Backend:**
- **Framework:** NestJS (REST API)
- **Arquitectura:** Domain-Driven Design (DDD) + Clean Architecture

---

## ✅ Funcionalidades Implementadas

### 🔐 Autenticación y Usuarios
- Login tradicional (Email/Password) y OAuth (Google, GitHub)
- Gestión de sesiones segura con Redis
- Perfiles de usuario completos

### 📝 Gestión de Tareas (Core)
- CRUD completo de tareas y proyectos
- Sistema de prioridades (Low, Medium, High, Urgent)
- Fechas de vencimiento y estimación de tiempo
- **Modo Pomodoro Integrado:** Timer con tracking automático de sesiones y cambio de tareas "en vuelo"

### 📊 Analytics e Inteligencia
- Métricas diarias, semanales y mensuales
- **Focus Score:** Puntuación de productividad basada en el rendimiento
- **AIProfile:** Análisis de patrones de trabajo y horas pico

### 📱 Experiencia Nativa & PWA
- **Web:** Instalable como PWA con soporte Offline
- **Desktop:** Aplicación nativa (Windows/macOS/Linux) con controles de ventana y CI/CD automatizado
- **Mobile:** Haptic feedback, acciones rápidas y notificaciones push

---

## 🏗️ Arquitectura del Proyecto

El proyecto sigue una estructura estricta para garantizar la separación de responsabilidades:

```
ordo-todo/
├── apps/
│   ├── backend/      # NestJS REST API + Postgres
│   ├── web/          # Next.js / React App
│   ├── mobile/       # React Native Expo App
│   └── desktop/      # Electron Wrapper
├── packages/
│   ├── db/           # Prisma Client & Schema
│   ├── ui/           # Sistema de diseño compartido
│   ├── core/         # Lógica de dominio (DDD Entities, Use Cases)
│   └── config/       # Configuraciones compartidas (ESLint, TS, etc.)
```

---

## 🛠️ Instalación y Desarrollo

### Prerrequisitos
- Node.js >= 18
- Docker (para DB/Redis)

### Pasos de Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/ordo-todo.git
   cd ordo-todo
   ```

2. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno:**
   - Copiar `.env.example` a `.env` en las carpetas `apps/backend` y `packages/db`

4. **Iniciar infraestructura (DB & Redis):**
   ```bash
   docker-compose up -d
   ```

5. **Correr en modo desarrollo:**
   ```bash
   pnpm dev
   ```

---

## 🐛 Problemas Conocidos (Work in Progress)

Actualmente estamos en la versión **0.1.0-alpha**. Los siguientes puntos están siendo atendidos:

- ⚠️ Inconsistencias de idioma (mezcla de Español/Portugués/Inglés)
- ⚠️ La autenticación en la app móvil está pendiente de finalización

Para ver el plan de trabajo detallado, consulta el [ROADMAP.md](../ROADMAP.md).

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, asegúrate de seguir los lineamientos de Clean Architecture definidos en `packages/core`.

---

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**.