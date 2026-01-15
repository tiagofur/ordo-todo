# 🚀 ORDO: The Creator's OS

<div align="center">

![Ordo Banner](https://via.placeholder.com/1200x400.png?text=ORDO:+Ship+More,+Manage+Less)
<!-- TODO: Reemplazar con banner real de diseño Neón/Dark -->

**Deja de perder ideas. Publica con consistencia.**

[![TurboRepo](https://img.shields.io/badge/Monorepo-Turborepo-ef4444?style=flat-square&logo=turborepo)](https://turbo.build/)
[![Next.js](https://img.shields.io/badge/Web-Next.js_16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/API-NestJS-e0234e?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![Expo](https://img.shields.io/badge/Mobile-Expo_52-4630eb?style=flat-square&logo=expo)](https://expo.dev/)
[![Status](https://img.shields.io/badge/Status-Validation_Phase-yellow?style=flat-square)]()

[🌐 Website](https://ordotodo.com) · [🐞 Report Bug](https://github.com/tiagofur/ordo-creators/issues) · [💡 Request Feature](https://github.com/tiagofur/ordo-creators/issues)

</div>

---

## 🧭 Manifesto: ¿Por qué Ordo?

El mercado de las "To-Do Apps" es un océano rojo saturado. No estamos construyendo otra lista para recordar comprar leche.

**Ordo es un Sistema Operativo para Creadores de Contenido Caóticos.**

Nuestro enemigo no es Todoist. **Nuestro enemigo es Notion** (demasiado complejo/manual) y las **Notas del celular** (donde las ideas van a morir).

Los creadores fallan no por falta de talento, sino por falta de **sistemas**. Ordo es "Opinionated Software" (Software con Opinión). No te damos una hoja en blanco; te damos un flujo de trabajo probado para pasar de **Idea ➔ Publicado**.

---

## 💎 Killer Features (La Propuesta de Valor)

### 1. 🌊 The Content Pipeline
Las tareas no son checks binarios (`true/false`). El contenido es un flujo vivo.
*   **Visual Board:** Kanban especializado con estados fijos: `Idea` ➔ `Scripting` ➔ `Filming` ➔ `Editing` ➔ `Scheduled` ➔ `Published`.
*   **Social Previews:** WYSIWYG que muestra cómo se verá tu post en Twitter/LinkedIn mientras lo escribes.

### 2. 🧠 Frictionless Capture (WhatsApp/Telegram Bot)
*   **El problema:** Las mejores ideas ocurren en la ducha o conduciendo. Abrir una app web crea fricción.
*   **La solución:** Envía una nota de voz o texto a nuestro Bot. La IA lo transcribe, lo resume y crea automáticamente una tarjeta en la columna "Ideas".

### 3. ♻️ The Remix Engine (Atomización)
Cuando marcas un video de YouTube como "Publicado", Ordo te pregunta: *"¿Quieres atomizar esto?"*.
*   Genera automáticamente sub-tareas para: Hilo de Twitter, Short de TikTok y Post de LinkedIn basados en el guion original.

### 4. 📈 Consistency Score (Gamificación)
Métricas reales para motivar, no para estresar.
*   "Racha de 3 semanas publicando".
*   "Tu mejor hora para crear es los martes por la noche".

### 5. 🤖 AI Copilot (Writer's Unblock)
*   **Title Generator:** Genera 10 variaciones virales para tu título.
*   **Idea Expander:** Convierte una línea de texto en un outline de 5 puntos.

### 6. ❄️ The Idea Graveyard
Limpieza automática. Si una idea lleva 30 días en el backlog sin tocarse, se mueve al "Cementerio". Reduce la ansiedad visual y mantiene el foco en lo fresco.

---

## 🏗️ Arquitectura Técnica

Utilizamos un **Monorepo con Turborepo** para compartir lógica de negocio, tipos y configuraciones entre todas las plataformas.

### Stack Tecnológico

| Capa | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Monorepo** | **Turborepo** | Gestión de workspaces y build caching. |
| **Web** | **Next.js 16 (App Router)** | React 19, Server Components, TailwindCSS 4. |
| **Mobile** | **React Native (Expo 52)** | Código compartido con web para iOS/Android. |
| **Desktop** | **Electron + Vite** | Experiencia nativa para power users. |
| **Backend** | **NestJS** | Arquitectura modular, TypeScript estricto. |
| **Database** | **PostgreSQL 16** | Relacional. Gestionada con **Prisma 6**. |
| **Auth** | **Passport.js (JWT)** | Autenticación global unificada. |

### Estructura del Proyecto

```bash
ordo-creators/
├── apps/
│   ├── web/           # Next.js: Dashboard principal para creadores
│   ├── mobile/        # React Native: Captura rápida y gestión on-the-go
│   ├── desktop/       # Electron: App de escritorio para "Deep Work"
│   └── backend/       # NestJS: API REST + AI Orchestration
├── packages/
│   ├── core/          # DDD Domain: Entidades, Interfaces, Lógica pura
│   ├── db/            # Prisma Schema y Cliente generado
│   ├── api-client/    # Cliente HTTP tipado compartido (TanStack Query)
│   ├── ui/            # Sistema de Diseño (Componentes compartidos)
│   └── config/        # ESLint, TSConfig, Tailwind presets
└── docker/            # Configuración de infraestructura
```

---

## 🚀 Developer Quick Start

### Requisitos
*   Node.js 20+
*   Docker (para la base de datos)

### 1. Instalación
```powershell
# Clonar repo
git clone https://github.com/tiagofur/ordo-creators.git
cd ordo-creators

# Instalar dependencias (Root)
npm install
```

### 2. Configuración de Entorno
Copia el `.env.example` en `apps/backend` y configura las variables críticas.
```powershell
cd apps/backend
cp .env.example .env
# Editar: DATABASE_URL, OPENAI_API_KEY, JWT_SECRET
```

### 3. Base de Datos
Levanta PostgreSQL y sincroniza el esquema.
```powershell
# Levantar DB con Docker
docker-compose up -d

# Push del esquema Prisma
npx prisma db push
npx prisma generate
```

### 4. Ejecutar Entorno de Desarrollo
Un solo comando para gobernarlos a todos (Web, Backend, Mobile).
```powershell
# Desde la raíz del proyecto
npm run dev
```
*   **Web:** http://localhost:3000
*   **API:** http://localhost:3001
*   **Swagger:** http://localhost:3001/api/docs
*   **Prisma Studio:** `npx prisma studio`

---

## 🛣️ Roadmap de Ejecución

### Fase 1: Validación & MVP (Actual)
- [x] Definición de Arquitectura Monorepo.
- [ ] **Landing Page "Fake Door"** (Captura de emails).
- [ ] Backend: CRUD de "Series" y "Content Pieces".
- [ ] Frontend: Tablero Kanban básico con Drag & Drop.

### Fase 2: The Workflow (El MVP Manual)
- [ ] Bot de Telegram para captura rápida (Webhook endpoint).
- [ ] Integración básica con OpenAI (generación de títulos).
- [ ] Vista de Calendario.
- [ ] "Idea Graveyard" Job (Cron que archiva ideas viejas).

### Fase 3: Growth & Monetización
- [ ] Sistema de Suscripción (Stripe).
- [ ] The Remix Engine (Generación de sub-tareas).
- [ ] Analytics Dashboard (Consistency Score).
- [ ] Public Roadmaps (Build in Public widget).

---

## 🤝 Contribución

Este proyecto es "Opinionated", pero estamos abiertos a mejoras.
1. Haz un Fork del proyecto.
2. Crea tu Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit a tus cambios (`git commit -m 'Add some AmazingFeature'`).
4. Push al Branch (`git push origin feature/AmazingFeature`).
5. Abre un Pull Request.

---

> **"No construyas para todos. Construye para alguien. Si a ese alguien le encanta, has ganado."**
>
> — Equipo Ordo
