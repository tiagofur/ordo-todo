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

### Fase 1: Base de Datos y Core (Fundamentos)
- [ ] **Actualizar Schema Prisma**: Agregar campos `slug`, `isArchived`, `isDeleted`, `tier` a `Workspace`. Crear modelos `WorkspaceSettings`, `WorkspaceInvitation`, `WorkspaceAuditLog`.
- [ ] **Generar Migración**: Crear y ejecutar migración de base de datos.
- [ ] **Actualizar Entidades en Core**: Actualizar la entidad `Workspace` en `@ordo-todo/core` para incluir los nuevos campos.
- [ ] **Actualizar Repositorio**: Actualizar `PrismaWorkspaceRepository` para mapear los nuevos campos y modelos.

### Fase 2: Gestión Avanzada de Workspace
- [ ] **Implementar Slug Logic**:
    - Crear utilidad para generar slugs únicos basados en el nombre.
    - Actualizar `CreateWorkspaceUseCase` para generar slug.
- [ ] **Implementar Soft Delete**:
    - Crear `SoftDeleteWorkspaceUseCase` (marcar `isDeleted=true`).
    - Actualizar consultas para excluir workspaces eliminados por defecto.
- [ ] **Implementar Archivado**:
    - Crear `ArchiveWorkspaceUseCase` (marcar `isArchived=true`).
    - Adaptar UI para mostrar workspaces archivados en una sección separada.

### Fase 3: Sistema de Invitaciones
- [ ] **Backend - Invitaciones**:
    - Crear `InviteMemberUseCase`: Generar token, guardar en DB, (simular) envío de email.
    - Crear `AcceptInvitationUseCase`: Validar token.
        - *Flujo Usuario Nuevo*: Si el email no existe, redirigir a registro con email pre-llenado y luego auto-unir.
        - *Flujo Usuario Existente*: Añadir directamente a `WorkspaceMember`.
    - Endpoints en `WorkspacesController`: `POST /:id/invite`, `POST /invitations/accept`.
- [ ] **Frontend - UI Invitaciones**:
    - Pantalla de configuración de miembros: Lista de miembros + Lista de invitaciones pendientes.
    - Modal "Invitar Miembro".
    - Página pública/protegida para aceptar invitación (`/invite?token=...`).

### Fase 4: Configuración y Auditoría (Polish)
- [ ] **Settings**:
    - Endpoint para leer/escribir `WorkspaceSettings`.
    - UI de Configuración del Workspace (Pestañas: General, Miembros, Configuración).
- [ ] **Auditoría**:
    - Implementar un `AuditService` o decorador en Backend que registre acciones críticas en `WorkspaceAuditLog`.
    - Vista simple de "Activity Log" en la configuración del workspace.

### Fase 5: UI/UX Refinements
- [ ] **Workspace Selector**: Actualizar para mostrar iconos/colores y agrupar por Personal/Equipos.
- [ ] **Rutas con Slug**: (Opcional) Migrar rutas del frontend para usar `/:workspaceSlug/...` en lugar de IDs, mejorando la compartibilidad.