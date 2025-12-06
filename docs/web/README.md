# 🌐 Ordo-Todo Web App

**Framework**: Next.js 16 (App Router)  
**React**: 19  
**Styling**: TailwindCSS v4  
**Estado**: ✅ Producción Ready

---

## 🚀 Quick Start

```bash
# Desde la raíz del proyecto
cd apps/web
npm run dev
```

Abre http://localhost:3000

---

## 📁 Estructura del Proyecto

```
apps/web/
├── src/
│   ├── app/                    # App Router (Pages)
│   │   ├── [locale]/           # Rutas internacionalizadas
│   │   │   ├── (auth)/         # Grupo: Login, Register
│   │   │   ├── (dashboard)/    # Grupo: Main app
│   │   │   │   ├── workspaces/
│   │   │   │   ├── projects/
│   │   │   │   ├── tasks/
│   │   │   │   ├── timer/
│   │   │   │   ├── analytics/
│   │   │   │   └── settings/
│   │   │   └── invitations/    # Aceptar invitaciones
│   │   ├── api/                # API Routes (NextAuth, etc.)
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   │
│   ├── components/             # Componentes React
│   │   ├── ui/                 # Shadcn/UI components
│   │   ├── layout/             # Sidebar, TopBar, etc.
│   │   ├── workspace/          # Workspace components
│   │   ├── project/            # Project components
│   │   ├── task/               # Task components
│   │   ├── timer/              # Timer/Pomodoro
│   │   ├── analytics/          # Charts y stats
│   │   └── ai/                 # AI assistant
│   │
│   ├── lib/                    # Utilities
│   │   ├── api-client.ts       # HTTP client para backend
│   │   ├── api-hooks.ts        # React Query hooks
│   │   ├── auth.ts             # NextAuth config
│   │   └── utils.ts            # Helpers
│   │
│   ├── server/                 # Server-side only
│   │   └── repositories/       # Prisma repositories
│   │
│   └── styles/                 # CSS
│       └── globals.css
│
├── messages/                   # i18n translations
│   ├── es.json                 # Español
│   ├── en.json                 # English
│   └── pt-br.json              # Português
│
├── public/                     # Static assets
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## ✨ Features Implementados

### Autenticación
- ✅ Email/Password registration
- ✅ OAuth (Google, GitHub)
- ✅ JWT con refresh tokens
- ✅ Protected routes

### Workspaces
- ✅ CRUD completo
- ✅ Invitaciones por email
- ✅ Roles (Owner, Admin, Member, Viewer)
- ✅ Settings y configuración

### Projects
- ✅ CRUD con colores e iconos
- ✅ Vista lista y Kanban
- ✅ Archivar/desarchivar
- ✅ Progress tracking

### Tasks
- ✅ CRUD completo
- ✅ Subtareas con progreso
- ✅ Prioridades y estados
- ✅ Due dates y estimaciones
- ✅ Asignación de usuarios
- ✅ Tags y filtros
- ✅ Comentarios y menciones
- ✅ Archivos adjuntos
- ✅ Compartir tasks (link público)

### Timer Pomodoro
- ✅ Modos: Pomodoro, Continuo, Híbrido
- ✅ Work, Short Break, Long Break
- ✅ Asociar a tareas
- ✅ Time tracking automático
- ✅ Historial de sesiones

### Analytics
- ✅ Dashboard con métricas
- ✅ Gráficos semanales
- ✅ Heatmap de actividad
- ✅ Focus Score
- ✅ Streak de productividad

### i18n
- ✅ Español (default)
- ✅ English
- ✅ Português (parcial)

---

## 🔧 Configuración

### Variables de Entorno

```env
# .env.local
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (opcional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_ID="..."
GITHUB_SECRET="..."

# Backend API
NEXT_PUBLIC_API_URL="http://localhost:3101"
```

### Scripts Disponibles

```bash
npm run dev          # Desarrollo con HMR
npm run build        # Build de producción
npm run start        # Iniciar producción build
npm run lint         # ESLint
npm run check-types  # TypeScript check
```

---

## 🎨 Componentes UI

Usamos **shadcn/ui** basado en Radix UI. Los componentes están en `src/components/ui/`.

### Agregar nuevo componente

```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
```

### Componentes disponibles
- Button, Input, Select, Checkbox
- Dialog, Sheet, Popover, Tooltip
- Card, Badge, Avatar
- Table, Tabs, Accordion
- Calendar, Date Picker
- Form (react-hook-form + zod)
- Toast notifications

---

## 🔄 Migración a @ordo-todo/ui

**Estado:** 🟡 En progreso

Estamos migrando componentes de `apps/web/src/components/` a `packages/ui/` para compartirlos con desktop.

### Componentes ya migrados a @ordo-todo/ui

| Categoría | Componentes | Uso |
|-----------|-------------|-----|
| `ui/` | 30 | `import { Button } from '@ordo-todo/ui'` |
| `tag/` | 3 | `import { TagBadge } from '@ordo-todo/ui'` |

### Componentes pendientes de migrar

| Categoría | Cantidad | Notas |
|-----------|----------|-------|
| `workspace/` | 11 | Selector, cards, settings |
| `task/` | 16 | Cards, forms, details (ya migrados, pendiente corrección) |
| `project/` | 11 | Board, cards, settings (ya migrados, pendiente corrección) |
| `timer/` | 4 | Timer, widgets (ya migrados, pendiente corrección) |
| `analytics/` | 7 | Charts, metrics (ya migrados, pendiente corrección) |

### Cómo usar componentes compartidos

```typescript
// Antes (local)
import { Button } from '@/components/ui/button';
import { TagBadge } from '@/components/tag/tag-badge';

// Después (shared)
import { Button, TagBadge } from '@ordo-todo/ui';
```

> Ver [packages/README.md](../packages/README.md) para más detalles.

## 🔄 State Management

### Server State (TanStack Query)

```typescript
// Fetch data
const { data, isLoading } = useTasks(projectId);

// Mutations
const createTask = useCreateTask();
createTask.mutate({ title: "Nueva tarea", projectId });
```

### Client State (Zustand)

```typescript
// Stores disponibles
import { useWorkspaceStore } from '@/stores/workspace-store';

const { currentWorkspace, setWorkspace } = useWorkspaceStore();
```

---

## 🌍 Internacionalización

### Agregar traducciones

```json
// messages/es.json
{
  "HomePage": {
    "title": "Bienvenido a Ordo-Todo"
  },
  "Tasks": {
    "create": "Crear tarea",
    "delete": "Eliminar"
  }
}
```

### Usar en componentes

```typescript
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('Tasks');
  return <button>{t('create')}</button>;
}
```

---

## 🐛 Troubleshooting

### Error: Module not found
```bash
# Limpiar cache y reinstalar
rm -rf .next node_modules
npm install
npm run dev
```

### Error: HMR issues
Ver [troubleshooting/hmr-errors.md](../troubleshooting/hmr-errors.md)

### Error: Prisma client
```bash
cd packages/db
npx prisma generate
```

---

## 📚 Referencias

- [Next.js Docs](https://nextjs.org/docs)
- [TailwindCSS v4](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [next-intl](https://next-intl-docs.vercel.app)
- [TanStack Query](https://tanstack.com/query)
