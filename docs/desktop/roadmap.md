# 🗺️ Ordo-Todo Desktop - Roadmap

**Versión**: 1.0.0  
**Última actualización**: 2025-12-04  
**Plataformas**: Windows, Linux, macOS

> ⚠️ **NOTA**: Este documento ha sido actualizado para reflejar el estado REAL de implementación.  
> Ver [gaps-analysis.md](./gaps-analysis.md) para detalles de brechas.

---

## 📊 Visión General

Crear una aplicación de escritorio nativa que ofrezca **paridad de funcionalidades con la app web**, más **características exclusivas de desktop** que mejoren la experiencia de productividad.

---

## 🎯 Objetivos del Proyecto

### Objetivos Principales
1. ⏳ Paridad de features con Web App (EN PROGRESO - ver brechas)
2. ✅ Experiencia nativa de desktop (tray, shortcuts, notifications)
3. ✅ Rendimiento superior a navegador
4. ✅ Soporte offline completo
5. ✅ Distribución en Windows, Linux y macOS

### Métricas de Éxito
- 📈 Tiempo de carga < 2 segundos
- 📈 Uso de memoria < 200MB idle
- 📈 Sincronización offline < 5 segundos al reconectar
- 📈 Cobertura de tests > 80%

---

## 📅 Timeline de Releases

```
Q1 2025 (Ene-Mar)
├── v0.2.0 - MVP Desktop ──────────────────────────── ✅ Completado
│   └── System Tray, Shortcuts, Notifications, Dashboard Widgets
│
├── v0.3.0 - Analytics & Projects ─────────────────── ⏳ Parcial
│   └── Charts ✅, Kanban Board ⚠️, Timeline ❌
│
└── v0.4.0 - AI & Polish ──────────────────────────── ⏳ Parcial
    └── AI Reports ⚠️, i18n ✅, Animaciones ✅

Q2 2025 (Abr-Jun)
├── v0.5.0 - Offline Mode ─────────────────────────── ✅ Completado
│   └── SQLite local, Sync engine
│
├── v0.6.0 - Advanced Desktop ─────────────────────── ✅ Completado
│   └── Multi-window, Deep links, Auto-updates
│
└── v1.0.0 - Release Oficial ──────────────────────── ⏳ Pendiente paridad
    └── Requiere completar brechas con Web
```

---

## 🏁 Milestones

### 🎯 Milestone 1: MVP Desktop (v0.2.0)
**Deadline**: 6 semanas desde inicio  
**Estado**: ✅ Completado

| Feature | Prioridad | Estado |
|---------|-----------|--------|
| System Tray con mini timer | 🔴 Crítica | ✅ Completado |
| Global Shortcuts | 🔴 Crítica | ✅ Completado |
| Native Notifications | 🔴 Crítica | ✅ Completado |
| Window State Persistence | 🟡 Alta | ✅ Completado |
| Native Menus | 🟡 Alta | ✅ Completado |
| Dashboard Widgets | 🔴 Crítica | ✅ Completado (7 widgets) |
| FAB Quick Actions | 🟡 Alta | ✅ Completado |

**Criterios de aceptación**:
- [x] Timer controlable desde system tray
- [x] Shortcuts funcionando (Ctrl+Shift+S, etc.)
- [x] Notificaciones nativas al terminar pomodoro
- [x] Dashboard muestra stats del día

---

### 🎯 Milestone 2: Analytics & Projects (v0.3.0)
**Deadline**: 10 semanas desde inicio  
**Estado**: ⚠️ **PARCIAL** - Falta sistema Kanban completo

| Feature | Prioridad | Estado |
|---------|-----------|--------|
| Weekly Chart | 🟡 Alta | ✅ Completado |
| Peak Hours Heatmap | 🟡 Alta | ✅ Completado |
| Focus Score Gauge | 🟢 Media | ✅ Completado |
| Productivity Insights | 🟢 Media | ✅ Completado |
| Kanban Board (drag & drop) | 🔴 Crítica | ⚠️ **Básico** (falta migración completa) |
| Project Timeline | 🟡 Alta | ❌ **Falta** |
| Task Detail Panel mejorado | 🟡 Alta | ⚠️ **Stubs** (comments, attachments, activity) |

**Brechas identificadas**:
- [ ] Migrar `project-board.tsx`, `board-column.tsx`, `kanban-task-card.tsx`
- [ ] Implementar stubs de task detail (ver Sprint 2)
- [ ] Migrar `project-list.tsx`, `project-settings.tsx`

**Ver**: [sprint-1-kanban.md](./sprints/sprint-1-kanban.md)

---

### 🎯 Milestone 3: AI & Polish (v0.4.0)
**Deadline**: 12 semanas desde inicio  
**Estado**: ⚠️ **PARCIAL** - Faltan componentes AI

| Feature | Prioridad | Estado |
|---------|-----------|--------|
| AI Weekly Report | 🟡 Alta | ✅ Completado |
| Generate Report Dialog | 🟡 Alta | ❌ **Falta** |
| Report Card/List | 🟡 Alta | ❌ **Falta** |
| Report Detail | 🟡 Alta | ❌ **Falta** |
| i18n (es/en) | 🟡 Alta | ✅ Completado |
| Framer Motion animations | 🟢 Media | ✅ Completado |
| Accessibility audit | 🟢 Media | ✅ Completado |
| Performance optimization | 🟡 Alta | ✅ Completado |

**Ver**: [sprint-4-ai-components.md](./sprints/sprint-4-ai-components.md)

---

### 🎯 Milestone 4: Offline Mode (v0.5.0)
**Deadline**: 14 semanas desde inicio  
**Estado**: ✅ Completado

| Feature | Prioridad | Estado |
|---------|-----------|--------|
| SQLite local database | 🔴 Crítica | ✅ Completado |
| Offline task CRUD | 🔴 Crítica | ✅ Completado |
| Sync engine | 🔴 Crítica | ✅ Completado |
| Conflict resolution | 🟡 Alta | ✅ Completado |
| Sync status indicator | 🟢 Media | ✅ Completado |

---

### 🎯 Milestone 5: Advanced Desktop (v0.6.0)
**Deadline**: 16 semanas desde inicio  
**Estado**: ✅ Completado

| Feature | Prioridad | Estado |
|---------|-----------|--------|
| Timer Window flotante | 🟡 Alta | ✅ Completado |
| Deep Links (ordo://) | 🟢 Media | ✅ Completado |
| Auto-updates | 🔴 Crítica | ✅ Completado |
| Auto-start con sistema | 🟢 Media | ✅ Completado |

---

### 🎯 Milestone 6: Release v1.0.0
**Deadline**: 18 semanas desde inicio  
**Estado**: ⏳ **PENDIENTE** - Requiere completar paridad con Web

| Feature | Prioridad | Estado |
|---------|-----------|--------|
| Paridad con Web App | 🔴 Crítica | ⏳ En progreso |
| Bug fixes finales | 🔴 Crítica | ⏳ Pendiente |
| Documentación usuario | 🟡 Alta | ✅ Completado |
| Distribución Windows | 🔴 Crítica | ✅ Completado |
| Distribución Linux | 🔴 Crítica | ✅ Completado |
| Distribución macOS | 🔴 Crítica | ✅ Completado |
| Landing page update | 🟢 Media | ✅ Completado |

---

## 📦 Releases Planeados

### v0.1.0 (Base)
**Estado**: ✅ Completado
- ✅ Estructura base Electron + React + Vite
- ✅ Routing con react-router-dom
- ✅ UI components básicos (shadcn/ui)
- ✅ Task CRUD básico
- ✅ Timer básico
- ✅ Theme system (light/dark)
- ✅ Workspace selector

### v0.2.0 (MVP Desktop)
**Estado**: ✅ Completado
- ✅ System Tray con mini timer
- ✅ Global keyboard shortcuts
- ✅ Native notifications
- ✅ Dashboard widgets (stats, streak, upcoming)
- ✅ FAB quick actions
- ✅ Window state persistence
- ✅ Native application menu

### v0.3.0 (Analytics & Projects)
**Estado**: ⚠️ **PARCIAL**
- ✅ Analytics dashboard completo
- ✅ Charts con Recharts
- ⚠️ Kanban board (básico, falta migración completa)
- ❌ Project timeline view
- ⚠️ Task detail panel (stubs sin implementar)

### v0.4.0 (AI & Polish)
**Estado**: ⚠️ **PARCIAL**
- ✅ AI Weekly Report
- ❌ Generate Report Dialog
- ❌ Report Card/List/Detail
- ✅ Internacionalización (es/en)
- ✅ Animaciones con Framer Motion
- ✅ Performance optimizations

### v0.5.0 (Offline Mode)
**Estado**: ✅ Completado
- ✅ SQLite local database
- ✅ Offline-first architecture
- ✅ Sync engine
- ✅ Conflict resolution

### v0.6.0 (Advanced Desktop)
**Estado**: ✅ Completado
- ✅ Timer window flotante
- ✅ Deep links (ordo://)
- ✅ Auto-updates
- ✅ Auto-start

### v1.0.0 (Stable Release)
**Estado**: ⏳ **PENDIENTE**
- ⏳ Completar paridad con Web (ver brechas)
- ⏳ Bug fixes finales
- ✅ Documentación completa
- ✅ Distribución en 3 plataformas

---

## 🔄 Comparativa Web vs Desktop (Estado Real)

### Features con Paridad Confirmada

| Feature | Web | Desktop | Notas |
|---------|-----|---------|-------|
| Dashboard Widgets | ✅ 2 | ✅ 7 | Desktop superior |
| Timer Pomodoro | ✅ | ✅ | |
| Tasks CRUD | ✅ | ✅ | |
| Analytics Charts | ✅ | ✅ | |
| i18n | ✅ | ✅ | |
| Settings | ✅ | ✅ | |

### Features con Brechas

| Feature | Web | Desktop | Brecha |
|---------|-----|---------|--------|
| Project Components | 11 | 2 | 🔴 9 faltantes |
| Task Detail | 15 | 9 (5 stubs) | 🔴 Stubs vacíos |
| Workspace Components | 11 | 3 | 🟡 8 faltantes |
| AI Components | 4 | 1 | 🟡 3 faltantes |

### Features Exclusivos Desktop (Funcionando)

| Feature | Descripción | Estado |
|---------|-------------|--------|
| System Tray | Mini timer + quick actions | ✅ |
| Global Shortcuts | Control desde cualquier app | ✅ |
| Native Notifications | Alertas del sistema | ✅ |
| Always on Top | Timer flotante | ✅ |
| Offline Mode | SQLite + sync | ✅ |
| Multi-Window | Timer en ventana separada | ✅ |
| Deep Links | ordo://task/123 | ✅ |
| Auto-Start | Iniciar con el sistema | ✅ |
| Auto-Update | Actualizaciones automáticas | ✅ |

---

## 📊 Métricas de Progreso (Estado Real)

### Progreso por Milestone
```
Milestone 1 (MVP):       [██████████] 100% ✅
Milestone 2 (Analytics): [███████░░░]  70% ⚠️
Milestone 3 (AI):        [██████░░░░]  60% ⚠️
Milestone 4 (Offline):   [██████████] 100% ✅
Milestone 5 (Advanced):  [██████████] 100% ✅
Milestone 6 (Release):   [██████░░░░]  60% ⏳

Total:                   [████████░░]  82%
```

### Próximas Tareas (Sprint Actual)

#### Sprint 1: Sistema Kanban
- [ ] Migrar `project-board.tsx`
- [ ] Migrar `board-column.tsx`
- [ ] Migrar `kanban-task-card.tsx`
- [ ] Migrar `sortable-task.tsx`

#### Sprint 2: Task Detail Stubs
- [ ] Implementar `activity-feed.tsx`
- [ ] Implementar `attachment-list.tsx`
- [ ] Implementar `comment-thread.tsx`
- [ ] Implementar `file-upload.tsx`

#### Sprint 3: Workspace Members
- [ ] Migrar `invite-member-dialog.tsx`
- [ ] Migrar `workspace-members-settings.tsx`

#### Sprint 4: AI Components
- [ ] Migrar `generate-report-dialog.tsx`
- [ ] Migrar `report-card.tsx`
- [ ] Migrar `report-detail.tsx`

### Documentación Relacionada
- [gaps-analysis.md](./gaps-analysis.md) - Análisis completo de brechas
- [migration-steps.md](./migration-steps.md) - Guía de migración
- [sprints/](./sprints/) - Documentos de sprint detallados

---

## 🛠️ Stack Técnico

### Core
- **Runtime**: Electron 39.x
- **UI Framework**: React 19.x
- **Build Tool**: Vite 7.x
- **Language**: TypeScript 5.9

### State Management
- **Client State**: Zustand 5.x
- **Server State**: TanStack Query 5.x
- **Persistence**: electron-store 8.x

### UI/UX
- **Styling**: TailwindCSS 4.x
- **Components**: shadcn/ui (Radix)
- **Icons**: Lucide React
- **Animations**: Framer Motion 11.x
- **Charts**: Recharts 2.x

### Desktop Features
- **Database (offline)**: better-sqlite3 + Drizzle ORM
- **Notifications**: Electron Notification API
- **Tray**: Electron Tray API
- **Shortcuts**: Electron globalShortcut API

### Build & Distribution
- **Packager**: electron-builder 26.x
- **Code Signing**: TBD
- **Auto-Update**: electron-updater (planned)

---

## 📝 Notas de Desarrollo

### Decisiones Arquitectónicas

1. **Zustand vs Redux**: Zustand por simplicidad y menor boilerplate
2. **TanStack Query**: Para cache y sincronización con backend
3. **electron-store**: Para persistencia local simple (settings, tokens)
4. **better-sqlite3**: Para offline mode (vs IndexedDB) - mejor rendimiento
5. **Vite vs Webpack**: Vite por velocidad de desarrollo

### Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Complejidad sync offline | Alta | Alto | Comenzar con sync simple, iterar |
| Performance en listas grandes | Media | Medio | Virtualización con react-window |
| Compatibilidad cross-platform | Media | Alto | Testing en 3 OS desde fase 1 |
| Auto-update en Linux | Media | Medio | AppImage + manual fallback |

---

**Actualizado por**: Sistema  
**Próxima revisión**: Semanal
