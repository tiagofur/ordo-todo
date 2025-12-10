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
| **AI Features** | 🟡 En Mejora | 50% → 80% (plan activo) |
| **Backend Security** | 🟡 En Mejora | Fase 1 activa |

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

### Sprint 7: Backend AI Enhancement 🔥 ACTIVO

**Objetivo:** Transformar el backend en plataforma AI de clase mundial.

**Documentación completa:** [docs/backend/IMPROVEMENTS.md](./backend/IMPROVEMENTS.md)

#### Fase 1: Seguridad (Crítico)
- [ ] Fix WebSocket CORS (`origin: '*'` → configurado)
- [ ] WebSocket rate limiting guard
- [ ] Enhanced audit logging

#### Fase 2: SDK Migration ✅
- [x] Migrar `@google/generative-ai` → `@google/genai`
- [x] Actualizar GeminiAIService para nuevo SDK
- [x] Agregar soporte de streaming (preparado)

#### Fase 3: AI Productivity Chat ✅
- [x] Schema: ChatConversation + ChatMessage
- [x] Chat module (controller, service, repository)
- [x] ProductivityCoachService con context awareness
- [x] Persistencia de conversaciones

#### Fase 4: Real-Time Notifications ✅
- [x] NotificationsGateway WebSocket
- [x] Push de notificaciones real-time
- [x] Timer alerts via WebSocket
- [x] Task reminders via WebSocket

#### Fase 5: New Endpoints ✅
- [x] POST /ai/decompose-task
- [x] GET /chat/insights
- [x] GET/POST/DELETE /chat/conversations
- [x] WebSocket /notifications namespace
- [x] Actualizar documentación de API

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
| **UI Base** | 31 | 0 | ✅ Completo (+tooltip) |
| **Timer** | 4 | 0 | ✅ Completo (props-driven) |
| **Task** | 15 | 0 | ✅ Completo (props-driven) |
| **Project** | 11 | 0 | ✅ Completo (props-driven) |
| **Analytics** | 7 | 0 | ✅ Completo (props-driven) |
| **Tag** | 3 | 0 | ✅ Completo |
| **Workspace** | 3 | 0 | ✅ Completo (props-driven) |
| **Auth** | 1 | 0 | ✅ Completo (props-driven) |
| **AI** | 2 | 0 | ✅ Completo (+report-card) |
| **Layout** | 2 | 0 | ✅ Completo (props-driven) |
| **Shared** | 6 | 0 | ✅ Completo (+dialogs, sync) |
| **Dashboard** | 5 | 0 | ✅ Completo (NEW from desktop) |

### Fases del Proceso

- [x] **Fase 1:** Migrar 30 componentes UI base ✅
- [x] **Fase 2:** Migrar componentes dominio (task, project, analytics, timer) ✅
- [x] **Fase 3:** Migrar workspace, auth, ai, layout, shared, dashboard ✅ (incluyendo componentes de desktop)
- [x] **Fase 4:** Integrar componentes en apps ✅ (wrappers creados, UI re-exports)
- [x] **Fase 5:** Crear @ordo-todo/stores ✅ (workspace, timer, ui, sync stores)
- [x] **Fase 6:** Migrar utilidades compartidas ✅ (ya existentes en core)
- [~] **Fase 7:** Testing con Storybook + Documentación 🟡 (Storybook configurado)

### Estado de @ordo-todo/hooks

| Categoría | Hooks | Estado |
|-----------|-------|--------|
| **Auth** | useRegister, useLogin, useLogout | ✅ |
| **User** | useCurrentUser, useUpdateProfile, useFullProfile, useUserPreferences, useUpdatePreferences, useUserIntegrations, useExportData, useDeleteAccount | ✅ |
| **Workspace** | useWorkspaces, useWorkspace, useWorkspaceBySlug, useCreateWorkspace, useUpdateWorkspace, useDeleteWorkspace, useAddWorkspaceMember, useRemoveWorkspaceMember, useWorkspaceMembers, useWorkspaceInvitations, useInviteMember, useAcceptInvitation, useWorkspaceSettings, useUpdateWorkspaceSettings, useWorkspaceAuditLogs | ✅ |
| **Project** | useProjects, useAllProjects, useProject, useCreateProject, useUpdateProject, useArchiveProject, useCompleteProject, useDeleteProject | ✅ |
| **Task** | useTasks, useTask, useTaskDetails, useCreateTask, useUpdateTask, useCompleteTask, useDeleteTask, useCreateSubtask, useShareTask, usePublicTask | ✅ |
| **Tag** | useTags, useTaskTags, useCreateTag, useUpdateTag, useAssignTagToTask, useRemoveTagFromTask, useDeleteTag | ✅ |
| **Timer** | useActiveTimer, useStartTimer, useStopTimer, usePauseTimer, useResumeTimer, useSwitchTask, useSessionHistory, useTimerStats, useTaskTimeSessions + **useTimer** (standalone) | ✅ |
| **Analytics** | useDailyMetrics, useWeeklyMetrics, useMonthlyMetrics, useDateRangeMetrics, useDashboardStats, useHeatmapData, useProjectDistribution, useTaskStatusDistribution | ✅ |
| **AI** | useAIProfile, useOptimalSchedule, useTaskDurationPrediction, useGenerateWeeklyReport, useReports, useReport, useDeleteReport | ✅ |
| **Comments** | useTaskComments, useCreateComment, useUpdateComment, useDeleteComment | ✅ |
| **Attachments** | useTaskAttachments, useCreateAttachment, useDeleteAttachment, useProjectAttachments | ✅ |
| **Notifications** | useNotifications, useUnreadNotificationsCount, useMarkNotificationAsRead, useMarkAllNotificationsAsRead | ✅ |

> **Patrón de uso:** `createHooks({ apiClient })` crea hooks ligados a un cliente API específico. Usado por `apps/web` y `apps/desktop`.

### Estado de @ordo-todo/i18n

| Idioma | Archivo | Usado por |
|--------|---------|-----------|
| **Inglés** | `locales/en.json` (43KB) | ✅ web, desktop |
| **Español** | `locales/es.json` (46KB) | ✅ web, desktop |
| **Portugués (BR)** | `locales/pt-br.json` (46KB) | ✅ web, desktop |

**Funcionalidades:**
- ✅ `transformTranslations()` - Convierte entre formatos next-intl y i18next
- ✅ `flattenKeys()` - Aplana claves anidadas
- ✅ `getByPath()` - Obtiene valor por ruta de puntos

> **Patrón de uso:**
> - **Web (next-intl):** Usa JSON directamente
> - **Desktop (i18next):** Usa `transformTranslations(en, 'i18next')`

### Estado de @ordo-todo/styles (NUEVO)

| Archivo | Descripción |
|---------|-------------|
| `variables.css` | Variables CSS (light & dark themes, colores vibrantes) |
| `theme.css` | Mapeo `@theme inline` para Tailwind v4 |
| `base.css` | Estilos base (typography, scrollbars, accessibility) |
| `components.css` | Utilidades, animaciones, shadows, hover effects |

**Uso en apps:**
```css
@import "tailwindcss";
@import "@ordo-todo/styles/src/variables.css";
@import "@ordo-todo/styles/src/theme.css";
@import "@ordo-todo/styles/src/base.css";
@import "@ordo-todo/styles/src/components.css";
```

> **Beneficio:** Un solo lugar para cambiar colores, variables y estilos compartidos entre web y desktop.

> **🎉 Consolidación de código compartido COMPLETADA.** Fases 1-6 listas. **90+ hooks + 3 idiomas + estilos centralizados**.

---

### 📋 Fase 4: Integrar Componentes en Apps (DETALLES)

**Objetivo:** Reemplazar componentes locales duplicados con imports de `@ordo-todo/ui`.

#### 4.1 Actualizar `apps/web`

| Paso | Descripción | Estado |
|------|-------------|--------|
| 4.1.1 | Crear wrappers en `apps/web/src/components/` que importan de `@ordo-todo/ui` y pasan props | ✅ |
| 4.1.2 | **Sidebar:** Importar `Sidebar` de ui y pasar `renderLink`, `pathname`, `renderTimerWidget` | ✅ |
| 4.1.3 | **TopBar:** Importar `TopBar` de ui y conectar `useAuth()`, `useTranslations()` | ✅ |
| 4.1.4 | **Breadcrumbs:** Importar de ui con Next.js Link | ✅ |
| 4.1.5 | **ConfirmDelete:** Importar de ui con translations | ✅ |
| 4.1.6 | **Auth components:** Conectar `signIn()` de next-auth | ✅ |
| 4.1.7 | **AI GenerateReportDialog:** Conectar hooks y translations | ✅ |
| 4.1.8 | **UI Components:** Re-exportar todos desde `@ordo-todo/ui` | ✅ (30 componentes) |
| 4.1.9 | **Task/Project/Workspace components:** Mantienen lógica local con UI de @ordo-todo/ui | ✅ Híbrido |
| 4.1.10 | Probar funcionamiento en navegador | ✅ Dashboard funciona |

#### 4.2 Actualizar `apps/desktop`

| Paso | Descripción | Estado |
|------|-------------|--------|
| 4.2.1 | Crear wrappers en `apps/desktop/src/components/` que importan de `@ordo-todo/ui` | ✅ En progreso |
| 4.2.2 | **Sidebar:** Conectar con react-router y stores de desktop | ✅ |
| 4.2.3 | **Dashboard widgets:** Re-exportar desde ui, mantener TimerWidget local | ✅ |
| 4.2.4 | **AboutDialog:** Conectar useUIStore() y Electron version info | ✅ |
| 4.2.5 | **ShortcutsDialog:** Usar UI component con shortcuts de desktop | ✅ |
| 4.2.6 | **SyncStatusIndicator:** Conectar useSyncStore() | ✅ |
| 4.2.7 | **Task/Project components:** Conectar API service y stores | 🔴 Pendiente |
| 4.2.8 | Eliminar componentes locales duplicados | 🔴 Pendiente |
| 4.2.9 | Probar funcionamiento en Electron | 🔴 Pendiente |

#### 4.3 Patrón de Integración (Ejemplo)

```tsx
// apps/web/src/components/task/TaskCardWrapper.tsx
import { TaskCard } from '@ordo-todo/ui';
import { useUpdateTask, useDeleteTask } from '@/lib/api-hooks';
import { useTranslations } from 'next-intl';

export function TaskCardWrapper({ task }) {
  const t = useTranslations('TaskCard');
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  return (
    <TaskCard
      task={task}
      onStatusChange={(status) => updateTask.mutate({ id: task.id, status })}
      onDelete={() => deleteTask.mutate(task.id)}
      labels={{
        complete: t('complete'),
        delete: t('delete'),
        // ...
      }}
    />
  );
}
```

---

### 📋 Fase 5: Crear @ordo-todo/stores

**Objetivo:** Compartir stores de Zustand entre apps.

| Paso | Descripción | Estado |
|------|-------------|--------|
| 5.1 | Crear `packages/stores/` con estructura similar a ui | ✅ Ya existente |
| 5.2 | Migrar `workspace-store` | ✅ |
| 5.3 | Migrar `timer-store` | ✅ |
| 5.4 | Migrar `ui-store` (dialogs, modals) | ✅ |
| 5.5 | Migrar `sync-store` | ✅ Agregado |
| 5.6 | Actualizar apps para usar stores compartidos | 🔴 Pendiente |

---

### 📋 Fase 6: Migrar Utilidades Compartidas

**Objetivo:** Consolidar funciones de utilidad.

| Paso | Descripción | Estado |
|------|-------------|--------|
| 6.1 | Ampliar `packages/core/` con utilidades | ✅ Ya existente (date, time, string, calc, color) |
| 6.2 | Mover `formatDate`, `formatDuration`, etc. | ✅ Existentes en core/shared/utils |
| 6.3 | Mover `cn()` utility y verificar en ui pkg | ✅ |
| 6.4 | Actualizar imports en apps | ✅ Apps usan @ordo-todo/core |

---

### 📋 Fase 7: Testing + Documentación

**Objetivo:** Garantizar calidad y facilitar adopción.

| Paso | Descripción | Estado |
|------|-------------|--------|
| 7.1 | Configurar Storybook en `packages/ui` | ✅ Configurado (v10) |
| 7.2 | Crear stories para componentes principales | ✅ Button, Badge, Card (iniciales) |
| 7.3 | Agregar tests unitarios con Vitest | 🔴 Pendiente |
| 7.4 | Documentar API de cada componente (props, labels) | 🟡 Autodocs via Storybook |
| 7.5 | Crear guía de migración para desarrolladores | 🔴 Pendiente |


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
