# Análisis y Plan de Implementación de Workspaces

Este documento analiza la propuesta original de Copilot y la adapta a la arquitectura actual de **Ordo Todo** (NestJS + Clean Architecture/DDD en `@ordo-todo/core`).

## 1. Análisis de Estado Actual vs. Propuesta

### Estado Actual
- **Arquitectura**: Clean Architecture. La lógica de negocio reside en `packages/core` (UseCases), y el backend (NestJS) actúa como infraestructura/controlador.
- **Modelo de Datos**:
  - `Workspace`: ID, nombre, descripción, tipo (PERSONAL/WORK/TEAM), color, icono, ownerId.
  - `WorkspaceMember`: Rol (OWNER, ADMIN, MEMBER, VIEWER).
- **Funcionalidad**: CRUD básico (Crear, Leer, Actualizar, Eliminar, Agregar/Remover Miembro).

### Propuesta (Copilot)
- **Mejoras Clave Identificadas**:
  1.  **Slugs**: Identificadores amigables para URLs (ej. `/acme-corp/project-1`).
  2.  **Invitaciones Seguras**: Sistema basado en tokens con expiración para invitar miembros por email.
  3.  **Configuración (Settings)**: Tabla separada para preferencias a nivel de workspace (vista por defecto, zona horaria).
  4.  **Auditoría**: Registro de acciones críticas (quién hizo qué y cuándo).
  5.  **Soft Delete & Archiving**: No borrar datos inmediatamente; permitir "papelera" y archivado.

### Adaptación Necesaria
La propuesta original sugiere poner lógica en `WorkspacesService`. Para mantener la coherencia con **Ordo Todo**, debemos implementar estas lógicas como **UseCases en `@ordo-todo/core`** (ej. `InviteMemberToWorkspaceUseCase`, `ArchiveWorkspaceUseCase`) y que el controlador de NestJS los consuma.

---

## 2. Modelo de Datos Objetivo (Schema Prisma)

A continuación, el esquema adaptado que combina lo existente con las mejoras propuestas.

```prisma
// Modificaciones al modelo existente Workspace
model Workspace {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique // NUEVO: Para URLs amigables
  description String?
  type        WorkspaceType // Existente (PERSONAL, WORK, TEAM)
  tier        WorkspaceTier @default(FREE) // NUEVO: Preparado para monetización futura
  color       String   @default("#2563EB")
  icon        String?

  ownerId     String? // Existente

  // Relaciones
  members     WorkspaceMember[]
  workflows   Workflow[]
  projects    Project[]
  tags        Tag[]
  
  // NUEVAS RELACIONES
  settings    WorkspaceSettings?
  invitations WorkspaceInvitation[]
  audits      WorkspaceAuditLog[]

  // NUEVO: Estados de ciclo de vida
  isArchived  Boolean   @default(false)
  isDeleted   Boolean   @default(false)
  deletedAt   DateTime?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([ownerId])
  @@index([slug])
}

enum WorkspaceTier {
  FREE
  PRO
  ENTERPRISE
}

// NUEVO: Configuraciones específicas del workspace
model WorkspaceSettings {
  id            String   @id @default(cuid())
  workspace     Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  workspaceId   String   @unique
  
  defaultView   ViewType?  @default(LIST)
  defaultDueTime Int?    // minutos desde inicio del día
  timezone      String?  // ej. "America/Mexico_City"
  locale        String?  // ej. "es-MX"
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// NUEVO: Gestión de invitaciones
model WorkspaceInvitation {
  id           String      @id @default(cuid())
  workspace    Workspace   @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  workspaceId  String
  
  email        String
  tokenHash    String      // Hash del token para seguridad
  role         MemberRole  @default(MEMBER)
  status       InviteStatus  @default(PENDING)
  
  invitedById  String?
  invitedBy    User?        @relation(fields: [invitedById], references: [id])
  
  expiresAt    DateTime
  acceptedAt   DateTime?
  
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@index([workspaceId])
  @@index([email])
}

enum InviteStatus {
  PENDING
  ACCEPTED
  EXPIRED
  CANCELLED
}

// NUEVO: Logs de auditoría (Importante para planes TEAM/ENTERPRISE)
model WorkspaceAuditLog {
  id           String   @id @default(cuid())
  workspaceId  String
  workspace    Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  actorId      String?   // Usuario que realizó la acción
  actor        User?     @relation(fields: [actorId], references: [id])
  
  action       String    // ej. "MEMBER_INVITED", "PROJECT_DELETED"
  payload      Json?     // Detalles del cambio
  
  createdAt    DateTime  @default(now())

  @@index([workspaceId, createdAt])
}
```

---

## 3. Roadmap de Implementación

Esta lista de tareas está organizada para ser implementada secuencialmente.

### Fase 1: Base de Datos y Core (Fundamentos) ✅ **COMPLETADO**
- [x] **Actualizar Schema Prisma**: Agregar campos `slug`, `isArchived`, `isDeleted`, `tier` a `Workspace`. Crear modelos `WorkspaceSettings`, `WorkspaceInvitation`, `WorkspaceAuditLog`.
- [x] **Generar Migración**: Crear y ejecutar migración de base de datos.
- [x] **Actualizar Entidades en Core**: Actualizar la entidad `Workspace` en `@ordo-todo/core` para incluir los nuevos campos.
- [x] **Actualizar Repositorio**: Actualizar `PrismaWorkspaceRepository` para mapear los nuevos campos y modelos.

### Fase 2: Gestión Avanzada de Workspace ✅ **COMPLETADO**
- [x] **Implementar Slug Logic**:
    - Crear utilidad para generar slugs únicos basados en el nombre.
    - Actualizar `CreateWorkspaceUseCase` para generar slug.
- [x] **Implementar Soft Delete**:
    - Crear `SoftDeleteWorkspaceUseCase` (marcar `isDeleted=true`).
    - Actualizar consultas para excluir workspaces eliminados por defecto.
- [x] **Implementar Archivado**:
    - Crear `ArchiveWorkspaceUseCase` (marcar `isArchived=true`).
    - Adaptar UI para mostrar workspaces archivados en una sección separada. (Pendiente UI)

### Fase 3: Sistema de Invitaciones ✅ **COMPLETADO**
- [x] **Backend - Invitaciones**:
    - [x] Crear `InviteMemberUseCase`: Generar token, guardar en DB, (simular) envío de email.
    - [x] Crear `AcceptInvitationUseCase`: Validar token.
        - *Flujo Usuario Nuevo*: Si el email no existe, redirigir a registro con email pre-llenado y luego auto-unir.
        - *Flujo Usuario Existente*: Añadir directamente a `WorkspaceMember`.
    - [x] Endpoints en `WorkspacesController`: `POST /:id/invite`, `POST /invitations/accept`.
    - [x] Endpoints adicionales: `GET /:id/members`, `GET /:id/invitations`.
    - [x] Integración con `UserRepository` para obtener detalles de usuarios.
- [x] **Frontend - UI Invitaciones**:
    - [x] Componente `InviteMemberDialog`: Modal para invitar miembros con email y rol.
    - [x] Componente `WorkspaceMembersSettings`: Lista de miembros + Lista de invitaciones pendientes.
    - [x] Página pública para aceptar invitación (`/[locale]/invitations/accept?token=...`).
    - [x] Integración con `WorkspaceSettingsDialog` usando tabs (General/Miembros).
    - [x] React Query hooks: `useInviteMember`, `useAcceptInvitation`, `useWorkspaceMembers`, `useWorkspaceInvitations`.
    - [x] Internacionalización completa (ES/EN).
    - [x] Componentes UI necesarios: `Table`, `Form`.

**Notas de Implementación**:
- ✅ Sistema MVP funcional con tokens visibles para desarrollo (sin servicio de email).
- ✅ Tokens con expiración de 7 días.
- ✅ Validación de estado (solo PENDING puede ser aceptado).
- ✅ Manejo de errores y estados de carga en UI.
- ⚠️ **Pendiente para Producción**: Integración de servicio de email, hashing de tokens.
- 📚 **Documentación**: Ver `docs/implementation/workspace-invitations-complete.md`

### Fase 4: Configuración y Auditoría ✅ **COMPLETADO**
- [x] **Settings**:
    - [x] Backend - Entidades y Use Cases:
        - [x] `WorkspaceSettings` entity con defaultView, defaultDueTime, timezone, locale
        - [x] `WorkspaceSettingsRepository` interface
        - [x] `UpdateWorkspaceSettingsUseCase` y `GetWorkspaceSettingsUseCase`
        - [x] `PrismaWorkspaceSettingsRepository` implementación
    - [x] Backend - API Endpoints:
        - [x] `GET /workspaces/:id/settings` - Obtener configuración
        - [x] `PUT /workspaces/:id/settings` - Actualizar configuración
        - [x] `UpdateWorkspaceSettingsDto` con validación
    - [x] Frontend - Componentes UI:
        - [x] `WorkspaceConfigurationSettings` - Formulario de configuración
        - [x] Selector de vista predeterminada (LIST, KANBAN, CALENDAR, TIMELINE, FOCUS)
        - [x] Input de hora predeterminada para fechas de vencimiento
        - [x] Selector de zona horaria
        - [x] Selector de idioma/región (locale)
        - [x] Integración con `WorkspaceSettingsDialog` (pestaña "Configuration")
    - [x] Frontend - Hooks y API:
        - [x] `useWorkspaceSettings()` hook
        - [x] `useUpdateWorkspaceSettings()` hook
        - [x] API client methods
    - [x] Internacionalización (EN) completa
- [x] **Auditoría**:
    - [x] Backend - Entidades y Use Cases:
        - [x] `WorkspaceAuditLog` entity con workspaceId, actorId, action, payload
        - [x] `WorkspaceAuditLogRepository` interface con paginación
        - [x] `CreateAuditLogUseCase` y `GetWorkspaceAuditLogsUseCase`
        - [x] `PrismaWorkspaceAuditLogRepository` implementación
    - [x] Backend - API Endpoints:
        - [x] `GET /workspaces/:id/audit-logs?limit&offset` - Obtener logs paginados
    - [x] Backend - Integración automática de audit logging en:
        - [x] `WORKSPACE_CREATED` - Creación de workspace
        - [x] `WORKSPACE_UPDATED` - Actualización de workspace
        - [x] `WORKSPACE_DELETED` - Eliminación de workspace
        - [x] `WORKSPACE_ARCHIVED` - Archivado de workspace
        - [x] `MEMBER_ADDED` - Agregar miembro
        - [x] `MEMBER_REMOVED` - Remover miembro
        - [x] `MEMBER_INVITED` - Invitar miembro
        - [x] `INVITATION_ACCEPTED` - Aceptar invitación
        - [x] `SETTINGS_UPDATED` - Actualizar configuración
    - [x] Frontend - Componentes UI:
        - [x] `WorkspaceActivityLog` - Vista de historial de actividad
        - [x] Lista de logs con iconos y colores dinámicos por tipo de acción
        - [x] Información de actor y timestamp relativo
        - [x] Visualización de payload de detalles
        - [x] Paginación (10 items por página)
        - [x] Empty state y loading state
        - [x] Integración con `WorkspaceSettingsDialog` (pestaña "Activity")
    - [x] Frontend - Hooks y API:
        - [x] `useWorkspaceAuditLogs()` hook con paginación
        - [x] API client methods
    - [x] Internacionalización (EN) completa

**Notas de Implementación**:
- ✅ Sistema completo de configuración por workspace
- ✅ Audit trail automático para todas las operaciones críticas
- ✅ UI intuitiva con 4 pestañas: General, Members, Configuration, Activity
- ✅ Paginación eficiente para logs de auditoría
- ✅ Iconos y colores para identificación visual de acciones
- 📚 **Documentación**: Ver resumen de implementación en sesión

### Fase 5: UI/UX Refinements (Completed)
- [x] **Workspace Selector**:
  - [x] Rediseño visual completo con iconos, colores y badges.
  - [x] Agrupación por tipo (Personal, Work, Team).
  - [x] Búsqueda y filtrado en tiempo real.
  - [x] Estadísticas rápidas (proyectos, tareas) optimizadas en una sola query.
- [x] **Workspace Dashboard**:
  - [x] Implementación de `WorkspaceDashboard` como vista principal.
  - [x] "Stats Cards" para métricas clave (Proyectos, Tareas, Miembros).
  - [x] "Activity Feed" compacto en barra lateral.
  - [x] Lista de proyectos con vista de cuadrícula/lista.
  - [x] Acciones rápidas y navegación mejorada.
- [ ] **Slug-based Routing**: (Movido a Fase 6)
  - [ ] Usar slugs en URLs (e.g., `/w/my-team`).

## Fase 6: Future Considerations
- [x] **Slug-based Routing**:
  - [x] Migrar rutas del frontend para usar `/:workspaceSlug/...` en lugar de IDs.
  - [x] Validar unicidad y manejo de conflictos de slugs.
- [ ] **Billing & Plans**:
  - [ ] Integración con Stripe para planes Pro/Enterprise.
  - [ ] Gestión de límites (miembros, proyectos, almacenamiento).
- [ ] **Advanced Analytics**:
  - [ ] Gráficas detalladas de productividad y completitud.
  - [ ] Reportes exportables (PDF/CSV).
- [ ] **Advanced UX**:
  - [ ] Drag & drop para reordenar proyectos/tareas.
  - [ ] Shortcuts de teclado globales.
  - [ ] Notificaciones en tiempo real (WebSockets).

---

## 4. Estado del Proyecto

### ✅ Completado (80%)
- **Fase 1**: Base de Datos y Core (100%)
- **Fase 2**: Gestión Avanzada de Workspace (100%)
- **Fase 3**: Sistema de Invitaciones (100%)
- **Fase 4**: Configuración y Auditoría (100%) ⭐ **NUEVO**

### 🚧 En Progreso
- Ninguno

### 📋 Pendiente (20%)
- **Fase 5**: UI/UX Refinements

### 📊 Progreso General: 80% (4/5 fases completadas)

**Última Actualización**: 3 de Diciembre, 2025

