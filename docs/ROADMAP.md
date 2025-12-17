# 🗺️ Ordo-Todo - Roadmap de Desarrollo

**Última actualización:** Diciembre 2025  
**Estrategia:** Híbrida (Crítico + Alcanzable = Máximo Impacto)

---

## 📊 Resumen Ejecutivo

| Área | Estado | Progreso |
|------|--------|----------|
| **Backend API** | ✅ Estable | 95% |
| **Web App** | ✅ Producción | 90% |
| **Desktop App** | ✅ Funcional | 85% |
| **Mobile App** | 🟡 En Progreso | 60% |
| **Gamificación** | ✅ Completo | 90% |
| **AI Features** | ✅ Implementado | 80% |
| **Packages** | ✅ Consolidado | 90% |

---

## ✅ Sprints Completados

### Sprint 1-5: Fundamentos ✅
- [x] Setup Jest/Vitest para testing
- [x] Tests para use cases principales
- [x] Sistema de asignación de tareas
- [x] Dashboard Quick Actions (FAB)
- [x] Subtareas con progress tracking
- [x] Sistema de Notificaciones
- [x] Comentarios con menciones
- [x] Pomodoro Timer avanzado
- [x] Gamificación (XP, niveles, logros)
- [x] Sistema de attachments

### Sprint 6: Features Competitivos ✅
- [x] Habit Tracker integrado
- [x] Smart Dates (Start/Scheduled/Due)
- [x] OKRs/Goals System
- [x] Time Blocking
- [x] Custom Fields (8 tipos)

### Sprint 7: AI Features ✅
- [x] SDK Migration (`@google/generative-ai` → `@google/genai`)
- [x] AI Productivity Chat
- [x] Smart Semantic Search
- [x] AI Meeting Assistant
- [x] Burnout Prevention Engine
- [x] Focus Sessions Audio
- [x] Real-Time Notifications (WebSocket)
- [x] Task Decomposition API

### Sprint 8: Packages Consolidation ✅
- [x] @ordo-todo/ui - 91+ componentes migrados
- [x] @ordo-todo/hooks - 90+ hooks compartidos
- [x] @ordo-todo/i18n - 3 idiomas (EN, ES, PT-BR)
- [x] @ordo-todo/styles - Estilos centralizados (Tailwind v4)
- [x] @ordo-todo/stores - Zustand stores compartidos

---

## 🚧 Sprint Actual: Quick Wins & Polish

**Objetivo:** Completar features de alto impacto y bajo esfuerzo.

### Quick Wins Implementados ✅
- [x] Eisenhower Matrix view
- [x] Batch task editing
- [x] Quick filters presets
- [x] Keyboard shortcut cheat sheet
- [x] Export JSON/CSV

### En Progreso 🟡
- [ ] Daily/Weekly email digest
- [ ] Location-based reminders (Mobile)
- [ ] Public roadmap votable

---

## 🔧 Sprint 9: Integración de Paquetes Compartidos (ACTIVO)

**Objetivo:** Maximizar la reutilización de código entre plataformas para garantizar comportamiento consistente y reducir código duplicado.

> **Documentación:** Ver [SHARED-CODE-ARCHITECTURE.md](./SHARED-CODE-ARCHITECTURE.md) para detalles de la arquitectura.

### Fase 1: Mobile - Integrar Hooks Compartidos ✅ Completo

**Estado:** Hooks compartidos integrados y hooks duplicados eliminados  
**Objetivo:** Usar `@ordo-todo/hooks` con `createHooks()`

| Tarea | Estado | Archivo(s) |
|-------|--------|------------|
| Crear wrapper `shared-hooks.ts` para Mobile | ✅ Completo | `apps/mobile/app/lib/shared-hooks.ts` |
| Migrar componentes → shared hooks | ✅ Completo | auth, tabs, task, workspaces, goals |
| Corregir errores de tipos | ✅ Completo | - |
| Eliminar hooks duplicados | ✅ Completo | Eliminado `apps/mobile/app/hooks/api/` |
| Agregar custom-fields a hooks compartidos | ✅ Completo | `packages/hooks/src/hooks.ts` |
| Eliminar carpeta legacy | ✅ Completo | Eliminado `apps/mobile/app/hooks/legacy/` |

### Fase 2: Mobile - Integrar Traducciones ✅ Completo

**Estado:** Todas las pantallas principales de tabs migradas  
**Objetivo:** Usar traducciones centralizadas con i18next

| Tarea | Estado | Archivo(s) |
|-------|--------|------------|
| Configurar i18next con `@ordo-todo/i18n` | ✅ Completo | `apps/mobile/app/lib/i18n.ts` |
| Crear provider de traducciones | ✅ Completo | `apps/mobile/app/providers/i18n-provider.tsx` |
| Agregar traducciones Mobile a locales | ✅ Completo | `packages/i18n/src/locales/*.json` |
| Migrar home screen | ✅ Completo | `(tabs)/index.tsx` |
| Migrar tabs layout | ✅ Completo | `(tabs)/_layout.tsx` |
| Migrar habits screen | ✅ Completo | `(tabs)/habits.tsx` |
| Migrar calendar screen | ✅ Completo | `(tabs)/calendar.tsx` |
| Migrar profile screen | ✅ Completo | `(tabs)/profile.tsx` |

### Fase 3: Mobile - Integrar Stores ✅ Completo

**Estado:** Configuración de persistencia con AsyncStorage y uso de WorkspaceStore implementado.
**Objetivo:** Usar stores Zustand compartidos

| Tarea | Estado | Archivo(s) |
|-------|--------|------------|
| Crear wrapper de stores compartidos y persistencia | ✅ Completo | `apps/mobile/app/lib/stores.ts` |
| Inicializar stores en Root Layout | ✅ Completo | `apps/mobile/app/_layout.tsx` |
| Integrar WorkspaceStore en selección de workspace | ✅ Completo | `(internal)/workspaces/index.tsx` |
| Integrar WorkspaceStore en creación de tareas | ✅ Completo | `(internal)/task.tsx` |
| Integrar WorkspaceStore en detalle de workspace | ✅ Completo | `(internal)/[username]/[slug].tsx` |


### Fase 4: Tokens de Diseño para React Native ✅ Completo

**Objetivo:** Exportar variables CSS como JS para React Native y usarlos en la app.

| Tarea | Estado | Archivo(s) |
|-------|--------|------------|
| Crear `tokens.ts` en `@ordo-todo/styles` | ✅ Completo | `packages/styles/src/tokens.ts` |
| Agregar colores, espaciado, radios en JS | ✅ Completo | - |
| Agregar dependencia `@ordo-todo/styles` | ✅ Completo | `apps/mobile/package.json` |
| Crear hook `useDesignTokens` | ✅ Completo | `apps/mobile/app/lib/use-design-tokens.ts` |
| Migrar `useThemeColors` a tokens centralizados | ✅ Completo | `apps/mobile/app/data/hooks/use-theme-colors.hook.ts` |
| Usar tokens en componentes Mobile | ✅ Completo | (Vía migración de hook) |

### Fase 5: Desktop - Verificar Integración Completa ✅ Completo

**Objetivo:** Asegurar que desktop usa los paquetes compartidos y detectar duplicaciones.

| Tarea | Estado | Observaciones |
|-------|--------|---------------|
| Auditar uso de `@ordo-todo/stores` | ✅ Completo | Correctamente implementado via re-exports. |
| Auditar uso de `@ordo-todo/i18n` | ✅ Completo | Correctamente configurado. |
| Auditar uso de `@ordo-todo/styles` | ✅ Completo | `@import` CSS funcionando. |
| Auditar uso de `@ordo-todo/hooks` | ✅ Completo | Duplicación detectada. Se creó `src/lib/shared-hooks.ts` para habilitar migración. |
| Refactorizar `use-tasks.ts` a shared hooks | ✅ Completo | Se eliminó código duplicado en favor de shared hooks. |
| Refactorizar otros hooks de API | ✅ Completo | Migrados `use-projects`, `use-workspaces`, `use-auth`. |

### Fase 6: Mejoras de Imports 🟢 Baja Prioridad

| Tarea | Estado |
|-------|--------|
| Configurar alias para imports de styles en Web | ✅ Completo | `globals.css` usa `@ordo-todo/styles` ahora. |
| Agregar script de validación de traducciones | ✅ Completo | Implementado en `scripts/validate-translations.js`. |
| Agregar tipos estrictos para claves i18n | ✅ Completo | `Dictionary` type exportado y aplicado en Desktop. |

---

## 🔮 Próximos Sprints

### Q1 2025: Mobile Parity & Integrations

| Feature | Prioridad | Estado |
|---------|-----------|--------|
| Autenticación OAuth (Mobile) | Alta | 📝 Planificado |
| Paridad features Web → Mobile | Alta | 📝 Planificado |
| Push notifications nativas | Alta | 📝 Planificado |
| Offline sync mejorado | Media | 📝 Planificado |
| Google Calendar sync | Media | 📝 Planificado |
| Browser Extension | Media | 📝 Planificado |

### Q2 2025: Enterprise & Performance

| Feature | Prioridad | Estado |
|---------|-----------|--------|
| Mobile AI Features parity | Alta | 📝 Planificado |
| Desktop AI Features parity | Alta | 📝 Planificado |
| Performance audit | Alta | 📝 Planificado |
| E2E Testing (Playwright) | Alta | 📝 Planificado |
| Lighthouse 90+ | Media | 📝 Planificado |

---

## 📦 Estado de Packages Compartidos

### @ordo-todo/ui

| Categoría | Componentes | Estado |
|-----------|-------------|--------|
| **UI Base** | 31 | ✅ Completo |
| **Timer** | 4 | ✅ Completo |
| **Task** | 15 | ✅ Completo |
| **Project** | 11 | ✅ Completo |
| **Analytics** | 7 | ✅ Completo |
| **Tag** | 3 | ✅ Completo |
| **Workspace** | 3 | ✅ Completo |
| **Auth** | 1 | ✅ Completo |
| **AI** | 2 | ✅ Completo |
| **Layout** | 2 | ✅ Completo |
| **Shared** | 6 | ✅ Completo |
| **Dashboard** | 5 | ✅ Completo |

**Total: 91+ componentes migrados**

### @ordo-todo/hooks

| Categoría | Hooks | Estado |
|-----------|-------|--------|
| **Auth** | 3 | ✅ |
| **User** | 8 | ✅ |
| **Workspace** | 15 | ✅ |
| **Project** | 8 | ✅ |
| **Task** | 10 | ✅ |
| **Tag** | 7 | ✅ |
| **Timer** | 10 | ✅ |
| **Analytics** | 8 | ✅ |
| **AI** | 7 | ✅ |
| **Comments** | 4 | ✅ |
| **Attachments** | 4 | ✅ |
| **Notifications** | 4 | ✅ |

**Total: 90+ hooks compartidos**

### @ordo-todo/i18n

| Idioma | Estado |
|--------|--------|
| Inglés (en) | ✅ |
| Español (es) | ✅ |
| Portugués BR (pt-br) | ✅ |

### @ordo-todo/styles

| Archivo | Descripción |
|---------|-------------|
| `variables.css` | Variables CSS (light & dark themes) |
| `theme.css` | Mapeo `@theme inline` para Tailwind v4 |
| `base.css` | Estilos base (typography, scrollbars) |
| `components.css` | Utilidades y animaciones |

---

## 📱 Estado por Plataforma

### Desktop App

| Feature | Estado |
|---------|--------|
| System Tray + Timer | ✅ Completo |
| Global Shortcuts | ✅ Completo |
| Native Notifications | ✅ Completo |
| Dashboard Widgets | ✅ Completo |
| Offline Mode | ✅ Completo |
| Auto-updates | ✅ Completo |
| Quick Actions (Cmd+K) | ✅ Completo |
| AI Reports | ✅ Completo |

### Mobile App

| Feature | Estado |
|---------|--------|
| Core UI | ✅ Completo |
| Tasks CRUD | ✅ Completo |
| Timer | ✅ Completo |
| Habits | ✅ Completo |
| Goals/OKRs | ✅ Completo |
| OAuth Auth | 🟡 En Progreso |
| Push Notifications | 📝 Planificado |
| Offline Sync | 📝 Planificado |

---

## 📊 Métricas de Éxito

| Métrica | Actual | Meta |
|---------|--------|------|
| Test Coverage | ~40% | 60% |
| Lighthouse Score | ~75 | 90+ |
| Features Completos | 45+ | 50 |
| Bugs Críticos | 0 | 0 |
| Security Score | 98/100 | 100/100 |

---

## 🎯 Prioridades Inmediatas

1. **Mobile OAuth** - Desbloquea adopción mobile
2. **E2E Testing** - Estabilidad antes de más features
3. **Performance** - Lighthouse 90+
4. **Email Digest** - Retención de usuarios

---

## 💡 Features Futuros (Post-Q2 2025)

| Feature | Prioridad | Notas |
|---------|-----------|-------|
| Slack Integration | Media | Webhooks |
| GitHub Integration | Media | Issues import |
| Team Analytics | Baja | Para workspaces compartidos |
| PWA Improvements | Media | Offline-first |

---

**Ver también:**
- [Web Roadmap](./web/ROADMAP.md) - Roadmap detallado de la web app
- [Competitive Analysis](./mejoras-competencia/COMPETITIVE-ANALYSIS.md) - Análisis de competencia
- [Production Checklist](./mejoras-competencia/WEB-PRODUCTION-CHECKLIST.md) - Checklist de producción
