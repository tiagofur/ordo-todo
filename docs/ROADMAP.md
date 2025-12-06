# 🗺️ Ordo-Todo - Roadmap de Desarrollo

**Última actualización:** Diciembre 2025  
**Estrategia:** Híbrida (Crítico + Alcanzable = Máximo Impacto)

---

## 📊 Resumen Ejecutivo

| Área | Estado | Progreso |
|------|--------|----------|
| **Backend API** | ✅ Estable | 95% |
| **Web App** | ✅ Funcional | 90% |
| **Desktop App** | ✅ Funcional | 85% |
| **Mobile App** | 🟡 En Progreso | 60% |
| **Gamificación** | ✅ Backend Completo | 80% |
| **AI Features** | 🟡 Parcial | 50% |

---

## ✅ Sprints Completados

### Sprint 1: Fundamentos ✅
- [x] Setup Jest/Vitest para testing
- [x] Tests para use cases principales
- [x] Sistema de asignación de tareas
- [x] Dashboard Quick Actions (FAB)

### Sprint 2: Subtareas ✅
- [x] Endpoints CRUD `/tasks/:id/subtasks`
- [x] Componente `SubtaskList` con progress tracking
- [x] Barra de progreso visual
- [x] Tests unitarios e integración

### Sprint 3: Colaboración ✅
- [x] Sistema de Notificaciones completo
- [x] Comentarios con menciones (@usuario)
- [x] Compartir tareas (link público)
- [x] Workspace invitations

### Sprint 4: Productividad ✅
- [x] Pomodoro Timer avanzado
- [x] Gamificación básica (XP, niveles, logros)
- [x] Vista Calendario
- [x] Recurrencia de tareas

### Sprint 5: Archivos ✅
- [x] Sistema de attachments completo
- [x] Drag & drop upload
- [x] Preview de archivos
- [x] Límites de tamaño configurables

---

## � Sprint Actual: Polish & Testing

**Objetivo:** Preparar para release público.

### Testing E2E
- [ ] Setup Playwright
- [ ] Flujo completo: registro → workspace → proyecto → tarea
- [ ] Tests de regresión visual

### Performance
- [ ] Auditoría Lighthouse (meta: 90+)
- [ ] Lazy loading de componentes pesados
- [ ] Optimización de queries Prisma

### Documentación Usuario
- [ ] Guía de inicio rápido
- [ ] FAQ
- [ ] Videos tutoriales (opcional)

---

## 🔮 Próximos Sprints

### Sprint 7: AI & Intelligence
- [ ] Sugerencias inteligentes de tareas
- [ ] Estimación automática de tiempo
- [ ] Análisis de patrones de productividad
- [ ] Energy Matching (tareas según energía)

### Sprint 8: Mobile Parity
- [ ] Autenticación OAuth en mobile
- [ ] Paridad completa de features web → mobile
- [ ] Push notifications nativas
- [ ] Offline sync

### Sprint 9: Integraciones
- [ ] Google Calendar sync
- [ ] Slack integration
- [ ] GitHub issues import

---

## 🔄 Consolidación de Código Compartido (Fase 2 Completada ✅)

**Objetivo:** Eliminar duplicación de código entre apps/web y apps/desktop.

### Estado de @ordo-todo/ui (Actualizado: 2024-12-06)

| Categoría | Migrados | Pendientes | Estado |
|-----------|----------|------------|--------|
| **UI Base** | 30 | 0 | ✅ Completo |
| **Timer** | 4 | 0 | ✅ Completo (props-driven) |
| **Task** | 15 | 0 | ✅ Completo (props-driven) |
| **Project** | 11 | 0 | ✅ Completo (props-driven) |
| **Analytics** | 7 | 0 | ✅ Completo (props-driven) |
| **Tag** | 3 | 0 | ✅ Completo |
| **Workspace** | 0 | 11 | 🔴 Pendiente (Fase 3) |
| **Layout** | 0 | 4 | 🔴 Pendiente (Fase 3) |
| **Auth** | 0 | 2 | 🔴 Pendiente (Fase 3) |
| **AI** | 0 | 5 | 🔴 Pendiente (Fase 3) |

### Fases del Proceso

- [x] **Fase 1:** Migrar 30 componentes UI base ✅
- [x] **Fase 2:** Migrar componentes dominio (task, project, analytics, timer) ✅
- [x] **Fase 3:** Migrar workspace, auth, ai ✅ (parcial - layout, shared pendientes)
- [ ] **Fase 4:** Actualizar imports en apps (web + desktop)
- [ ] **Fase 5:** Crear @ordo-todo/stores
- [ ] **Fase 6:** Migrar utilidades
- [ ] **Fase 7:** Testing con Storybook

> **✅ Logro:** `packages/ui` compila sin errores. Componentes workspace, auth y ai migrados a platform-agnostic.

## 📱 Desktop App - Estado

| Feature | Estado |
|---------|--------|
| System Tray + Timer | ✅ Completo |
| Global Shortcuts | ✅ Completo |
| Native Notifications | ✅ Completo |
| Dashboard Widgets (7) | ✅ Completo |
| Offline Mode | ✅ Completo |
| Auto-updates | ✅ Completo |
| Multi-window | ✅ Completo |
| Kanban Board | ⚠️ Básico |
| AI Reports | 🔴 Pendiente |

---

## � Métricas de Éxito

| Métrica | Actual | Meta MVP |
|---------|--------|----------|
| Test Coverage | ~40% | 60% |
| Lighthouse Score | ~75 | 90+ |
| Features Completos | 35+ | 40 |
| Bugs Críticos | 0 | 0 |

---

## 🎯 Prioridades Inmediatas

En orden de importancia:

1. **Testing E2E** - Estabilidad antes de features
2. **Mobile Auth** - Desbloquea adopción mobile
3. **AI Suggestions** - Diferenciador competitivo
4. **Performance** - Experiencia de usuario

---

## 💡 Features Futuros (Post-MVP)

| Feature | Prioridad | Notas |
|---------|-----------|-------|
| AI Suggestions | Alta | Requiere API key |
| Google Calendar | Media | OAuth adicional |
| Slack Integration | Media | Webhooks |
| Team Analytics | Baja | Para workspaces compartidos |
| Browser Extension | Baja | Quick capture |

---

**¿Comenzamos con el Sprint 6 (Polish & Testing)?**
