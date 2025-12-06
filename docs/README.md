# 📚 Ordo-Todo Documentation

> **Última actualización:** Diciembre 2025

Bienvenido a la documentación de **Ordo-Todo**, una plataforma moderna de gestión de tareas multiplataforma construida con **DDD** y **Clean Architecture**.

---

## 📁 Estructura de Documentación

```
docs/
├── README.md                    # Este archivo (índice principal)
├── ROADMAP.md                   # Roadmap de desarrollo actualizado
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
│   └── README.md                # Core, DB, API Client, UI, Hooks
│
├── web/                         # 🌐 Web App (Next.js)
│   └── README.md                # Setup, estructura, features
│
├── mobile/                      # 📱 Mobile App (React Native)
│   └── README.md                # Setup, roadmap, estado
│
├── desktop/                     # 🖥️ Desktop App (Electron)
│   └── README.md                # Features nativos, build
│
├── backend/                     # ⚙️ API (NestJS)
│   ├── README.md                # Endpoints reference
│   └── ai-features.md           # Sistema de IA
│
└── troubleshooting/             # 🔧 Solución de Problemas
    └── hmr-errors.md            # Errores comunes
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

| App | Documentación |
|-----|---------------|
| 🌐 **Web** | [web/README.md](./web/README.md) |
| 📱 **Mobile** | [mobile/README.md](./mobile/README.md) |
| 🖥️ **Desktop** | [desktop/README.md](./desktop/README.md) |
| ⚙️ **Backend** | [backend/README.md](./backend/README.md) |

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
│   └── i18n/         # Internacionalización
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

Ver **[ROADMAP.md](./ROADMAP.md)** para detalles completos.

---

## 🔗 Enlaces Rápidos

| Recurso | Descripción |
|---------|-------------|
| [QUICKSTART.md](./getting-started/QUICKSTART.md) | Comenzar en 5 minutos |
| [ARCHITECTURE.md](./design/ARCHITECTURE.md) | Decisiones de arquitectura |
| [packages/README.md](./packages/README.md) | Cómo usar los packages |
| [ROADMAP.md](./ROADMAP.md) | Estado y próximos pasos |

---

**¿Preguntas?** Revisa [troubleshooting/](./troubleshooting/) o abre un issue en GitHub.
