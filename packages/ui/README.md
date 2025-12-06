# @ordo-todo/ui

Shared UI components, utilities, and providers for Ordo-Todo applications across Web, Desktop, and Mobile platforms.

## Estado Actual del Proyecto

### ✅ Completado

1. **Estructura de Carpetas**
   - Creada estructura completa para componentes organizados por dominio
   - Carpetas creadas: `ui/`, `timer/`, `task/`, `project/`, `workspace/`, `workflow/`, `tag/`, `analytics/`, `ai/`, `auth/`, `layout/`, `shared/`, `voice/`, `providers/`, `utils/`

2. **Configuración del Package**
   - `package.json` actualizado con todas las dependencias necesarias
   - Exports configurados para imports modulares
   - Peer dependencies definidas (React 19+, TanStack Query 5+)
   - Scripts de build y testing configurados

3. **Dependencias Instaladas**
   - Radix UI components (25+ primitivos)
   - Framer Motion (animaciones)
   - Recharts (gráficos de analytics)
   - DND Kit (drag & drop para Kanban)
   - React Big Calendar (vistas de calendario)
   - React Hook Form + Zod (formularios)
   - Sonner (toasts/notificaciones)
   - Lucide React (iconos)
   - Chrono Node (parsing de fechas naturales)
   - Y más...

4. **Análisis Cross-Platform Completo**
   - Identificados 88+ componentes para compartir
   - Identificadas 9 funcionalidades únicas en Web a replicar en Desktop
   - Identificadas 5 funcionalidades únicas en Desktop a replicar en Web
   - Documentado en `.agent/CROSS-PLATFORM-ANALYSIS.md`

### 🚧 En Progreso

- Migración de componentes desde apps/web y apps/desktop a este package

### 📋 Pendiente

Según el plan de migración en 8 fases (13 semanas estimadas):

#### Fase 1: Componentes UI Base (Semana 1-2) - P0 Crítico
- [ ] Migrar 25 componentes base desde apps/web/src/components/ui/
  - button, input, textarea, select, checkbox, switch, slider
  - card, badge, avatar, progress, separator, label
  - dialog, sheet, dropdown-menu, popover, command
  - table, tabs, tooltip, calendar, sonner
  - empty-state, scroll-area, form

#### Fase 2: Componentes de Dominio (Semana 3-5) - P0 Crítico
- [ ] Timer Components (4 archivos)
- [ ] Task Components (15 archivos)
- [ ] Project Components (8 archivos)
- [ ] Analytics Components (5 archivos)

#### Fase 3: Workspace, Tag, Auth, AI (Semana 6) - P1 Alto
- [ ] Workspace Components (8 archivos)
- [ ] Tag Components (3 archivos)
- [ ] Auth Components (2 archivos)
- [ ] AI Components (5 archivos)

#### Fase 4: Layout, Shared, Providers (Semana 7) - P0 Crítico
- [ ] Layout Components (4 archivos)
- [ ] Shared Components (5 archivos)
- [ ] Providers (5 archivos)

#### Fase 5: Utilidades y Hooks (Semana 8) - P1 Alto
- [ ] Utilidades compartidas (5 archivos)
- [ ] Hooks personalizados (8 archivos)

#### Fase 6: Funcionalidades Nuevas (Semana 9-10) - P1-P2
- [ ] Web ← Desktop: Task Health Score, Templates, Voice Input, Smart Capture, Dependencies UI
- [ ] Desktop ← Web: Workflows, Recurrence Selector, Task Sharing, AI Assistant Chat

#### Fase 7: Testing (Semana 11-12) - P0 Crítico
- [ ] Tests unitarios para componentes
- [ ] Tests de integración
- [ ] Tests E2E
- [ ] Tests de regresión visual (Storybook)

#### Fase 8: Documentación (Semana 13) - P1 Alto
- [ ] README por package
- [ ] Storybook interactivo
- [ ] Migration guide
- [ ] Architecture docs

---

## Estructura de Archivos (Target)

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── ui/                  # Componentes base Radix UI (25)
│   │   ├── timer/               # Timer/Pomodoro (4)
│   │   ├── task/                # Gestión de tareas (15)
│   │   ├── project/             # Proyectos y Kanban (8)
│   │   ├── workspace/           # Workspaces (8)
│   │   ├── workflow/            # Workflows (3)
│   │   ├── tag/                 # Etiquetas (3)
│   │   ├── analytics/           # Analytics y reportes (5)
│   │   ├── ai/                  # Asistente IA (5)
│   │   ├── auth/                # Autenticación (2)
│   │   ├── layout/              # Layouts (4)
│   │   ├── shared/              # Compartidos (5)
│   │   ├── voice/               # Entrada por voz (1)
│   │   └── index.ts
│   ├── providers/
│   │   ├── query-provider.tsx   # TanStack Query
│   │   ├── auth-provider.tsx    # Autenticación
│   │   ├── timer-provider.tsx   # Timer Context
│   │   ├── timer-settings-provider.tsx
│   │   ├── theme-provider.tsx   # Temas
│   │   └── index.ts
│   ├── utils/
│   │   ├── cn.ts                # ✅ Ya existe
│   │   ├── colors.ts            # ✅ Ya existe
│   │   ├── task-health.ts       # Scoring de tareas
│   │   ├── smart-capture.ts     # Parsing natural
│   │   ├── logger.ts            # Logging
│   │   ├── notify.tsx           # Notificaciones
│   │   ├── conflict-resolver.ts # Sync conflicts
│   │   └── index.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md (este archivo)
```

---

## Uso

### Instalación

Este package se instala automáticamente en el monorepo. Las apps lo importan así:

```json
{
  "dependencies": {
    "@ordo-todo/ui": "*"
  }
}
```

### Imports

```typescript
// Componentes UI Base
import {
  Button,
  Input,
  Dialog,
  Card,
  Badge,
  // ... todos los componentes base
} from '@ordo-todo/ui/components/ui';

// Componentes de Dominio
import {
  PomodoroTimer,
  TaskSelector,
  TimerWidget,
} from '@ordo-todo/ui/components/timer';

import {
  TaskList,
  TaskCard,
  TaskDetailPanel,
  CreateTaskDialog,
} from '@ordo-todo/ui/components/task';

// Providers
import {
  QueryProvider,
  AuthProvider,
  TimerProvider,
} from '@ordo-todo/ui/providers';

// Utilities
import { cn, PROJECT_COLORS } from '@ordo-todo/ui/utils';
import { calculateTaskHealth } from '@ordo-todo/ui/utils/task-health';
```

---

## Arquitectura

### Dependencias

```
@ordo-todo/ui depende de:
├── @ordo-todo/core        # Domain logic (entities, use cases)
├── @ordo-todo/api-client  # REST client
├── @ordo-todo/hooks       # React Query hooks
├── @ordo-todo/stores      # Zustand stores
├── @ordo-todo/i18n        # Traducciones
├── react + react-dom      # Framework
├── @tanstack/react-query  # Server state
└── Radix UI + Tailwind    # Componentes y estilos
```

### Flujo de Datos

```
Apps (Web/Desktop/Mobile)
    ↓
@ordo-todo/ui (Components + Providers)
    ↓
┌─────────┬─────────┬─────────┐
│ Hooks   │ Stores  │  i18n   │
└─────────┴─────────┴─────────┘
    ↓
API Client
    ↓
Backend (NestJS)
    ↓
Core (Domain)
    ↓
DB (Prisma + PostgreSQL)
```

---

## Testing

### Ejecutar Tests

```bash
# Todos los tests
npm run test

# Con UI
npm run test:ui

# Watch mode
npm run test -- --watch
```

### Cobertura Mínima

- Componentes compartidos: **80%**
- Utilidades: **90%**
- Providers: **70%**

---

## Build

```bash
# Build production
npm run build

# Watch mode (desarrollo)
npm run dev

# Type checking
npm run check-types

# Limpiar
npm run clean
```

---

## Roadmap

### Sprint 1 (Actual) - Preparación
- [x] Crear estructura de carpetas
- [x] Configurar package.json
- [x] Instalar dependencias
- [x] Análisis cross-platform completo
- [ ] Documentación inicial

### Sprint 2-3 - Componentes UI Base
- [ ] Migrar 25 componentes base
- [ ] Crear index exports
- [ ] Actualizar imports en apps
- [ ] Tests unitarios
- [ ] Storybook stories

### Sprint 4-6 - Componentes de Dominio
- [ ] Migrar timer, task, project, analytics
- [ ] Migrar workspace, tag, auth, AI
- [ ] Migrar layout, shared, providers
- [ ] Tests de integración

### Sprint 7-8 - Utilidades y Funcionalidades Nuevas
- [ ] Migrar utilidades y hooks
- [ ] Implementar funcionalidades faltantes en Web
- [ ] Implementar funcionalidades faltantes en Desktop

### Sprint 9-10 - Testing y QA
- [ ] Tests E2E completos
- [ ] Regresión visual
- [ ] Performance testing
- [ ] Accessibility audit

### Sprint 11 - Documentación
- [ ] Storybook completo
- [ ] Migration guides
- [ ] Architecture docs
- [ ] Release notes

---

## Contribuir

### Migrar un Componente

1. **Copiar** el componente desde `apps/web/src/components/` o `apps/desktop/src/components/`
2. **Pegar** en la carpeta correspondiente en `packages/ui/src/components/`
3. **Actualizar imports** para usar packages compartidos:
   ```typescript
   // Antes:
   import { Task } from '@/lib/types'

   // Después:
   import { Task } from '@ordo-todo/core'
   ```
4. **Exportar** en `index.ts` de la carpeta
5. **Crear tests** en `__tests__/`
6. **Actualizar imports** en las apps para usar el package
7. **Eliminar** el archivo duplicado de las apps

### Guías de Estilo

- **TypeScript** estricto (no any, no implicit any)
- **Componentes funcionales** con hooks
- **Props** siempre con interface/type
- **Naming**: PascalCase para componentes, camelCase para funciones
- **Exports**: Named exports (no default)
- **Comments**: JSDoc para componentes públicos

---

## Problemas Conocidos

1. **Breaking Changes**: Durante la migración, algunas apps pueden tener imports rotos temporalmente
   - Solución: Migrar en batches pequeños, validar con tests

2. **Divergencia de APIs**: Algunas implementaciones difieren entre Web y Desktop
   - Solución: Crear abstracciones/interfaces comunes

3. **Bundle Size**: El package puede crecer significativamente
   - Solución: Tree shaking, lazy loading, code splitting

---

## Recursos

- [Plan de Migración Completo](./.agent/CROSS-PLATFORM-ANALYSIS.md)
- [Documentación Core](../core/README.md)
- [Hooks Package](../hooks/README.md)
- [Stores Package](../stores/README.md)

---

## Licencia

Ver el archivo LICENSE en la raíz del monorepo.

---

**Última actualización**: 2025-12-06
**Estado**: 🚧 En construcción activa
**Progreso**: 10% (Estructura y configuración completas)
