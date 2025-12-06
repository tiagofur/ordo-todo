# Ordo-Todo - Roadmap de Desarrollo

**Última actualización:** 4 de Diciembre, 2025  
**Estrategia:** Híbrida (Crítico + Alcanzable = Máximo Impacto)

---

## 🎯 Filosofía del Roadmap

Priorizamos usando la matriz **Impacto vs Esfuerzo**:

```
        Alto Impacto
             │
    ┌────────┼────────┐
    │ HACER  │ PLANEAR│
    │ AHORA  │ BIEN   │
    ├────────┼────────┤
    │ QUICK  │DELEGAR │
    │ WINS   │/IGNORAR│
    └────────┴────────┘
  Bajo ←── Esfuerzo ──→ Alto
        Bajo Impacto
```

---

## 📅 Sprint 1: Fundamentos (1-2 semanas) ✅ COMPLETADO

**Objetivo:** Cerrar brechas críticas del MVP con esfuerzo moderado.

### Tareas

- [x] **Testing Básico** ⚡ Crítico
  - [x] Setup Jest/Vitest para `packages/core` (Ya existía, 242 tests pasando)
  - [x] Tests para use cases principales (CreateTask) 
  - [x] Tests para hooks críticos (useAuth, useTasks)
  
- [x] **Asignación de Tareas** 🎯 Alto Impacto, Bajo Esfuerzo
  - [x] Migración DB: agregar `assigneeId` (relación User)
  - [x] UI selector de usuario en TaskDetailPanel (AssigneeSelector)
  - [x] Endpoint update con assigneeId
  - [x] Filtro "Mis Tareas" en lista (toggle All Tasks/My Tasks)
  
- [x] **Dashboard Quick Actions** ⚡ Quick Win
  - [x] Botón FAB flotante con menú animado
  - [x] Nueva Tarea desde dashboard (diálogo integrado)
  - [x] Nuevo Proyecto desde dashboard
  - [x] Acceso rápido al Timer

---

## 📅 Sprint 2: Subtareas (2-3 semanas) ✅ COMPLETADO

**Objetivo:** Implementar feature core más solicitada.

### Tareas

- [x] **Backend Subtareas**
  - [x] Endpoints CRUD `/tasks/:id/subtasks` (POST crear)
  - [x] Service y DTO para subtareas
  - [x] Contadores `subtasksCompleted` en analytics
  
- [x] **Frontend Subtareas**
  - [x] Componente `SubtaskList` (crear, completar, eliminar)
  - [x] Checkbox toggle con reopen
  - [x] Barra de progreso visual en SubtaskList
  - [x] Barra de progreso en TaskCard (indicador compacto)
  - [x] Integración en TaskDetailPanel tabs
  
- [x] **Tests para Subtareas**
  - [x] Unit tests de useCreateSubtask hook
  - [x] Integration tests de API (backend)

---

## 📅 Sprint 3: Colaboración (2 semanas) ✅ COMPLETADO

**Objetivo:** Habilitar trabajo en equipo efectivo y comunicación.

### Tareas

- [x] **Sistema de Notificaciones (Backend)**
  - [x] Modelo `Notification` en Prisma
  - [x] Module `Notifications` (Service, Controller)
  - [x] Lógica para crear notificaciones (asignación, comentarios)
  - [x] Endpoint para marcar como leídas

- [x] **Sistema de Notificaciones (Frontend)**
  - [x] Componente `NotificationPopover` en TopBar
  - [x] Store/Context para notificaciones en tiempo real (polling o SSE)
  - [x] UI de `NotificationItem`

- [x] **Mejoras en Comentarios**
  - [x] Soporte para menciones (@usuario) en frontend
  - [x] Backend parsing de menciones -> Crear Notificación
  
- [x] **Compartir Tareas**
  - [x] Generar link público de tarea (solo lectura)
  - [x] Vista pública de tarea (sin auth)

- [x] **Tests de Colaboración**
  - [x] Tests de notificaciones (Unit tests passed, E2E written)
  - [x] Tests de flujo de comentarios (Unit tests passed, E2E written)

- [x] **Sistema de Comentarios**
  - [x] Componente `CommentThread` en TaskDetail
  - [x] Real-time updates (via React Query invalidation)
  - [x] Markdown básico en comentarios (React Markdown + Typography)

- [x] **Notificaciones**
  - [x] Notificación al ser asignado (Backend implemented in TasksService)
  - [x] Notificación al recibir comentario (Backend implemented in CommentsService)
  - [x] Centro de notificaciones en header (Frontend implemented in TopBar + NotificationPopover)

---

## 📅 Sprint 4: Productividad y Gamificación (2-3 semanas) ✅ COMPLETADO

**Objetivo:** Potenciar la productividad personal y el engagement.

### Tareas

- [x] **Pomodoro Timer Avanzado**
  - [x] Sincronización timer backend-frontend (polling)
  - [x] Historial de sesiones de foco
  - [x] Configuración de tiempos (Work/Short/Long)

- [x] **Gamificación Básica**
  - [x] Sistema de puntos (XP) por tareas completadas
  - [x] Niveles de usuario
  - [x] Logros básicos (Primer tarea, 10 tareas, etc.)

- [x] **Visualización**
  - [x] Vista Calendario
  - [x] Recurrencia de Tareas

---

## 📅 Sprint 5: Archivos y Adjuntos (1-2 semanas) ✅ COMPLETADO

**Objetivo:** Completar sistema de attachments.

### Tareas

- [x] **Upload Completo**
  - [x] Configurar S3/R2 para producción (o Local Storage para MVP)
  - [x] Componente drag & drop
  - [x] Preview de archivos (Imágenes/PDFs)
  - [x] Límites de tamaño (10MB default)

---

## 📅 Sprint 6: Polish & Testing (2 semanas)

**Objetivo:** Preparar para release público.

### Tareas

- [ ] **Testing E2E**
  - [ ] Setup Playwright
  - [ ] Flujo completo: registro → workspace → proyecto → tarea
  - [ ] Tests de regresión visual

- [ ] **Performance**
  - [ ] Auditoría Lighthouse
  - [ ] Lazy loading de componentes pesados
  - [ ] Optimización de queries Prisma

- [ ] **Documentación Usuario**
  - [ ] Guía de inicio rápido
  - [ ] FAQ
  - [ ] Videos tutoriales (opcional)

---

## 🔮 Futuro (Post-MVP)

| Feature | Prioridad | Notas |
|---------|-----------|-------|
| AI Suggestions | Media | Requiere API key, decidir proveedor |
| Google Calendar Sync | Media | OAuth adicional |
| Mobile App | Alta | Después de estabilizar web |
| Desktop App | Baja | Electron ya configurado |
| Slack/GitHub Integration | Baja | Webhooks |

---

## 📊 Métricas de Éxito

| Métrica | Objetivo Sprint 1-2 | Objetivo MVP |
|---------|---------------------|--------------|
| Test Coverage | 30% | 60% |
| Lighthouse Score | 80+ | 90+ |
| Features Completados | 4 | 12 |
| Bugs Críticos | 0 | 0 |

---

## 🚀 Próximos Pasos Inmediatos

> **Sprint 1 ✅ Completado** - 4 de Diciembre, 2025
> **Sprint 2 ✅ Completado** - 4 de Diciembre, 2025
> **Sprint 3 ✅ Completado** - 4 de Diciembre, 2025
> **Sprint 4 ✅ Completado** - 4 de Diciembre, 2025
> **Sprint 5 ✅ Completado** - 4 de Diciembre, 2025

### Resumen de Sprints Completados

1. **Sprint 3 - Colaboración:** ✅
   - Sistema de Notificaciones
   - Comentarios y Menciones
   - Compartir Tareas

2. **Sprint 4 - Productividad:** ✅
   - Pomodoro Timer Avanzado
   - Gamificación (XP, Niveles)
   - Vistas Calendario y Recurrencia

3. **Sprint 5 - Archivos:** ✅
   - Sistema de Archivos y Adjuntos
   - Upload Drag & Drop
   - Gestión de Archivos por Proyecto

### Siguiente: Sprint 6 - Polish & Testing

1. **Testing E2E**
   - Setup Playwright
   - Flujos críticos

2. **Performance & Docs**
   - Optimización
   - Guías de usuario

---

*¿Comenzamos con Sprint 6 (Polish & Testing)?*

