# 📋 Sprint 1: Sistema Kanban Completo

**Prioridad**: 🔴 CRÍTICA  
**Duración estimada**: 3-5 días  
**Objetivo**: Implementar tablero Kanban con drag-and-drop

---

## 📦 Dependencias

```bash
cd apps/desktop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

---

## 📁 Archivos a Crear/Migrar

### 1. `sortable-task.tsx`
**Origen**: `apps/web/src/components/project/sortable-task.tsx`  
**Destino**: `apps/desktop/src/components/project/sortable-task.tsx`

```typescript
// Contenido esperado (adaptar de web)
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableTaskProps {
  id: string;
  children: React.ReactNode;
}

export function SortableTask({ id, children }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}
```

---

### 2. `kanban-task-card.tsx`
**Origen**: `apps/web/src/components/project/kanban-task-card.tsx`  
**Destino**: `apps/desktop/src/components/project/kanban-task-card.tsx`

**Cambios necesarios**:
- [ ] Remover `"use client"`
- [ ] Adaptar imports de UI components
- [ ] Cambiar `useTranslations` → `useTranslation`

---

### 3. `board-column.tsx`
**Origen**: `apps/web/src/components/project/board-column.tsx`  
**Destino**: `apps/desktop/src/components/project/board-column.tsx`

**Cambios necesarios**:
- [ ] Remover `"use client"`
- [ ] Adaptar imports
- [ ] Usar `useDroppable` de @dnd-kit/core

---

### 4. `project-board.tsx`
**Origen**: `apps/web/src/components/project/project-board.tsx`  
**Destino**: `apps/desktop/src/components/project/project-board.tsx`

**Cambios necesarios**:
- [ ] Remover `"use client"`
- [ ] Cambiar `useRouter` → `useNavigate`
- [ ] Adaptar hooks de tareas
- [ ] Integrar con `DndContext` de @dnd-kit

---

## 🔗 Integración

### Actualizar `ProjectDetail.tsx`

Después de migrar, importar el tablero en la página de detalle:

```typescript
// apps/desktop/src/pages/ProjectDetail.tsx
import { ProjectBoard } from '@/components/project/project-board';

// En el render, agregar:
<ProjectBoard projectId={project.id} />
```

---

## ✅ Criterios de Aceptación

- [ ] Tablero Kanban renderiza con columnas (TODO, IN_PROGRESS, DONE)
- [ ] Tareas se muestran en sus columnas correctas
- [ ] Drag-and-drop funciona entre columnas
- [ ] Estado se actualiza en backend al mover tarea
- [ ] Sin errores en consola
- [ ] Build exitoso

---

## 🧪 Testing

```bash
# 1. Build
cd apps/desktop
npm run build

# 2. Dev mode
npm run dev

# 3. Navegar a un proyecto y verificar Kanban
```
