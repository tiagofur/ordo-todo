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

## 📅 Sprint 2: Subtareas (2-3 semanas)

**Objetivo:** Implementar feature core más solicitada.

### Tareas

- [ ] **Backend Subtareas**
  - [ ] Endpoints CRUD `/tasks/:id/subtasks`
  - [ ] Contadores `subtasksCount`, `completedSubtasksCount`
  
- [ ] **Frontend Subtareas**
  - [ ] Componente `SubtaskList`
  - [ ] Componente `SubtaskItem` con checkbox
  - [ ] UI expandir/contraer en TaskCard
  - [ ] Barra de progreso visual

- [ ] **Tests para Subtareas**
  - [ ] Unit tests de lógica
  - [ ] Integration tests de API

---

## 📅 Sprint 3: Colaboración (2 semanas)

**Objetivo:** Habilitar trabajo en equipo efectivo.

### Tareas

- [ ] **Sistema de Comentarios**
  - [ ] Componente `CommentThread` en TaskDetail
  - [ ] Real-time updates (opcional: WebSockets)
  - [ ] Markdown básico en comentarios

- [ ] **Notificaciones**
  - [ ] Notificación al ser asignado
  - [ ] Notificación al recibir comentario
  - [ ] Centro de notificaciones en header

---

## 📅 Sprint 4: Visualización (2-3 semanas)

**Objetivo:** Nuevas formas de ver y organizar tareas.

### Tareas

- [ ] **Vista Calendario**
  - [ ] Integrar `react-big-calendar` o similar
  - [ ] Mostrar tareas por `dueDate`
  - [ ] Drag & drop para cambiar fechas

- [ ] **Recurrencia de Tareas**
  - [ ] UI selector de patrón (diario, semanal, mensual)
  - [ ] Job/Worker para crear instancias
  - [ ] Vista de próximas ocurrencias

---

## 📅 Sprint 5: Archivos y Adjuntos (1-2 semanas)

**Objetivo:** Completar sistema de attachments.

### Tareas

- [ ] **Upload Completo**
  - [ ] Configurar S3/R2 para producción
  - [ ] Componente drag & drop
  - [ ] Preview de PDFs
  - [ ] Límites de tamaño (10MB default)

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

1. **Listo:** Sprint 1 completado con éxito
   - Tests de hooks (useAuth, useTasks) implementados
   - Filtro "Mis Tareas" integrado en TaskList
   - Backend soporta `assignedToMe` query parameter
   
2. **Sprint 2:** Comenzar implementación de Subtareas
   - Backend: Endpoints CRUD `/tasks/:id/subtasks`
   - Frontend: Componentes SubtaskList y SubtaskItem
   
3. **Prioritario:** Verificar test coverage actual

---

*Sprint 1 completado. ¿Comenzamos con Sprint 2 (Subtareas)?*

