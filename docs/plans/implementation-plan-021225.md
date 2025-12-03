# 📋 Plan de Implementación y Mejoras - Ordo-Todo

Este documento rastrea el estado de las mejoras, correcciones y nuevas implementaciones para el proyecto Ordo-Todo.

## 📊 Resumen de Estado

| Categoría | Estado General | Notas |
|-----------|----------------|-------|
| **Backend** | 🟡 En Progreso | Tests aumentados, Auth mejorado (Refresh Tokens). |
| **Frontend** | 🟡 En Progreso | Tests iniciados, Mejoras en Timer y UI de Tareas. |
| **DevOps** | 🔴 Pendiente | CI/CD y Análisis Estático pendientes. |
| **Mobile** | 🔴 Pendiente | Autenticación y paridad de features pendientes. |

---

## ✅ Completado / Implementado

### 🔐 Autenticación y Seguridad
- [x] **Implementar Refresh Tokens**: Endpoint y lógica de servicio implementados (`auth.controller.ts`, `auth.service.ts`).
- [x] **Corrección de Errores de Auth**: Manejo de sesiones y tokens mejorado.

### ⏱️ Funcionalidad de Timer (Pomodoro/Continuo)
- [x] **Modo Continuo**: Corregido para iniciar en 0:00 y contar hacia arriba.
- [x] **Selección de Tarea**: Corregido error que impedía seleccionar tareas en el timer.
- [x] **Endpoint de Timers Activos**: Solucionado error 500 en `GET /api/v1/timers/active`.

### 📁 Gestión de Proyectos y Tareas
- [x] **Estado de Completitud de Proyectos**: Migración y lógica para manejar `completed: false` por defecto.
- [x] **Upload de Archivos**: Corregido error "Upload failed" en adjuntos de tareas.
- [x] **UI de Detalles de Tarea**: Mejoras de diseño y accesibilidad (Sheet Title) en `TaskDetailPanel`.
- [x] **Consistencia Visual**: Colores de workspaces unificados por tipo.

---

## 🚧 En Progreso

### 🧪 Testing (Backend)
> **Meta:** Coverage > 70%
- [x] `tasks.service.spec.ts`
- [x] `tags.service.spec.ts`
- [x] `timer.repository.spec.ts`
- [x] `projects.service.spec.ts`
- [x] `auth.service.spec.ts`
- [x] `app.controller.spec.ts`
- [ ] Tests de integración para endpoints principales.
- [ ] Tests para DTOs y validaciones restantes.

### 🧪 Testing (Frontend)
> **Meta:** Configurar Vitest/Jest + RTL
- [x] Configuración inicial de tests.
- [x] `use-projects.test.tsx`
- [x] `button.test.tsx`
- [x] `task-card.test.tsx`
- [ ] Tests para `TaskDetailPanel`.
- [ ] Tests para `PomodoroTimer` (lógica compleja).
- [ ] Tests E2E para flujos críticos.

### 🛡️ Manejo de Errores y Logging
- [x] Filtros básicos (`HttpExceptionFilter`, `PrismaExceptionFilter`, `GlobalExceptionFilter`).
- [ ] **Estandarizar Códigos de Error**: Crear enum de códigos de error.
- [ ] **Logging Estructurado**: Integrar Winston/Pino (actualmente solo `LoggingInterceptor` básico).

---

## � Pendiente (Backlog)

### 🔧 Arquitectura y Calidad (Prioridad Media)
- [ ] **Validación de Variables de Entorno**: Implementar `ConfigModule` con `class-validator`.
- [ ] **Análisis Estático**: Configurar SonarQube y Husky (pre-commit hooks).
- [ ] **Documentación Técnica**: Diagramas de arquitectura y guías de contribución.

### ✨ Nuevas Funcionalidades (Prioridad Media)
- [ ] **Notificaciones Push Avanzadas**: Soporte para programadas y categorías.
- [ ] **Sistema de Comentarios Completo**: UI en frontend, menciones (@user).
- [ ] **Gestión de Adjuntos Avanzada**: Drag & drop, previews de imágenes/PDFs.
- [ ] **Modo Offline Robusto**: Sync queue y manejo de conflictos.

### 📱 Mobile & UI/UX (Prioridad Baja)
- [ ] **Autenticación Mobile**: OAuth (Google/GitHub) y SecureStore.
- [ ] **Internacionalización (i18n)**: Completar en web y llevar a mobile.
- [ ] **Feedback de Loading**: Skeleton loaders y optimistic updates.

### 🚀 DevOps
- [ ] **CI/CD**: GitHub Actions para tests y linting automático.

---

## 📝 Notas de Desarrollo
- **Limpieza de Código**: Se debe continuar eliminando `console.log` innecesarios en producción.
- **Prioridad Actual**: Estabilizar tests de backend y frontend antes de nuevas features grandes.
