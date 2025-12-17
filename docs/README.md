# 📚 Ordo-Todo Documentation

> **Última actualización:** Diciembre 2025

Bienvenido a la documentación de **Ordo-Todo**, una plataforma moderna de gestión de tareas multiplataforma construida con **DDD** y **Clean Architecture**.

---

## 📁 Estructura de Documentación

```
docs/
├── README.md                    # Este archivo (índice principal)
├── ROADMAP.md                   # Roadmap de desarrollo actualizado
├── COMPONENT_GUIDELINES.md      # Guías para crear componentes compartidos
├── PRICING-STRATEGY.md          # Estrategia de pricing
├── USER_GUIDE.md                # Guía de usuario final
│
├── getting-started/             # 🚀 Comenzar aquí
│   ├── QUICKSTART.md            # Setup rápido (5 minutos)
│   ├── SETUP_AND_TESTING.md     # Guía completa de instalación
│   └── internationalization.md  # Guía de i18n
│
├── design/                      # 🎨 Diseño y Arquitectura
│   ├── ARCHITECTURE.md          # Arquitectura DDD + Clean Architecture
│   ├── PRD.md                   # Product Requirements Document
│   ├── TECHNICAL_DESIGN.md      # Especificaciones técnicas
│   ├── WIREFRAMES.md            # Diseños UI/UX
│   └── DESIGN_GUIDELINES.md     # Guías de diseño visual
│
├── packages/                    # 📦 Packages Compartidos
│   ├── README.md                # Core, DB, API Client, UI, Hooks
│   └── fases.md                 # Estado de migración de packages
│
├── mejoras-competencia/         # 🚀 Features Competitivos
│   ├── README.md                # Índice de mejoras
│   ├── COMPETITIVE-ANALYSIS.md  # Análisis de competencia
│   ├── WEB-PRODUCTION-CHECKLIST.md # Checklist de producción
│   ├── 01-HABIT-TRACKER.md      # Sistema de hábitos
│   ├── 02-SMART-DATES.md        # Start/Scheduled/Due dates
│   ├── 03-OKRS-GOALS.md         # Sistema OKRs
│   ├── 04-TIME-BLOCKING.md      # Time blocking
│   ├── 05-CUSTOM-FIELDS.md      # Campos personalizados
│   └── 06-AI-FEATURES.md        # AI Features
│
├── web/                         # 🌐 Web App (Next.js)
│   ├── README.md                # Setup, estructura, features
│   ├── ROADMAP.md               # Roadmap específico web
│   ├── BEST-PRACTICES.md        # Mejores prácticas
│   ├── PERFORMANCE-GUIDE.md     # Optimización rendimiento
│   ├── MAINTENANCE.md           # Guía de mantenimiento
│   └── TROUBLESHOOTING.md       # Solución de problemas
│
├── backend/                     # ⚙️ API (NestJS)
│   ├── README.md                # Endpoints reference
│   ├── ARCHITECTURE.md          # Arquitectura backend
│   ├── SECURITY.md              # Seguridad backend
│   ├── IMPROVEMENTS.md          # Mejoras planificadas
│   └── ai-features.md           # Sistema de IA
│
├── mobile/                      # 📱 Mobile App (React Native)
│   └── README.md                # Setup, roadmap, estado
│
├── desktop/                     # 🖥️ Desktop App (Electron)
│   ├── README.md                # Features nativos, build
│   ├── analysis-report.md       # Análisis de paridad
│   └── developer-needs-assessment.md # Necesidades dev
│
├── deployment/                  # 🚀 Deployment
│   ├── DEPLOYMENT-STATUS.md     # Estado de deployment
│   └── QUICK-COMMANDS.md        # Comandos rápidos
│
├── troubleshooting/             # 🔧 Solución de Problemas
│   └── hmr-errors.md            # Errores HMR
│
├── DEPENDENCY_MANAGEMENT.md     # 📦 Gestión de dependencias
├── DEPENDABOT_CLEANUP.md        # 🤖 Guía Dependabot
└── SECURITY_REPORT.md           # 🔒 Reporte de seguridad
```

---

## 🚀 ¿Por dónde empezar?

### Nuevo en el proyecto

1. **[QUICKSTART.md](./getting-started/QUICKSTART.md)** - Levanta el proyecto en 5 minutos
2. **[SETUP_AND_TESTING.md](./getting-started/SETUP_AND_TESTING.md)** - Guía detallada

### Entender la arquitectura

1. **[ARCHITECTURE.md](./design/ARCHITECTURE.md)** - Decisiones de arquitectura DDD
2. **[packages/README.md](./packages/README.md)** - Cómo funcionan los packages

### Trabajar en una app específica

| App | Documentación | Estado |
|-----|---------------|--------|
| 🌐 **Web** | [web/README.md](./web/README.md) | ✅ Producción |
| 📱 **Mobile** | [mobile/README.md](./mobile/README.md) | 🟡 En Progreso |
| 🖥️ **Desktop** | [desktop/README.md](./desktop/README.md) | ✅ Funcional |
| ⚙️ **Backend** | [backend/README.md](./backend/README.md) | ✅ Estable |

---

## 🏗️ Arquitectura del Proyecto

```
ordo-todo/
├── apps/
│   ├── backend/      # NestJS REST API (Puerto 3101)
│   ├── web/          # Next.js App (Puerto 3000)
│   ├── mobile/       # React Native + Expo
│   └── desktop/      # Electron + React
│
├── packages/
│   ├── core/         # Lógica de dominio (DDD)
│   ├── db/           # Prisma Client & Schema
│   ├── api-client/   # Cliente HTTP tipado
│   ├── ui/           # Componentes UI compartidos
│   ├── hooks/        # React Hooks compartidos
│   ├── i18n/         # Internacionalización
│   └── styles/       # Estilos compartidos (Tailwind v4)
│
└── docs/             # Esta documentación
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Monorepo** | Turborepo |
| **Frontend Web** | Next.js 16, React 19, TailwindCSS v4 |
| **Frontend Mobile** | React Native, Expo SDK 52+ |
| **Frontend Desktop** | Electron, Vite, React |
| **Backend** | NestJS, REST API |
| **Base de Datos** | PostgreSQL 16 + Prisma ORM |
| **IA** | Google Gemini (genai SDK) |
| **Arquitectura** | DDD + Clean Architecture |

---

## 📊 Estado del Proyecto

| Componente | Estado | Progreso |
|------------|--------|----------|
| **Backend** | ✅ Estable | 95% |
| **Web** | ✅ Producción | 90% |
| **Desktop** | ✅ Funcional | 85% |
| **Mobile** | 🟡 En Progreso | 60% |
| **Packages** | ✅ Estable | 90% |
| **AI Features** | ✅ Implementado | 80% |

Ver **[ROADMAP.md](./ROADMAP.md)** para detalles completos.

---

## ✅ Features Principales Implementados

### Core
- ✅ Gestión de tareas con subtareas
- ✅ Proyectos y workspaces
- ✅ Timer Pomodoro avanzado
- ✅ Gamificación (XP, niveles, logros)
- ✅ Vistas: Lista, Kanban, Calendario

### Features Avanzados
- ✅ [Habit Tracker](./mejoras-competencia/01-HABIT-TRACKER.md) - Sistema de hábitos con streaks
- ✅ [Smart Dates](./mejoras-competencia/02-SMART-DATES.md) - Start/Scheduled/Due dates
- ✅ [OKRs/Goals](./mejoras-competencia/03-OKRS-GOALS.md) - Objetivos con Key Results
- ✅ [Time Blocking](./mejoras-competencia/04-TIME-BLOCKING.md) - Calendario con bloques
- ✅ [Custom Fields](./mejoras-competencia/05-CUSTOM-FIELDS.md) - 8 tipos de campos

### AI Features
- ✅ Smart Semantic Search - Búsqueda en lenguaje natural
- ✅ AI Meeting Assistant - Transcripción → Tareas
- ✅ Burnout Prevention Engine - Detección de burnout
- ✅ Focus Sessions Audio - Sonidos ambient
- ✅ Weekly AI Reports - Reportes de productividad

---

## 🔗 Enlaces Rápidos

| Recurso | Descripción |
|---------|-------------|
| [QUICKSTART.md](./getting-started/QUICKSTART.md) | Comenzar en 5 minutos |
| [ARCHITECTURE.md](./design/ARCHITECTURE.md) | Decisiones de arquitectura |
| [COMPETITIVE-ANALYSIS.md](./mejoras-competencia/COMPETITIVE-ANALYSIS.md) | Análisis competitivo |
| [ROADMAP.md](./ROADMAP.md) | Estado y próximos pasos |
| [SECURITY_REPORT.md](./SECURITY_REPORT.md) | Reporte de seguridad |

---

## 🔒 Seguridad

- **Vulnerabilidades críticas:** 0
- **Última auditoría:** Diciembre 2025
- Ver [SECURITY_REPORT.md](./SECURITY_REPORT.md) para más detalles.

---

**¿Preguntas?** Revisa [troubleshooting/](./troubleshooting/) o abre un issue en GitHub.
