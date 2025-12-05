# 🔄 Guía de Migración: Web → Desktop

**Objetivo**: Migrar componentes de `apps/web` a `apps/desktop`

---

## 📋 Checklist por Componente

### Antes de Migrar
- [ ] Identificar dependencias del componente en Web
- [ ] Verificar que los hooks equivalentes existen en Desktop
- [ ] Identificar imports que necesitan adaptación

### Durante la Migración
- [ ] Copiar archivo a la ubicación correcta en Desktop
- [ ] Remover `"use client"` directive
- [ ] Actualizar imports (ver tabla abajo)
- [ ] Adaptar hooks de i18n
- [ ] Adaptar hooks de navegación
- [ ] Verificar TypeScript sin errores

### Después de Migrar
- [ ] Build exitoso: `npm run build`
- [ ] Verificación visual en dev mode
- [ ] Pruebas funcionales básicas

---

## 🔄 Equivalencias de Imports

| Web (Next.js) | Desktop (React + Vite) |
|---------------|------------------------|
| `"use client"` | **Remover** (no necesario) |
| `next/image` | `<img>` estándar |
| `next/link` | `import { Link } from 'react-router-dom'` |
| `useRouter()` from next | `useNavigate()` from react-router-dom |
| `useSearchParams()` from next | `useSearchParams()` from react-router-dom |
| `usePathname()` from next | `useLocation().pathname` from react-router |
| `redirect()` from next | `navigate()` from react-router |
| `useTranslations()` from next-intl | `useTranslation()` from react-i18next |
| `@/components/ui/*` | `../ui/*` or `@/components/ui/*` |
| `@/data/hooks/*` | `../../hooks/api/*` |

---

## 📁 Estructura de Imports Desktop

```typescript
// Hooks de API
import { useTasks, useCreateTask } from '@/hooks/api';

// Componentes UI
import { Button, Dialog, Input } from '@/components/ui';

// i18n
import { useTranslation } from 'react-i18next';

// Navegación
import { useNavigate, useParams, Link } from 'react-router-dom';

// Stores (Zustand)
import { useWorkspaceStore } from '@/stores/workspace-store';
```

---

## 🛠️ Migraciones Específicas

### 1. Sistema Kanban

**Archivos a migrar** (en orden):
1. `sortable-task.tsx` - Wrapper DnD básico
2. `kanban-task-card.tsx` - Tarjeta individual
3. `board-column.tsx` - Columna del tablero
4. `project-board.tsx` - Contenedor principal

**Dependencias necesarias**:
```bash
cd apps/desktop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Ubicación destino**: `apps/desktop/src/components/project/`

**Pasos específicos**:
```typescript
// 1. En project-board.tsx, cambiar:
// FROM: import { useRouter } from 'next/navigation';
// TO:
import { useNavigate, useParams } from 'react-router-dom';

// 2. Cambiar:
// FROM: const router = useRouter(); router.push('/...');
// TO:
const navigate = useNavigate();
navigate('/...');

// 3. Cambiar i18n:
// FROM: import { useTranslations } from 'next-intl';
//       const t = useTranslations('project');
// TO:
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
// Y usar: t('project.columnName')
```

---

### 2. Task Detail Stubs

**Archivos a reemplazar**:
- `activity-feed.tsx`
- `attachment-list.tsx`
- `comment-thread.tsx`
- `file-upload.tsx`

**Ubicación**: `apps/desktop/src/components/task/`

**Pasos**:
1. Copiar contenido completo de Web
2. Adaptar imports según tabla
3. Verificar que hooks de API existen:
   - `useComments` → revisar `hooks/api/use-comments.ts`
   - `useAttachments` → revisar `hooks/api/use-attachments.ts`

---

### 3. Workspace Members

**Archivos a migrar**:
- `invite-member-dialog.tsx`
- `workspace-members-settings.tsx`

**Ubicación destino**: `apps/desktop/src/components/workspace/`

**Hooks necesarios** (verificar existencia):
```typescript
// Desktop debe tener equivalentes a:
import { useWorkspaceMembers, useInviteMember } from '@/hooks/api';
```

---

### 4. AI Components

**Archivos a migrar**:
- `generate-report-dialog.tsx`
- `report-card.tsx`
- `report-detail.tsx`

**Ubicación destino**: `apps/desktop/src/components/ai/`

---

## 🧪 Verificación Post-Migración

### Build Check
```bash
cd apps/desktop
npm run build
```

### Dev Mode Check
```bash
cd apps/desktop
npm run dev
```

### Pruebas Funcionales
1. Navegar a la vista que usa el componente
2. Verificar renderizado correcto
3. Probar interacciones (clicks, formularios, drag-drop)
4. Verificar que no hay errores en consola

---

## ⚠️ Problemas Comunes

### Error: Module not found
**Causa**: Import path incorrecto  
**Solución**: Verificar paths relativos vs aliases (@/)

### Error: useRouter is not a function
**Causa**: Usando import de Next.js  
**Solución**: Cambiar a `useNavigate` de react-router-dom

### Error: useTranslations is not a function
**Causa**: Usando next-intl  
**Solución**: Cambiar a `useTranslation` de react-i18next

### Error: 'use client' is not valid
**Causa**: Directiva de Next.js en Vite  
**Solución**: Remover la línea `"use client"`

---

## 📚 Referencias

- [React Router v6 Docs](https://reactrouter.com/en/main)
- [react-i18next Docs](https://react.i18next.com/)
- [dnd-kit Docs](https://docs.dndkit.com/)
- [Zustand Docs](https://docs.pmnd.rs/zustand)
