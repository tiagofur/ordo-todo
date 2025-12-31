# 🎯 Plan para 100% Mobile Parity + Packages Documentation

**Fecha:** 31 Diciembre 2025
**Estado Actual:** Mobile 85% | Packages 65/100

---

## 📱 Parte 1: Mobile Parity (15% restante → 100%)

### 🎯 ALTA PRIORIDAD (4 features) - 2-3 días

#### 1. Workspace Invitations

- [ ] Crear `workspace-invitations.tsx` en mobile
- [ ] Lista de invitaciones pendientes
- [ ] Botón "Accept/Decline"
- [ ] Formulario para invitar nuevos miembros
- [ ] Integración con hooks existentes

#### 2. Time Blocking

- [ ] Integrar en pantalla de tarea existente
- [ ] Time picker inline para scheduledDate/scheduledTime
- [ ] Visualizar bloques en calendario
- [ ] Guardar datos en task al crear/editar

#### 3. Batch Operations

- [ ] Checkbox multi-selección en task list
- [ ] Acciones en lote (completar, eliminar, cambiar prioridad)
- [ ] Menú contextual con acciones batch
- [ ] Confirmación de acción batch

#### 4. Project Settings

- [ ] Crear `project-settings.tsx`
- [ ] Nombre, descripción, colores
- [ ] Configuración de miembros
- [ ] Configuración de notificaciones del proyecto
- [ ] Integración con hooks existentes

### 🟡 MEDIA PRIORIDAD (9 features) - 5-7 días

5. Project Trash
6. Notification Settings
7. Comments en tareas
8. Attachments en tareas
9. Task Sharing (público)
10. Gamification (XP, Levels)
11. Smart Search

### 🟢 BAJA PRIORIDAD (14 features) - Opcional

12. Export JSON/CSV
13. Mentions (@usuario)
14. Achievements
15. AI Meeting Assistant
    16-23. Otros...

---

## 📚 Parte 2: Packages Documentation (35 puntos restantes → 100%)

### 🎯 CRÍTICO (Fase 1) - 2 días

#### Eliminar 'use client' de componentes UI

**Archivos afectados:** 56 componentes en packages/ui

```typescript
// ❌ MAL - Direct client usage
import { apiClient } from "@ordo-todo/api-client";

// ✅ BIEN - Pass via props
interface TaskCardProps {
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}
```

**Archivos prioridad:**

1. packages/ui/src/components/task/\*.tsx (15 archivos)
2. packages/ui/src/components/project/\*.tsx (11 archivos)
3. packages/ui/src/components/analytics/\*.tsx (7 archivos)
4. packages/ui/src/components/timer/\*.tsx (4 archivos)
5. packages/ui/src/components/dashboard/\*.tsx (5 archivos)

#### Eliminar hooks directos de componentes

**Archivos afectados:** Todos los componentes

```typescript
// ❌ MAL - Direct hooks
import { useState, useEffect, useMemo } from 'react';

// ✅ BIEN - Accept via props/hooks parameter
export function TaskCard({
  // Props instead of internal hooks
  title,
  description,
  isExpanded,
  onToggle,
}: TaskCardProps) {
```

**Archivos prioridad:**

1. packages/ui/src/components/task/task-card.tsx
2. packages/ui/src/components/project/project-card.tsx
3. packages/ui/src/components/analytics/\*.tsx
4. packages/ui/src/components/dashboard/\*.tsx

### 🟡 MEDIA PRIORIDAD (Fase 2) - 3-4 días

#### Mejorar tipos en api-client

- [ ] Reemplazar 16 `any` types con tipos específicos
- [ ] Agregar interfaces faltantes
- [ ] Actualizar TaskResponse, WorkspaceResponse, etc.

#### Tests en packages

- [ ] Agregar tests a packages/core (0% → 50%)
- [ ] Agregar tests a packages/hooks (0% → 50%)
- [ ] Agregar tests a packages/api-client (0% → 30%)
- [ ] Agregar tests a packages/db (0% → 30%)

#### Documentación adicional

- [ ] Actualizar VIOLACIONES-POR-PAQUETE.md tras cleanup
- [ ] Agregar CONTRIBUTING.md para packages/
- [ ] Agregar CHANGELOG.md por paquete

---

## 📋 Plan de Ejecución

### Día 1: Mobile Parity (4 features alta)

- Mañana: Workspace Invitations + Time Blocking
- Tarde: Batch Operations + Project Settings
- Tests + Commit + Push

### Día 2: Packages Cleanup (eliminar use client)

- Mañana: task components cleanup
- Tarde: project + analytics + dashboard components
- Tests + Commit + Push

### Día 3: Packages Cleanup (hooks + tipos + tests)

- Mañana: Eliminar hooks directos de 20 componentes
- Tarde: Mejorar tipos api-client + tests iniciales
- Commit + Push

### Día 4: Mobile Parity (media prioridad)

- Project Trash + Notification Settings + Comments
- Attachments + Task Sharing
- Tests + Commit + Push

### Día 5-6: Restante

- Gamification + Smart Search
- Finalizar tests de packages
- Documentación final
- 100% mobile parity + 100% packages docs

---

## 🎯 Métricas de Éxito

**Mobile Parity:**

- [ ] Core CRUD: 90% → 100%
- [ ] Task Management: 95% → 100%
- [ ] Productivity: 95% → 100%
- [ ] Analytics: 95% → 100%
- [ ] Collaboration: 60% → 80%
- [ ] AI Features: 80% → 90%
- **Promedio: 93% → 95%**

**Packages Documentation:**

- [ ] Eliminar 'use client': 56 archivos
- [ ] Eliminar hooks directos: 20 archivos
- [ ] Mejorar tipos any: 16 archivos
- [ ] Tests: 0% → 50%
- **Score: 65/100 → 95/100**

---

## 🚨 Notas Importantes

1. **NO tocar backend** - Solo frontend/packages como solicitado
2. **NO tocar web/desktop** - Solo mobile + packages
3. **Tests y commits** por cada feature completada
4. **Documentar cambios** en commits y PENDING_TASKS.md

## 📌 Checklist por Feature Completada

Para cada feature completada:

- [ ] Código funcional implementado
- [ ] Componentes UI creados
- [ ] Integración con hooks existentes
- [ ] Test suite creada (si aplica)
- [ ] TypeScript compilando sin errores
- [ ] Lint pasando (excepto errores conocidos)
- [ ] Actualizar PENDING_TASKS.md
- [ ] Actualizar WEB_VS_MOBILE_GAP_ANALYSIS.md
- [ ] Commit con mensaje descriptivo
- [ ] Push a main

---

**Meta:** 100% Mobile Parity + 95%+ Packages Documentation en 6 días
