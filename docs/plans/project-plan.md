# Proyectos — Especificación de Diseño y Funcionamiento

**Última actualización:** 2025-12-03
**Estado:** Listo para desarrollo (Fase 6 - Project Management Enhancements)

Este documento define la implementación del módulo de Proyectos en Ordo-Todo, alineado con la arquitectura de Workspaces basada en slugs y el nuevo sistema de diseño.

---

## 1. Visión General y UX

Los proyectos son el corazón de la productividad en Ordo. Deben sentirse **vibrantes, rápidos y organizados**.

### Principios de Diseño
- **Visualmente Ricos**: Cada proyecto tiene un color e icono distintivo que se usa en toda la UI (bordes, fondos sólidos, badges).
- **Estilo Plano y Sólido**: **NO USAR degradados ni transparencias**. Usar colores sólidos y vibrantes.
- **Navegación Fluida**: Uso de rutas amigables `/w/:workspaceSlug/p/:projectSlug`.
- **Vistas Flexibles**: El usuario puede cambiar instantáneamente entre Lista, Tablero (Kanban) y Calendario.
- **Interacciones Vivas**: Drag & drop suave, actualizaciones optimistas, micro-animaciones al completar tareas.

---

## 2. Modelo de Datos (Prisma)

Se recomienda simplificar `ProjectSettings` a un campo JSON para mayor flexibilidad y rendimiento.

```prisma
model Project {
  id                String       @id @default(cuid())
  workspaceId       String
  workspace         Workspace    @relation(fields: [workspaceId], references: [id])
  
  // Identificación
  name              String
  slug              String       // Único por workspace
  description       String?
  
  // Estado y Prioridad
  status            ProjectStatus @default(ACTIVE)
  priority          Priority     @default(MEDIUM)
  
  // Apariencia
  color             String?      // Hex code
  icon              String?      // Lucide icon name
  
  // Fechas
  startDate         DateTime?
  dueDate           DateTime?
  
  // Responsable
  ownerId           String? 
  owner             User?        @relation(fields: [ownerId], references: [id])
  
  // Relaciones
  tasks             Task[]
  
  // Métricas (Denormalizadas para rendimiento)
  tasksCount        Int          @default(0)
  completedTasksCount Int        @default(0)
  
  // Configuración (JSON)
  // { defaultView: 'list'|'kanban', wipLimit: number, sortOrder: string }
  settings          Json?
  
  // Auditoría
  isArchived        Boolean      @default(false)
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
  deletedAt         DateTime?    // Soft delete

  @@unique([workspaceId, slug])
  @@index([workspaceId])
  @@index([ownerId])
}

enum ProjectStatus {
  ACTIVE
  ON_HOLD
  COMPLETED
  ARCHIVED
}
```

---

## 3. Funcionalidades Clave (Roadmap)

### 3.1 Gestión de Proyectos (CRUD & Listado)
- **Integración con Workspace Dashboard**: Los proyectos se muestran en el dashboard principal con tarjetas ricas (ya implementado).
- **Página de Todos los Proyectos**: Una vista dedicada `/w/:slug/projects` para workspaces con muchos proyectos, permitiendo filtrado avanzado y bulk actions.
- **Creación**: Modal mejorado con selección de plantilla, color y validación de slug en tiempo real.

### 3.2 Vistas de Proyecto (Project Detail)
La página `/w/:workspaceSlug/p/:projectSlug` es el centro de trabajo.

- **Header**: Título, estado, miembros, y pestañas de vista.
- **Vistas**:
  1.  **Lista**: Ideal para planificación y revisión rápida. Sortable y filtrable.
  2.  **Kanban (Tablero)**:
      - Columnas por Estado (To Do, In Progress, Done) o por Etiqueta.
      - Drag & drop fluido con `dnd-kit` o similar.
      - Indicadores visuales de WIP (Work In Progress).
  3.  **Timeline/Calendario** (Fase posterior): Visualización de fechas.

### 3.3 Plantillas de Proyecto (Project Templates)
Para acelerar el flujo de trabajo, permitir crear proyectos basados en pre-configuraciones:
- **Tipos**: "Básico", "Desarrollo de Software", "Marketing", "CRM Simple".
- **Efecto**: Pre-crea estados (tags/columnas), tareas iniciales y configuraciones de vista.

---

## 4. API & Endpoints

La API debe soportar la resolución por ID y Slug.

### Rutas Principales
- `GET /workspaces/:id/projects`: Listar proyectos (con filtros).
- `POST /workspaces/:id/projects`: Crear proyecto.
- `GET /projects/:id`: Obtener detalle por ID.
- `GET /projects/by-slug/:workspaceSlug/:projectSlug`: Obtener detalle por slugs (Optimizado para frontend).
- `PATCH /projects/:id`: Actualizar (nombre, estado, color, settings).
- `DELETE /projects/:id`: Soft delete.

### Rutas Específicas
- `POST /projects/:id/duplicate`: Clonar proyecto.
- `GET /projects/:id/stats`: Métricas detalladas (burn-down, velocidad).

---

## 5. Plan de Implementación (Fase 6)

### Sesión 1: Project Detail & Kanban Foundation
1.  Crear página `/w/:slug/p/:projectSlug`.
2.  Implementar `useProjectBySlug`.
3.  Crear estructura de pestañas (Overview, List, Board, Settings).
4.  Implementar vista **Kanban** básica (visualización de columnas y tarjetas).

### Sesión 2: Interacciones Kanban
1.  Implementar Drag & Drop (mover tareas entre estados).
2.  Actualización optimista de UI.
3.  Persistencia de cambios de estado en backend.

### Sesión 3: Project Templates & Settings
1.  Mejorar modal de creación para soportar templates.
2.  Implementar lógica de "seed" de tareas al crear desde template.
3.  Página de configuración del proyecto (editar, archivar, eliminar).

---

## 6. Recomendaciones de UI/UX

- **Empty States**: Si un proyecto no tiene tareas, mostrar una ilustración amigable y botones rápidos para "Añadir Tarea" o "Usar Plantilla".
- **Progress Bars**: Mostrar progreso visual (e.g., anillo de progreso) en la tarjeta del proyecto y en el header del detalle.
- **Diseño Sólido**: **NO USAR transparencias ni degradados**. Usar colores sólidos y planos.
- **Color Coding**: Usar el color del proyecto para acentos sólidos en la UI del detalle (bordes, iconos).
- **Skeleton Loading**: Usar skeletons que imiten la estructura de la vista actual (lista vs columnas) durante la carga.

---

## 7. Migración

- Asegurar que los proyectos existentes tengan un `slug` generado (script de migración).
- Migrar `ProjectSettings` si ya existía tabla separada a columna JSON (si aplica).