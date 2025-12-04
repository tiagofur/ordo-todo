# 🗺️ Ordo-Todo Desktop - Roadmap

**Versión**: 1.0.0  
**Última actualización**: 2025-12-04  
**Plataformas**: Windows, Linux, macOS

---

## 📊 Visión General

Crear una aplicación de escritorio nativa que ofrezca **paridad de funcionalidades con la app web**, más **características exclusivas de desktop** que mejoren la experiencia de productividad.

---

## 🎯 Objetivos del Proyecto

### Objetivos Principales
1. ✅ Paridad de features con Web App
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
├── v0.2.0 - MVP Desktop ──────────────────────────── Semana 6
│   └── System Tray, Shortcuts, Notifications, Dashboard Widgets
│
├── v0.3.0 - Analytics & Projects ─────────────────── Semana 10
│   └── Charts, Kanban Board, Timeline
│
└── v0.4.0 - AI & Polish ──────────────────────────── Semana 12
    └── AI Reports, i18n, Animaciones

Q2 2025 (Abr-Jun)
├── v0.5.0 - Offline Mode ─────────────────────────── Semana 14
│   └── SQLite local, Sync engine
│
├── v0.6.0 - Advanced Desktop ─────────────────────── Semana 16
│   └── Multi-window, Deep links, Auto-updates
│
└── v1.0.0 - Release Oficial ──────────────────────── Semana 18
    └── Estable, documentado, distribuido
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
| Dashboard Widgets | 🔴 Crítica | ✅ Completado |
| FAB Quick Actions | 🟡 Alta | ✅ Completado |

**Criterios de aceptación**:
- [x] Timer controlable desde system tray
- [x] Shortcuts funcionando (Ctrl+Shift+S, etc.)
- [x] Notificaciones nativas al terminar pomodoro
- [x] Dashboard muestra stats del día

---

### 🎯 Milestone 2: Analytics & Projects (v0.3.0)
**Deadline**: 10 semanas desde inicio  
**Estado**: ✅ Completado

| Feature | Prioridad | Estado |
|---------|-----------|--------|
| Weekly Chart | 🟡 Alta | ✅ Completado |
| Peak Hours Heatmap | 🟡 Alta | ✅ Completado |
| Focus Score Gauge | 🟢 Media | ✅ Completado |
| Productivity Insights | 🟢 Media | ✅ Completado |
| Kanban Board (drag & drop) | 🔴 Crítica | ✅ Completado |
| Project Timeline | 🟡 Alta | ✅ Completado |
| Task Detail Panel mejorado | 🟡 Alta | ✅ Completado |

**Criterios de aceptación**:
- [x] Charts renderizando datos reales
- [x] Kanban funcional con drag & drop
- [x] Task detail con subtasks, comments, attachments

---

### 🎯 Milestone 3: AI & Polish (v0.4.0)
**Deadline**: 12 semanas desde inicio  
**Estado**: ✅ Completado

| Feature | Prioridad | Estado |
|---------|-----------|--------|
| AI Reports | 🟡 Alta | ✅ Completado |
| i18n (es/en) | 🟡 Alta | ✅ Completado |
| Framer Motion animations | 🟢 Media | ✅ Completado |
| Accessibility audit | 🟢 Media | ✅ Completado |
| Performance optimization | 🟡 Alta | ✅ Completado |

**Criterios de aceptación**:
- [x] Generar reportes con IA
- [x] Cambiar idioma en runtime
- [x] Animaciones fluidas en transiciones
- [x] Skip links, ARIA labels, reduced motion support
- [x] Code splitting con React.lazy

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

**Criterios de aceptación**:
- [x] App funciona sin conexión
- [x] Datos sincronizan al reconectar
- [x] Conflictos resueltos correctamente

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
**Estado**: ✅ Completado

| Feature | Prioridad | Estado |
|---------|-----------|--------|
| Bug fixes finales | 🔴 Crítica | ✅ Completado |
| Documentación usuario | 🟡 Alta | ✅ Completado |
| Distribución Windows | 🔴 Crítica | ✅ Completado |
| Distribución Linux | 🔴 Crítica | ✅ Completado |
| Distribución macOS | 🔴 Crítica | ✅ Completado |
| Landing page update | 🟢 Media | ✅ Completado |

---

## 📦 Releases Planeados

### v0.1.0 (Actual)
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
**Estado**: ✅ Completado
- ✅ Analytics dashboard completo
- ✅ Charts con Recharts
- ✅ Kanban board con drag & drop
- ✅ Project timeline view
- ✅ Task detail panel mejorado

### v0.4.0 (AI & Polish)
**Estado**: ✅ Completado
- ✅ AI Reports
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
**Estado**: ✅ Completado
- ✅ Bug fixes finales
- ✅ Documentación completa
- ✅ Distribución en 3 plataformas

---

## 🔄 Comparativa Web vs Desktop

### Features Compartidos (Paridad)

| Feature | Web | Desktop |
|---------|-----|---------|
| Dashboard | ✅ | ✅ |
| Timer Pomodoro | ✅ | ✅ |
| Tasks CRUD | ✅ | ✅ |
| Projects | ✅ | ✅ |
| Tags | ✅ | ✅ |
| Analytics | ✅ | ✅ |
| AI Reports | ✅ | ✅ |
| Workspaces | ✅ | ✅ |
| Settings | ✅ | ✅ |
| i18n | ✅ | ✅ |

### Features Exclusivos Desktop

| Feature | Descripción | Estado |
|---------|-------------|--------|
| System Tray | Mini timer + quick actions | ✅ Completado |
| Global Shortcuts | Control desde cualquier app | ✅ Completado |
| Native Notifications | Alertas del sistema | ✅ Completado |
| Always on Top | Timer flotante | ✅ Completado |
| Offline Mode | SQLite + sync | ✅ Completado |
| Multi-Window | Timer en ventana separada | ✅ Completado |
| Deep Links | ordo://task/123 | ✅ Completado |
| Auto-Start | Iniciar con el sistema | ✅ Completado |
| Auto-Update | Actualizaciones automáticas | ✅ Completado |

---

## 📊 Métricas de Progreso

### Progreso General
```
Milestone 1 (MVP):      [██████████] 100%
Milestone 2 (Analytics): [██████████] 100%
Milestone 3 (AI):        [██████████] 100%
Milestone 4 (Offline):   [██████████] 100%
Milestone 5 (Advanced):  [██████████] 100%
Milestone 6 (Release):   [██████████] 100%

Total:                   [██████████] 100% 🎉
```

### Próximas Tareas (Sprint Actual)
1. ✅ Implementar System Tray
2. ✅ Implementar Global Shortcuts
3. ✅ Implementar Native Notifications
4. ✅ Crear timer-store.ts
5. ✅ Crear ui-store.ts
6. ✅ Integrar useElectron hook en App
7. ✅ Dashboard Widgets (StatsCard, Timer, Weekly, Projects, Upcoming)
8. ✅ FAB Quick Actions
9. ✅ Weekly Chart (Recharts)
10. ✅ Peak Hours Heatmap
11. ✅ Focus Score Gauge
12. ✅ Productivity Insights
13. ✅ Kanban Board con drag & drop
14. ✅ Project Timeline (Gantt-like)
15. ✅ Task Detail Panel (subtasks, comments, attachments)
16. ✅ AI Weekly Report (generador inteligente)
17. ✅ i18n (Español/English)
18. ✅ Framer Motion animations (page transitions, stagger)
19. ✅ Accessibility audit (WCAG AA) - SkipLinks, ARIA, useReducedMotion
20. ✅ Performance optimization (code splitting with React.lazy)
21. ✅ SQLite local database (better-sqlite3)
22. ✅ Offline task CRUD
23. ✅ Sync engine
24. ✅ Conflict resolution
25. ✅ Sync status indicator

### 🎉 PROYECTO COMPLETADO
El roadmap de Ordo-Todo Desktop v1.0.0 ha sido completado exitosamente.

**Fecha de Release**: 2025-12-04

Para futuras mejoras y features, consultar:
- [GitHub Issues](https://github.com/tiagofur/ordo-todo/issues)
- [GitHub Discussions](https://github.com/tiagofur/ordo-todo/discussions)

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
