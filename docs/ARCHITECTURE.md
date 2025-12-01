# 🏗️ Ordo-Todo Architecture Document

## Decision Record: DDD + Clean Architecture Monorepo

**Date**: November 27, 2025  
**Status**: ✅ Approved  
**Authors**: Development Team

---

## 1. Executive Summary

Ordo-Todo adopta una arquitectura de **monorepo con Turborepo** siguiendo los principios de **Domain-Driven Design (DDD)** y **Clean Architecture**. Esta decisión se basa en el análisis del template TaskMaster y su adaptación a los requisitos del PRD.

### Beneficios Clave

| Beneficio | Impacto |
|-----------|---------|
| **Código compartido** | Core de dominio reutilizable entre web, mobile y desktop |
| **Type-safety end-to-end** | TypeScript desde DB hasta UI |
| **Testing puro** | Core testeable sin infraestructura |
| **Escalabilidad** | Fácil agregar nuevas apps/servicios |
| **Mantenibilidad** | Separación clara de responsabilidades |

---

## 2. Estructura del Monorepo

```
ordo-todo/
├── apps/
│   ├── web/                          # Next.js 16 (App Router)
│   │   ├── src/
│   │   │   ├── app/                  # Pages + API Routes
│   │   │   │   ├── (auth)/           # Auth pages group
│   │   │   │   ├── (dashboard)/      # Dashboard pages group
│   │   │   │   ├── api/
│   │   │   │   │   └── auth/[...nextauth]/
│   │   │   │   └── layout.tsx
│   │   │   ├── components/           # React components
│   │   │   │   ├── ui/               # shadcn/ui components
│   │   │   │   ├── tasks/            # Task-related components
│   │   │   │   ├── timer/            # Pomodoro timer
│   │   │   │   └── layout/           # Layout components
│   │   │   ├── hooks/                # Custom React hooks
│   │   │   ├── stores/               # Zustand stores
│   │   │   ├── lib/                  # Utilities & API Client
│   │   └── prisma/                   # Database schema
│   │
│   ├── mobile/                       # React Native + Expo
│   │   ├── app/                      # Expo Router
│   │   ├── components/
│   │   ├── hooks/
│   │   └── stores/
│   │
│   ├── backend/                      # NestJS (Main API Port 3101)
│   │   └── src/
│   │
│   └── db/                           # SQLite compartido (dev only)
│
├── packages/
│   ├── core/                         # 🎯 NÚCLEO DDD
│   │   ├── src/
│   │   │   ├── shared/               # Base classes + Value Objects
│   │   │   │   ├── entity.ts
│   │   │   │   ├── aggregate-root.ts
│   │   │   │   ├── value-object.ts
│   │   │   │   ├── use-case.ts
│   │   │   │   ├── domain-event.ts
│   │   │   │   └── value-objects/
│   │   │   │       ├── id.vo.ts
│   │   │   │       ├── email.vo.ts
│   │   │   │       ├── priority.vo.ts
│   │   │   │       ├── task-status.vo.ts
│   │   │   │       └── duration.vo.ts
│   │   │   │
│   │   │   ├── users/                # User Domain
│   │   │   │   ├── model/
│   │   │   │   │   └── user.entity.ts
│   │   │   │   ├── provider/
│   │   │   │   │   ├── user.repository.ts
│   │   │   │   │   └── crypto.provider.ts
│   │   │   │   └── usecase/
│   │   │   │       ├── register-user.usecase.ts
│   │   │   │       └── user-login.usecase.ts
│   │   │   │
│   │   │   ├── workspaces/           # Workspace Domain
│   │   │   │   ├── model/
│   │   │   │   ├── provider/
│   │   │   │   └── usecase/
│   │   │   │
│   │   │   ├── workflows/            # Workflow Domain
│   │   │   │   ├── model/
│   │   │   │   ├── provider/
│   │   │   │   └── usecase/
│   │   │   │
│   │   │   ├── projects/             # Project Domain
│   │   │   │   ├── model/
│   │   │   │   ├── provider/
│   │   │   │   └── usecase/
│   │   │   │
│   │   │   ├── tasks/                # 📋 AGGREGATE ROOT PRINCIPAL
│   │   │   │   ├── model/
│   │   │   │   │   ├── task.entity.ts
│   │   │   │   │   ├── subtask.entity.ts
│   │   │   │   │   └── checklist-item.entity.ts
│   │   │   │   ├── provider/
│   │   │   │   │   └── task.repository.ts
│   │   │   │   └── usecase/
│   │   │   │       ├── create-task.usecase.ts
│   │   │   │       ├── complete-task.usecase.ts
│   │   │   │       ├── update-task.usecase.ts
│   │   │   │       └── delete-task.usecase.ts
│   │   │   │
│   │   │   ├── timer/                # ⏱️ Pomodoro Domain
│   │   │   │   ├── model/
│   │   │   │   │   ├── timer-session.entity.ts
│   │   │   │   │   └── timer-config.vo.ts
│   │   │   │   ├── provider/
│   │   │   │   └── usecase/
│   │   │   │       ├── start-session.usecase.ts
│   │   │   │       ├── pause-session.usecase.ts
│   │   │   │       └── complete-session.usecase.ts
│   │   │   │
│   │   │   ├── analytics/            # 📊 Analytics Domain
│   │   │   │   ├── model/
│   │   │   │   ├── provider/
│   │   │   │   └── usecase/
│   │   │   │
│   │   │   └── ai/                   # 🤖 AI Domain (future)
│   │   │       ├── model/
│   │   │       ├── provider/
│   │   │       └── usecase/
│   │   │
│   │   └── test/                     # Unit tests (100% coverage goal)
│   │       ├── shared/
│   │       ├── users/
│   │       ├── tasks/
│   │       └── timer/
│   │
│   ├── db/                           # 📦 Prisma Client compartido
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── src/
│   │       └── client.ts
│   │
│   ├── ui/                           # 📦 Componentes UI compartidos
│   │   └── src/
│   │       ├── button/
│   │       ├── input/
│   │       ├── card/
│   │       └── ...
│   │
│   ├── eslint-config/                # ESLint compartido
│   └── typescript-config/            # TSConfig compartido
│
├── docs/                             # Documentación
│   ├── PRD.md
│   ├── TECHNICAL_DESIGN.md
│   ├── WIREFRAMES.md
│   └── ARCHITECTURE.md (este archivo)
│
├── turbo.json                        # Turborepo config
├── package.json                      # Root package
└── README.md
```

---

- [ ] Integrar con Core use cases
- [ ] Implementar autenticación con NextAuth

### 8.5 Fase 4: UI (40+ horas)

- [ ] Implementar design system (basado en WIREFRAMES.md)
- [ ] Crear componentes de layout
- [ ] Implementar páginas principales
- [ ] Agregar animaciones y microinteracciones

---

## 9. Referencias

- [PRD.md](./PRD.md) - Product Requirements
- [TECHNICAL_DESIGN.md](./TECHNICAL_DESIGN.md) - Technical specifications
- [WIREFRAMES.md](./WIREFRAMES.md) - UI/UX designs
- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - Current progress

---

**Versión**: 1.0  
**Última actualización**: Noviembre 2025  
**Próxima revisión**: Enero 2026
