# 🖥️ Ordo-Todo Desktop - Plan de Implementación

**Versión**: 1.0.0  
**Última actualización**: 2025-12-04  
**Objetivo**: Paridad de features con Web App + características nativas de desktop

---

## 📊 Resumen Ejecutivo

### Estado Actual Desktop vs Web

| Feature | Web | Desktop | Gap |
|---------|-----|---------|-----|
| Dashboard básico | ✅ | ✅ | - |
| Dashboard avanzado (widgets, FAB) | ✅ | ❌ | 🔴 Alto |
| Timer Pomodoro | ✅ | ✅ (básico) | 🟡 Medio |
| Tasks CRUD | ✅ | ✅ | ✅ |
| Task Detail Panel | ✅ | ❌ | 🔴 Alto |
| Kanban Board | ✅ | ❌ | 🔴 Alto |
| Project Timeline | ✅ | ❌ | 🟡 Medio |
| Analytics | ✅ | ❌ | 🔴 Alto |
| AI Reports | ✅ | ❌ | 🟡 Medio |
| i18n | ✅ | ❌ | 🟡 Medio |
| System Tray | N/A | ❌ | 🔴 Alto |
| Global Shortcuts | N/A | ❌ | 🔴 Alto |
| Native Notifications | N/A | ❌ | 🔴 Alto |
| Offline Mode | ❌ | ❌ | 🟡 Medio |

---

## 🏗️ Arquitectura de Estado

### Estrategia Híbrida: Zustand + TanStack Query

```
┌─────────────────────────────────────────────────────────────┐
│                    ESTADO DE LA APP                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐     ┌────────────────────────────────┐ │
│  │   ZUSTAND       │     │   TANSTACK QUERY               │ │
│  │   (Client)      │     │   (Server State)               │ │
│  ├─────────────────┤     ├────────────────────────────────┤ │
│  │ • UI State      │     │ • Tasks (cache + sync)         │ │
│  │ • Timer State   │     │ • Projects                     │ │
│  │ • Preferences   │     │ • Tags                         │ │
│  │ • Window State  │     │ • Analytics                    │ │
│  │ • Shortcuts     │     │ • Workspaces                   │ │
│  │ • Notifications │     │ • AI Reports                   │ │
│  └─────────────────┘     └────────────────────────────────┘ │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │   ELECTRON STORE (Persistencia Local)                   │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ • Window bounds • Auth tokens • Theme • Timer settings  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Stores a Crear

```typescript
// src/stores/
├── workspace-store.ts    // ✅ Existe
├── timer-store.ts        // 🆕 Estado del timer + settings
├── ui-store.ts           // 🆕 Sidebar, modals, panels
├── shortcuts-store.ts    // 🆕 Global shortcuts config
├── notification-store.ts // 🆕 Cola de notificaciones
├── window-store.ts       // 🆕 Window state + multi-window
└── offline-store.ts      // 🆕 Sync queue + offline cache
```

---

## 📅 Fases de Desarrollo

### FASE 1: Fundamentos Desktop (2-3 semanas)
**Prioridad**: 🔴 CRÍTICA  
**Objetivo**: Establecer arquitectura base y features nativos esenciales

#### 1.1 System Tray + Global Shortcuts (5 días)

**Archivos a crear/modificar**:

```
electron/
├── main.ts              // Modificar: agregar Tray + shortcuts
├── tray.ts              // 🆕 Configuración del tray
├── shortcuts.ts         // 🆕 Registro de shortcuts globales
├── ipc-handlers.ts      // 🆕 Comunicación main ↔ renderer
└── preload.ts           // Modificar: exponer APIs

src/
├── stores/
│   ├── timer-store.ts   // 🆕 Estado del timer sincronizado
│   └── shortcuts-store.ts // 🆕 Configuración de shortcuts
├── hooks/
│   ├── use-electron.ts  // 🆕 Hook para APIs de Electron
│   └── use-global-shortcuts.ts // 🆕 Hook para shortcuts
└── components/
    └── tray/
        └── TrayMenu.tsx // 🆕 (opcional, para contexto)
```

**Features**:
- ✅ Icono en system tray con menú contextual
- ✅ Mini timer en tray (tiempo restante)
- ✅ Quick actions: Start/Stop, Pause, Skip
- ✅ Global shortcuts configurables:
  - `Ctrl+Shift+S`: Start/Stop timer
  - `Ctrl+Shift+P`: Pause/Resume
  - `Ctrl+Shift+N`: Nueva tarea rápida
  - `Ctrl+Shift+T`: Mostrar/ocultar ventana

**Código ejemplo - Tray**:

```typescript
// electron/tray.ts
import { Tray, Menu, nativeImage, app } from 'electron';
import path from 'path';

let tray: Tray | null = null;

interface TrayState {
  timerActive: boolean;
  timeRemaining: string;
  currentTask: string | null;
}

export function createTray(mainWindow: BrowserWindow) {
  const iconPath = path.join(__dirname, '../build/tray-icon.png');
  tray = new Tray(nativeImage.createFromPath(iconPath));
  
  tray.setToolTip('Ordo-Todo');
  updateTrayMenu({ timerActive: false, timeRemaining: '25:00', currentTask: null });
  
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
  
  return tray;
}

export function updateTrayMenu(state: TrayState) {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: state.currentTask || 'Sin tarea seleccionada',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: `⏱️ ${state.timeRemaining}`,
      enabled: false,
    },
    {
      label: state.timerActive ? '⏸️ Pausar' : '▶️ Iniciar',
      click: () => {/* IPC to renderer */}
    },
    {
      label: '⏭️ Saltar',
      enabled: state.timerActive,
      click: () => {/* IPC to renderer */}
    },
    { type: 'separator' },
    {
      label: '➕ Nueva Tarea',
      accelerator: 'CmdOrCtrl+Shift+N',
      click: () => {/* IPC to renderer */}
    },
    { type: 'separator' },
    {
      label: 'Salir',
      click: () => app.quit()
    }
  ]);
  
  tray?.setContextMenu(contextMenu);
}
```

#### 1.2 Native Notifications (2 días)

**Archivos**:
```
electron/
└── notifications.ts     // 🆕 Manejo de notificaciones

src/
├── stores/
│   └── notification-store.ts // 🆕 Cola y preferencias
└── hooks/
    └── use-notifications.ts  // 🆕 Hook para notificar
```

**Features**:
- ✅ Notificación al terminar pomodoro
- ✅ Notificación de tareas vencidas
- ✅ Notificación de inicio/fin de descanso
- ✅ Sonidos configurables
- ✅ Respeto a "Do Not Disturb" del sistema

**Código ejemplo**:

```typescript
// electron/notifications.ts
import { Notification, shell } from 'electron';

interface NotificationOptions {
  title: string;
  body: string;
  silent?: boolean;
  sound?: string;
  onClick?: () => void;
}

export function showNotification(options: NotificationOptions) {
  const notification = new Notification({
    title: options.title,
    body: options.body,
    silent: options.silent ?? false,
    icon: path.join(__dirname, '../build/icon.png'),
  });
  
  notification.on('click', () => {
    options.onClick?.();
  });
  
  notification.show();
  
  // Play custom sound if specified
  if (options.sound) {
    shell.beep();
  }
}
```

#### 1.3 Window State Management (2 días)

**Archivos**:
```
electron/
├── window-state.ts      // 🆕 Persistencia de estado
└── main.ts              // Modificar: usar window-state

src/
└── stores/
    └── window-store.ts  // 🆕 Zustand para UI state
```

**Features**:
- ✅ Recordar posición y tamaño de ventana
- ✅ Recordar si estaba maximizada
- ✅ Auto-start con el sistema (opcional)
- ✅ Minimizar a tray (opcional)
- ✅ Always on top (para timer flotante)

#### 1.4 Native Menus (1 día)

**Archivos**:
```
electron/
└── menu.ts              // 🆕 Menú de aplicación nativo
```

**Menú estructura**:
```
File
├── Nueva Tarea (Ctrl+N)
├── Nuevo Proyecto (Ctrl+Shift+P)
├── ─────────────
├── Importar...
├── Exportar...
├── ─────────────
└── Salir (Ctrl+Q)

Edit
├── Deshacer (Ctrl+Z)
├── Rehacer (Ctrl+Y)
├── ─────────────
├── Cortar (Ctrl+X)
├── Copiar (Ctrl+C)
└── Pegar (Ctrl+V)

View
├── Recargar (Ctrl+R)
├── Toggle DevTools (Ctrl+Shift+I)
├── ─────────────
├── Zoom In (Ctrl++)
├── Zoom Out (Ctrl+-)
├── Reset Zoom (Ctrl+0)
├── ─────────────
├── Pantalla Completa (F11)
└── Always on Top (Ctrl+T)

Timer
├── Iniciar/Pausar (Ctrl+Space)
├── Saltar (Ctrl+S)
├── Reiniciar (Ctrl+R)
├── ─────────────
├── Modo Trabajo
├── Descanso Corto
└── Descanso Largo

Help
├── Documentación
├── Reportar Bug
├── ─────────────
└── Acerca de Ordo-Todo
```

---

### FASE 2: Dashboard Avanzado (1-2 semanas)
**Prioridad**: 🔴 Alta  
**Objetivo**: Paridad con web dashboard

#### 2.1 Dashboard Widgets (4 días)

**Componentes a crear**:
```
src/components/dashboard/
├── StatsCard.tsx           // 🆕 Card de estadística individual
├── DailyStatsGrid.tsx      // 🆕 Grid de stats del día
├── ProductivityStreakWidget.tsx // 🆕 Racha de productividad
├── UpcomingTasksWidget.tsx // 🆕 Próximas tareas
├── QuickActionsWidget.tsx  // 🆕 Acciones rápidas
├── FocusScoreGauge.tsx     // 🆕 Gauge de focus score
└── MiniTimerWidget.tsx     // 🆕 Mini timer embebido
```

**Migración desde Web**:
- `weekly-chart.tsx` → Adaptar (quitar "use client", ajustar imports)
- `productivity-streak-widget.tsx` → Migrar
- `upcoming-tasks-widget.tsx` → Migrar
- `focus-score-gauge.tsx` → Migrar

**Diseño Desktop Dashboard**:
```
┌─────────────────────────────────────────────────────────────┐
│ Hoy - Viernes, 4 de Diciembre 2025                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ ✅ 5     │ │ ⏱️ 3.5h  │ │ 🔥 7 días│ │ 📊 85%   │       │
│  │Completado│ │ Trabajado│ │ Racha    │ │ Focus    │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  ┌─────────────────────────┐ ┌────────────────────────────┐ │
│  │     MINI TIMER          │ │   TAREAS DE HOY            │ │
│  │                         │ │                            │ │
│  │      ⏱️ 23:45           │ │   ☐ Task 1                 │ │
│  │    [Pause] [Skip]       │ │   ☐ Task 2                 │ │
│  │                         │ │   ☑ Task 3 (done)          │ │
│  └─────────────────────────┘ │   ☐ Task 4                 │ │
│                              └────────────────────────────┘ │
│  ┌─────────────────────────┐ ┌────────────────────────────┐ │
│  │   PRÓXIMAS TAREAS       │ │   QUICK ACTIONS            │ │
│  │                         │ │                            │ │
│  │   📅 Mañana (2)         │ │   [+ Tarea] [+ Proyecto]   │ │
│  │   📅 Esta semana (5)    │ │   [▶ Timer] [📊 Analytics] │ │
│  └─────────────────────────┘ └────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 2.2 FAB Quick Actions (2 días)

**Componentes**:
```
src/components/fab/
├── FloatingActionButton.tsx // 🆕 FAB principal
├── QuickActionMenu.tsx      // 🆕 Menú expandible
└── QuickTaskInput.tsx       // 🆕 Input inline para tarea rápida
```

**Features**:
- ✅ Botón flotante en esquina inferior derecha
- ✅ Expandible con animación
- ✅ Opciones: Nueva Tarea, Nuevo Proyecto, Iniciar Timer
- ✅ Input rápido de tarea (sin dialog completo)

---

### FASE 3: Analytics & Charts (1-2 semanas)
**Prioridad**: 🟡 Media-Alta  
**Objetivo**: Visualización de productividad

#### 3.1 Integración de Recharts (3 días)

**Dependencias a agregar**:
```json
{
  "recharts": "^2.13.0"
}
```

**Componentes a migrar/crear**:
```
src/components/analytics/
├── WeeklyChart.tsx         // 🆕 Gráfico semanal
├── PeakHoursChart.tsx      // 🆕 Horas pico
├── ProductivityInsights.tsx // 🆕 Insights con IA
├── FocusScoreGauge.tsx     // 🆕 Gauge radial
├── DailyMetricsCard.tsx    // 🆕 Métricas del día
└── AnalyticsDashboard.tsx  // 🆕 Vista principal
```

#### 3.2 Analytics Page (2 días)

**Diseño**:
```
┌─────────────────────────────────────────────────────────────┐
│ Analytics                                             [Week]│
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                 WEEKLY CHART                            ││
│  │     📊 [================== Chart Area ===============]  ││
│  │         Mon  Tue  Wed  Thu  Fri  Sat  Sun               ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────┐ ┌────────────────────────────────┐│
│  │    FOCUS SCORE       │ │   PEAK HOURS                   ││
│  │                      │ │                                ││
│  │      [Gauge]         │ │   [Heatmap Chart]              ││
│  │        85%           │ │                                ││
│  └──────────────────────┘ └────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                 PRODUCTIVITY INSIGHTS                   ││
│  │                                                          ││
│  │   💡 Tu hora más productiva es a las 10:00 AM           ││
│  │   📈 Has mejorado un 15% respecto a la semana pasada    ││
│  │   🎯 Completas más tareas los miércoles                 ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 3.3 Hooks de Analytics (2 días)

**Hooks a crear**:
```
src/hooks/api/
└── use-analytics.ts        // ✅ Existe (revisar y expandir)

src/hooks/
├── use-productivity-stats.ts // 🆕 Cálculos de productividad
└── use-focus-metrics.ts     // 🆕 Métricas de focus
```

---

### FASE 4: Kanban & Project Features (1-2 semanas)
**Prioridad**: 🟡 Media  
**Objetivo**: Gestión visual de proyectos

#### 4.1 Kanban Board (5 días)

**Dependencias**:
```json
{
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

**Componentes a crear**:
```
src/components/project/
├── ProjectBoard.tsx        // 🆕 Contenedor DnD
├── BoardColumn.tsx         // 🆕 Columna (TODO, IN_PROGRESS, etc.)
├── KanbanTaskCard.tsx      // 🆕 Card arrastrable
├── SortableTask.tsx        // 🆕 Wrapper sortable
└── CreateColumnDialog.tsx  // 🆕 Agregar columnas custom
```

**Features**:
- ✅ Drag & drop entre columnas
- ✅ Reordenar tareas dentro de columna
- ✅ Columnas por defecto: TODO, IN_PROGRESS, COMPLETED
- ✅ Vista optimista (update local antes de server)
- ✅ Animaciones fluidas con dnd-kit

#### 4.2 Project Timeline (2 días)

**Componentes**:
```
src/components/project/
└── ProjectTimeline.tsx     // 🆕 Vista cronológica
```

**Migración directa desde Web** (adaptar imports):
- `project-timeline.tsx` → Copiar y adaptar

#### 4.3 Task Detail Panel (3 días)

**Componentes a mejorar**:
```
src/components/task/
├── task-detail-panel.tsx   // ✅ Existe (expandir)
├── SubtaskList.tsx         // 🆕 Lista de subtareas
├── CommentThread.tsx       // 🆕 Comentarios
├── AttachmentList.tsx      // 🆕 Archivos adjuntos
├── ActivityFeed.tsx        // 🆕 Historial de cambios
└── TaskMetadata.tsx        // 🆕 Fechas, asignados, etc.
```

---

### FASE 5: AI Reports (1 semana)
**Prioridad**: 🟡 Media  
**Objetivo**: Reportes generados con IA

#### 5.1 Report Components (3 días)

**Componentes a crear**:
```
src/components/ai/
├── GenerateReportDialog.tsx // 🆕 Dialog para generar
├── ReportCard.tsx          // 🆕 Card de reporte en lista
├── ReportDetail.tsx        // 🆕 Vista detallada
└── AIAssistantSidebar.tsx  // 🆕 (Opcional) Chat sidebar
```

#### 5.2 Reports Page (2 días)

**Features**:
- ✅ Generar reporte semanal/mensual
- ✅ Historial de reportes
- ✅ Exportar a PDF/Markdown
- ✅ Insights automáticos

---

### FASE 6: i18n & Polish (1 semana)
**Prioridad**: 🟢 Normal  
**Objetivo**: Internacionalización y pulido

#### 6.1 Internacionalización (3 días)

**Dependencias**:
```json
{
  "i18next": "^23.0.0",
  "react-i18next": "^14.0.0"
}
```

**Estructura**:
```
src/
├── i18n/
│   ├── config.ts           // 🆕 Configuración i18n
│   └── locales/
│       ├── es.json         // 🆕 Español
│       └── en.json         // 🆕 Inglés
└── hooks/
    └── use-translations.ts // 🆕 Hook helper
```

#### 6.2 Animaciones con Framer Motion (2 días)

**Dependencias**:
```json
{
  "framer-motion": "^11.0.0"
}
```

**Áreas a animar**:
- ✅ Page transitions
- ✅ Modal/Dialog open/close
- ✅ FAB expand/collapse
- ✅ Task card hover effects
- ✅ Timer pulse effect
- ✅ List item enter/exit

#### 6.3 Polish & Bug Fixes (2 días)

- ✅ Revisar responsive design
- ✅ Accesibilidad (keyboard navigation)
- ✅ Performance optimization
- ✅ Error boundaries
- ✅ Loading states

---

### FASE 7: Offline & Sync (2 semanas)
**Prioridad**: 🟢 Normal (pero alta complejidad)  
**Objetivo**: Funcionamiento sin conexión

#### 7.1 SQLite Local Database (5 días)

**Dependencias**:
```json
{
  "better-sqlite3": "^11.0.0",
  "drizzle-orm": "^0.33.0"
}
```

**Estructura**:
```
electron/
├── database/
│   ├── schema.ts           // 🆕 Schema Drizzle
│   ├── migrations/         // 🆕 Migraciones
│   └── sync.ts             // 🆕 Lógica de sincronización
└── ipc/
    └── database-handlers.ts // 🆕 Handlers IPC para DB
```

#### 7.2 Sync Engine (5 días)

**Features**:
- ✅ Detectar cambios locales
- ✅ Queue de operaciones pendientes
- ✅ Resolución de conflictos
- ✅ Sync automático al recuperar conexión
- ✅ Indicador de estado de sync

---

### FASE 8: Multi-Window & Advanced (1 semana)
**Prioridad**: 🟢 Baja  
**Objetivo**: Features avanzados de desktop

#### 8.1 Timer Window Flotante (3 días)

**Archivos**:
```
electron/
├── windows/
│   ├── main-window.ts      // 🆕 Ventana principal
│   └── timer-window.ts     // 🆕 Ventana flotante timer
└── ipc/
    └── window-handlers.ts  // 🆕 Comunicación entre ventanas
```

**Features**:
- ✅ Ventana pequeña, siempre visible
- ✅ Borderless, solo timer
- ✅ Drag para mover
- ✅ Click derecho para opciones
- ✅ Sincronizada con ventana principal

#### 8.2 Deep Links (2 días)

**Features**:
- ✅ `ordo://task/123` - Abrir tarea
- ✅ `ordo://project/456` - Abrir proyecto
- ✅ `ordo://timer/start` - Iniciar timer
- ✅ Registro de protocolo en instalación

---

## 📊 Estimación de Esfuerzo Total

| Fase | Duración | Esfuerzo | Prioridad |
|------|----------|----------|-----------|
| Fase 1: Fundamentos Desktop | 2-3 semanas | 🔴 Alto | CRÍTICA |
| Fase 2: Dashboard Avanzado | 1-2 semanas | 🟡 Medio | Alta |
| Fase 3: Analytics | 1-2 semanas | 🟡 Medio | Media-Alta |
| Fase 4: Kanban & Projects | 1-2 semanas | 🟡 Medio | Media |
| Fase 5: AI Reports | 1 semana | 🟢 Bajo | Media |
| Fase 6: i18n & Polish | 1 semana | 🟢 Bajo | Normal |
| Fase 7: Offline & Sync | 2 semanas | 🔴 Alto | Normal |
| Fase 8: Multi-Window | 1 semana | 🟡 Medio | Baja |

**Total estimado**: 10-14 semanas (2.5-3.5 meses)

---

## 🎯 MVP Desktop (Fases 1-3)

Para un MVP funcional, enfocarse en:

1. ✅ System Tray + Global Shortcuts (Fase 1.1)
2. ✅ Native Notifications (Fase 1.2)
3. ✅ Dashboard Widgets (Fase 2.1)
4. ✅ Analytics básicos (Fase 3.1-3.2)

**MVP Timeline**: 4-6 semanas

---

## 🔧 Configuraciones Adicionales

### Vite Config para Electron

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron', 'better-sqlite3'],
            },
          },
        },
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          options.reload();
        },
      },
    ]),
    renderer(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
```

### Preload Script Completo

```typescript
// electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  // Timer controls
  timer: {
    start: () => ipcRenderer.invoke('timer:start'),
    pause: () => ipcRenderer.invoke('timer:pause'),
    stop: () => ipcRenderer.invoke('timer:stop'),
    skip: () => ipcRenderer.invoke('timer:skip'),
    onUpdate: (callback: (state: any) => void) => {
      ipcRenderer.on('timer:update', (_, state) => callback(state));
    },
  },
  
  // Notifications
  notification: {
    show: (options: any) => ipcRenderer.invoke('notification:show', options),
  },
  
  // Window controls
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    setAlwaysOnTop: (flag: boolean) => ipcRenderer.invoke('window:alwaysOnTop', flag),
    openTimerWindow: () => ipcRenderer.invoke('window:openTimer'),
  },
  
  // Shortcuts
  shortcuts: {
    register: (shortcuts: any) => ipcRenderer.invoke('shortcuts:register', shortcuts),
    unregister: (id: string) => ipcRenderer.invoke('shortcuts:unregister', id),
    onShortcut: (callback: (action: string) => void) => {
      ipcRenderer.on('shortcut:triggered', (_, action) => callback(action));
    },
  },
  
  // Database (for offline)
  database: {
    query: (sql: string, params?: any[]) => ipcRenderer.invoke('db:query', sql, params),
    execute: (sql: string, params?: any[]) => ipcRenderer.invoke('db:execute', sql, params),
  },
  
  // Store (electron-store)
  store: {
    get: (key: string) => ipcRenderer.invoke('store:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('store:set', key, value),
    delete: (key: string) => ipcRenderer.invoke('store:delete', key),
  },
});
```

---

## 📝 Checklist de Migración Web → Desktop

### Por cada componente a migrar:

- [ ] Remover `"use client"` (no aplica en Vite/React)
- [ ] Cambiar imports de `next/` a equivalentes React
- [ ] Cambiar `next-intl` a `react-i18next`
- [ ] Cambiar `next/image` a `<img>` o componente custom
- [ ] Cambiar `next/link` a `react-router-dom`
- [ ] Verificar compatibilidad de hooks
- [ ] Adaptar estilos si usan CSS Modules → TailwindCSS

### Equivalencias de Imports:

| Web (Next.js) | Desktop (React + Vite) |
|---------------|------------------------|
| `"use client"` | No necesario |
| `next/image` | `<img>` + lazy loading |
| `next/link` | `<Link>` de react-router-dom |
| `useRouter()` (next) | `useNavigate()` (react-router) |
| `useSearchParams()` | `useSearchParams()` (react-router) |
| `next-intl` | `react-i18next` |
| Server Components | Client Components (todo) |

---

## 🚀 Próximos Pasos Inmediatos

1. **Crear rama de feature**: `feature/desktop-phase-1`
2. **Implementar System Tray** (electron/tray.ts)
3. **Implementar Global Shortcuts** (electron/shortcuts.ts)
4. **Crear stores faltantes** (timer-store, ui-store)
5. **Probar en Windows, Linux, macOS**

---

**¡Listo para comenzar! 🎉**
