# Auditoría y Plan de Refactorización - Desktop App

**Fecha**: 9 de enero de 2026  
**Estado**: Fase 1 Completada ✅  
**Objetivo**: Refactorizar Desktop para igualar la App Web en diseño y componentes, preservando extras desktop-específicos

---

## ✅ Fase 1 Completada: Eliminación de Componentes UI Duplicados

**Cambios realizados:**
- Eliminados 27 componentes UI duplicados de `apps/desktop/src/components/ui/`
- Actualizados ~15 archivos para usar `@ordo-todo/ui` en lugar de imports locales
- Movido `SkipLinks.tsx` a `components/layout/` (componente desktop-específico)
- Type checks pasan: 0 errores

---

## 🏗️ Arquitectura Actual

### Stack Tecnológico

| Componente | Desktop | Web | Comentario |
|------------|---------|-----|------------|
| **Framework** | Vite + React 19 | Next.js 16 | Diferente pero compatible |
| **Router** | react-router-dom v7 | Next.js App Router | Diferente paradigma |
| **State** | Zustand | Zustand | ✅ Mismo |
| **API Client** | @ordo-todo/api-client | @ordo-todo/api-client | ✅ Mismo |
| **UI Base** | @radix-ui/* | @radix-ui/* | ✅ Mismo |
| **Estilos** | Tailwind v4 | Tailwind v4 | ✅ Mismo |
| **Electron** | v39.2.4 | N/A | Desktop exclusivo |

### Estructura de Archivos

```
apps/desktop/src/
├── components/          # 34 directorios, 139+ archivos
│   ├── ui/             # ❌ 28 componentes DUPLICADOS
│   ├── dashboard/      # 8 widgets
│   ├── task/           # 15 componentes
│   ├── project/        # 7 componentes
│   ├── timer/          # 6 componentes
│   └── ...otros
├── pages/              # 21 páginas
├── hooks/              # 17 archivos + api/ (17 hooks)
├── lib/                # 9 archivos utilitarios
├── stores/             # 10 stores Zustand
└── electron/           # 16 archivos (Desktop específico)
```

---

## ❌ Problemas Identificados

### 1. Componentes UI Duplicados (28 archivos)

**Ubicación**: `apps/desktop/src/components/ui/`

| Componente Duplicado | Existe en @ordo-todo/ui? | Acción |
|---------------------|--------------------------|--------|
| avatar.tsx | ✅ Sí | ELIMINAR, usar paquete |
| badge.tsx | ✅ Sí | ELIMINAR, usar paquete |
| button.tsx | ✅ Sí | ELIMINAR, usar paquete |
| calendar.tsx | ✅ Sí | ELIMINAR, usar paquete |
| card.tsx | ✅ Sí | ELIMINAR, usar paquete |
| checkbox.tsx | ✅ Sí | ELIMINAR, usar paquete |
| command.tsx | ✅ Sí | ELIMINAR, usar paquete |
| dialog.tsx | ✅ Sí | ELIMINAR, usar paquete |
| dropdown-menu.tsx | ✅ Sí | ELIMINAR, usar paquete |
| form.tsx | ✅ Sí | ELIMINAR, usar paquete |
| input.tsx | ✅ Sí | ELIMINAR, usar paquete |
| label.tsx | ✅ Sí | ELIMINAR, usar paquete |
| popover.tsx | ✅ Sí | ELIMINAR, usar paquete |
| progress.tsx | ✅ Sí | ELIMINAR, usar paquete |
| select.tsx | ✅ Sí | ELIMINAR, usar paquete |
| separator.tsx | ✅ Sí | ELIMINAR, usar paquete |
| sheet.tsx | ✅ Sí | ELIMINAR, usar paquete |
| slider.tsx | ✅ Sí | ELIMINAR, usar paquete |
| sonner.tsx | ✅ Sí | ELIMINAR, usar paquete |
| switch.tsx | ✅ Sí | ELIMINAR, usar paquete |
| table.tsx | ✅ Sí | ELIMINAR, usar paquete |
| tabs.tsx | ✅ Sí | ELIMINAR, usar paquete |
| textarea.tsx | ✅ Sí | ELIMINAR, usar paquete |
| tooltip.tsx | ✅ Sí | ELIMINAR, usar paquete |
| SkipLinks.tsx | ❓ Verificar | Mover a @ordo-todo/ui si no existe |
| VisuallyHidden.tsx | ✅ Sí (Radix) | ELIMINAR, usar @radix-ui/react-visually-hidden |
| empty-state.tsx | ✅ Sí | ELIMINAR, usar paquete |
| hover-card.tsx | ✅ Sí | ELIMINAR, usar paquete |

**Impacto**: ~6,500+ líneas de código duplicado que deben eliminarse

---

### 2. Hooks API Parcialmente Integrados

**Archivo actual**: `apps/desktop/src/lib/shared-hooks.ts`

| Hook Categoría | Exportados | Faltantes en Desktop | En @ordo-todo/hooks |
|---------------|-----------|---------------------|---------------------|
| Auth | 3 | - | ✅ |
| User | 2 | useFullProfile, useUserPreferences | ✅ |
| Workspace | 7 | useWorkspace, useWorkspaceBySlug | ✅ |
| Project | 8 | - | ✅ |
| Task | 7 | useShareTask, usePublicTask | ✅ |
| Tag | 4 | useTaskTags, useAssignTagToTask | ✅ |
| Timer | 2 | useActiveTimer, usePauseTimer, useResumeTimer | ✅ |
| Habits | 5 | useTodayHabits, useHabitStats | ✅ |
| Notifications | 0 | useNotifications, useMarkAsRead | ✅ |
| Notes | 0 | useNotes, useCreateNote | ✅ |
| Analytics | 0 | useDailyMetrics, useDashboardStats | ✅ |
| Objectives | 0 | useObjectives (tiene hook local) | ✅ |

---

### 3. TODOs y Código Incompleto

| Archivo | Línea | Descripción |
|---------|-------|-------------|
| Analytics.tsx | 63-76 | Datos hardcodeados: peakHour, currentStreak, topProject |
| session-history.tsx | 63 | TODO: Replace with actual API hook |
| TimerWidget.tsx | 4 | TODO: Implement actual timer functionality |
| project-card.tsx | 31 | TODO: Re-implement statistics with proper hooks |
| task-detail-panel.tsx | 539 | TODO: Implement task activities fetching |

---

## ✅ Features Desktop Exclusivas (Mantener)

### 1. Electron Integration (`electron/`)

| Archivo | Funcionalidad |
|---------|---------------|
| **main.ts** | Ventana principal, lifecycle de app |
| **tray.ts** | System tray con menú contextual |
| **menu.ts** | Menú nativo de aplicación |
| **shortcuts.ts** | Atajos de teclado globales |
| **ipc-handlers.ts** | Comunicación main↔renderer |
| **timer-window.ts** | Ventana flotante de timer |
| **deep-links.ts** | ordo-todo:// protocol handler |
| **auto-updater.ts** | Auto-actualización desde GitHub |
| **auto-launch.ts** | Iniciar con el sistema |
| **window-state.ts** | Persistencia de estado de ventana |
| **notifications.ts** | Notificaciones nativas del SO |

### 2. Hooks Desktop-Específicos (`hooks/`)

| Hook | Propósito |
|------|-----------|
| **useElectron.ts** | APIs de Electron (fs, shell, dialog) |
| **useAutoLaunch.ts** | Control de auto-inicio |
| **useAutoUpdater.ts** | Control de actualizaciones |
| **useDeepLinks.ts** | Manejo de deep links |
| **useTimerWindow.ts** | Control de ventana flotante |
| **useReducedMotion.ts** | Accesibilidad de animaciones |

### 3. Stores Desktop-Específicos (`stores/`)

| Store | Propósito |
|-------|-----------|
| **electron-store.ts** | Persistencia local con electron-store |
| **offline-store.ts** | Modo offline con SQLite |
| **sync-store.ts** | Sincronización con backend |

---

## 📋 Plan de Refactorización

### Fase 1: Eliminar Código Duplicado (Semana 1-2)

1. Eliminar `apps/desktop/src/components/ui/`
2. Actualizar todos los imports a `@ordo-todo/ui`
3. Verificar exports en paquete compartido

### Fase 2: Estandarizar Hooks API (Semana 2-3)

1. Expandir `shared-hooks.ts` con hooks faltantes
2. Eliminar hooks duplicados en `hooks/api/`

### Fase 3: Alinear Páginas con Web (Semana 3-5)

1. Refactorizar Dashboard
2. Añadir página Notes/Post-it
3. Resolver TODOs

### Fase 4: Mejorar Features Desktop (Semana 6-8)

1. Mejorar System Tray
2. Mejorar Notificaciones Nativas
3. Mejorar Modo Offline

---

## 📈 Métricas de Éxito

| Métrica | Actual | Meta |
|---------|--------|------|
| Componentes UI duplicados | 28 | 0 |
| Hooks duplicados | ~15 | 0 |
| Código compartido con Web | ~40% | ~80% |
| Consistencia visual | 60% | 95% |
| Features faltantes | 2 (Notes, Meetings) | 0 |
| TODOs sin resolver | 5 | 0 |

---

**Última actualización**: 9 de enero de 2026
