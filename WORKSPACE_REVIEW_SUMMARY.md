# REPORTE COMPLETO: REVISIÓN MÓDULO WORKSPACES

**Fecha**: 2025-12-26
**Módulo**: Workspaces (Backend NestJS)
**Puntuación General**: 7.5/10

---

## RESUMEN EJECUTIVO

El módulo de workspaces está **bien implementado en general**, siguiendo principios de Clean Architecture y DDD con separación clara de responsabilidades. La arquitectura es sólida y el código está bien organizado.

**FORTALEZAS**:
- ✅ Arquitectura limpia con separación de capas
- ✅ Uso correcto de Use Cases del dominio
- ✅ Guards y validación de permisos implementados
- ✅ Audit logging completo
- ✅ Transacciones bien manejadas
- ✅ Backward compatibility con workspaces legacy

**ÁREAS DE MEJORA CRÍTICAS**:
- ❌ Falta documentación Swagger completa
- ❌ Validación de DTOs incompleta
- ❌ Queries Prisma directas en Service (viola Clean Architecture)
- ❌ Manejo de errores inconsistente
- ❌ WorkspaceGuard usa lógica frágil de extracción de ID

---

## PROBLEMAS DETALLADOS POR SEVERIDAD

### 🔴 CRÍTICOS (Requieren atención inmediata)

#### 1. FALTA DOCUMENTACIÓN SWAGGER COMPLETA
**Archivo**: `workspaces.controller.ts`
**Problema**: No hay decoradores `@ApiTags`, `@ApiOperation`, `@ApiResponse`
**Impacto**: Frontend no tiene documentación automática de los endpoints
**Solución**: Ver `/REVIEW_EXAMPLES/workspaces.controller.fixed.ts`
**Esfuerzo**: Alto (1-2 días)

#### 2. VALIDACIÓN DE SLUG DUPLICADO EN LUGAR INCORRECTO
**Archivo**: `workspaces.service.ts` líneas 59-73
**Problema**: Validación usando Prisma directamente, viola Clean Architecture
**Impacto**: Dificulta testing, acopla infraestructura
**Solución**: Ver `/REVIEW_EXAMPLES/slug-validation.fix.ts`
**Esfuerzo**: Medio (4 horas)

#### 3. QUERIES PRISMA DIRECTAS EN SERVICE
**Archivo**: `workspaces.service.ts` líneas 116-180, 190-263
**Problema**: Service accede directamente a Prisma, viola separación de capas
**Impacto**: Código no testeable, acoplamiento alto
**Solución**: Ver `/REVIEW_EXAMPLES/repository-refactor.fix.ts`
**Esfuerzo**: Alto (1-2 días)

#### 4. WORKSPACE GUARD CON LÓGICA FRÁGIL
**Archivo**: `workspace.guard.ts` líneas 87-115
**Problema**: Usa string matching en rutas (`route.path.includes`), muy frágil
**Impacto**: Puede fallar con cambios en rutas, difícil de mantener
**Solución**: Ver `/REVIEW_EXAMPLES/workspace-guard.fix.ts`
**Esfuerzo**: Alto (1 día)

---

### ⚠️ MEDIOS (Afectan calidad y mantenibilidad)

#### 5. VALIDACIÓN DE PARÁMETROS QUERY INSUFICIENTE
**Archivo**: `workspaces.controller.ts` líneas 197-205
**Problema**: Parámetros `limit` y `offset` parseados manualmente
**Solución**: Ver `/REVIEW_EXAMPLES/audit-logs-query.dto.ts`
**Esfuerzo**: Bajo (1 hora)

#### 6. FALTA VALIDACIÓN DE UUIDs
**Archivo**: Todos los endpoints con `@Param('id')`
**Problema**: No se valida formato UUID
**Solución**: Ver `/REVIEW_EXAMPLES/param-validation.example.ts`
**Esfuerzo**: Bajo (2 horas)

#### 7. ENDPOINT AMBIGUO `findBySlug`
**Archivo**: `workspaces.controller.ts` línea 59-62
**Problema**: Con namespaces, puede retornar workspace incorrecto
**Solución**: Deprecar y usar `findByUserAndSlug` exclusivamente
**Esfuerzo**: Bajo (2 horas)

#### 8. MANEJO DE ERRORES INCONSISTENTE
**Archivo**: Múltiples métodos en `workspaces.service.ts`
**Problema**: Mezcla strings genéricos con mensajes en español
**Solución**: Ver `/REVIEW_EXAMPLES/error-handling.fix.ts`
**Esfuerzo**: Medio (4 horas)

#### 9. FALTA DOCUMENTACIÓN SWAGGER EN DTOs
**Archivo**: Todos los archivos en `dto/`
**Problema**: No usan `@ApiProperty` para documentación
**Solución**: Ver `/REVIEW_EXAMPLES/dtos.fixed.ts`
**Esfuerzo**: Medio (3 horas)

#### 10. VALIDACIÓN DE FORMATO EN DTOs INCOMPLETA
**Archivo**: `create-workspace.dto.ts`, otros
**Problema**: No valida formato de slug (URL-safe), color (hex válido)
**Solución**: Agregar `@Matches()` con regex
**Esfuerzo**: Bajo (1 hora)

#### 11. MÉTODO `findBySlug` AMBIGUO EN REPOSITORIO
**Archivo**: `workspace.repository.ts` líneas 179-218
**Problema**: Usa `findFirst` cuando debería usar composite key
**Solución**: Ver `/REVIEW_EXAMPLES/repository-findby-slug.fix.ts`
**Esfuerzo**: Medio (3 horas)

#### 12. FALTA VALIDACIONES EN GESTIÓN DE MIEMBROS
**Archivo**: `workspaces.service.ts` métodos `addMember`, `removeMember`
**Problema**: No valida duplicados, límites de tier, owner removal
**Solución**: Ver `/REVIEW_EXAMPLES/member-validations.fix.ts`
**Esfuerzo**: Medio (4 horas)

#### 13. SISTEMA DE INVITACIONES INCOMPLETO
**Archivo**: `workspaces.service.ts` método `inviteMember`
**Problema**: Retorna token en producción, no valida duplicados
**Solución**: Ver `/REVIEW_EXAMPLES/invitations.fix.ts`
**Esfuerzo**: Medio (4 horas)

#### 14. AUTO-REPAIR PUEDE CAUSAR RACE CONDITIONS
**Archivo**: `workspace.guard.ts` líneas 56-64
**Problema**: Múltiples requests simultáneos pueden crear miembro duplicado
**Solución**: Usar `upsert` o catch constraint violation
**Esfuerzo**: Bajo (2 horas)

---

### ℹ️ BAJOS (Mejoras de optimización)

#### 15. FALTA LOGGING ESTRUCTURADO
**Problema**: No hay logging de operaciones (solo audit logs)
**Solución**: Usar `Logger` de NestJS en Service
**Esfuerzo**: Bajo (1 hora)

#### 16. MÉTODO `ensureOwnerIsMember` SIN LOGGING
**Archivo**: `workspaces.service.ts` líneas 524-542
**Problema**: Operación silenciosa que puede fallar
**Solución**: Agregar logging para troubleshooting
**Esfuerzo**: Muy bajo (30 min)

#### 17. FALTA VALIDACIÓN DE LONGITUD MÁXIMA
**Archivo**: Todos los DTOs
**Problema**: No hay `@MaxLength` para prevenir payloads enormes
**Solución**: Agregar límites de longitud
**Esfuerzo**: Bajo (1 hora)

#### 18. TRANSACCIÓN EN CREATE DUPLICADA
**Archivo**: `workspace.repository.ts` líneas 151-168
**Problema**: Repositorio agrega owner, Service también lo hace
**Solución**: Eliminar lógica duplicada
**Esfuerzo**: Bajo (1 hora)

#### 19. FALTA CACHE DE MEMBERSHIPS
**Problema**: Cada request hace query a DB para verificar membership
**Solución**: Implementar cache Redis/in-memory
**Esfuerzo**: Alto (1-2 días)

#### 20. AUDIT LOGS SIN FILTROS AVANZADOS
**Archivo**: `workspaces.service.ts` método `getAuditLogs`
**Problema**: No hay filtrado por acción, actor, rango de fechas
**Solución**: Ver `/REVIEW_EXAMPLES/audit-logs-improvements.fix.ts`
**Esfuerzo**: Medio (3 horas)

#### 21. FALTA ENDPOINTS DE RESTAURACIÓN
**Problema**: No hay forma de restaurar workspace archivado o soft-deleted
**Solución**: Agregar endpoints `POST /:id/restore` y `POST /:id/unarchive`
**Esfuerzo**: Bajo (2 horas)

---

## ASPECTOS BIEN IMPLEMENTADOS ✅

### Controller Layer
- ✅ Estructura de rutas RESTful clara y organizada
- ✅ Guards aplicados consistentemente (`JwtAuthGuard`, `WorkspaceGuard`)
- ✅ Decorador `@Roles` para autorización granular
- ✅ Códigos HTTP apropiados (`201`, `204`, `200`)
- ✅ Inyección de dependencias correcta
- ✅ Separación de concerns (controller delgado)

### Service Layer
- ✅ Uso correcto de Use Cases del dominio (Clean Architecture)
- ✅ Inyección de múltiples repositorios bien estructurada
- ✅ Audit logging implementado en todas las operaciones importantes
- ✅ Manejo de backward compatibility (legacy workspaces)
- ✅ Transacciones bien orquestadas

### DTOs
- ✅ Validación básica correcta con class-validator
- ✅ Separación Create/Update DTOs
- ✅ Tipos TypeScript correctos (union types para enums)
- ✅ Uso de `@IsOptional()` apropiado

### Repositorios
- ✅ Implementación completa de interfaces del core
- ✅ Mappers bien estructurados (Prisma ↔ Domain)
- ✅ Uso de transacciones en operaciones atómicas
- ✅ Cálculo de estadísticas agregadas
- ✅ Manejo de relaciones complejas

### Guards
- ✅ WorkspaceGuard bien estructurado
- ✅ Auto-repair de legacy workspaces
- ✅ Validación de roles usando Reflector
- ✅ Inyecta membership en request

### Funcionalidades
- ✅ Creación de workspace con workflow por defecto
- ✅ Sistema de invitaciones con tokens
- ✅ Gestión de miembros con roles
- ✅ Workspace settings con upsert
- ✅ Audit logs completos
- ✅ Soft delete y archive separados

---

## RECOMENDACIONES PRIORITARIAS

### 🎯 SPRINT 1 (1 semana)
1. **Agregar documentación Swagger completa** (Problema #1)
   - Impacto: Alto - Mejora experiencia de frontend
   - Archivos: `workspaces.controller.ts`, todos los DTOs
   - Referencia: `/REVIEW_EXAMPLES/workspaces.controller.fixed.ts`

2. **Refactorizar WorkspaceGuard con metadata** (Problema #4)
   - Impacto: Alto - Evita bugs futuros
   - Archivo: `workspace.guard.ts`
   - Referencia: `/REVIEW_EXAMPLES/workspace-guard.fix.ts`

3. **Agregar validaciones de formato en DTOs** (Problemas #6, #10)
   - Impacto: Medio - Mejora seguridad y UX
   - Archivos: Todos los DTOs
   - Referencia: `/REVIEW_EXAMPLES/dtos.fixed.ts`

### 🎯 SPRINT 2 (1 semana)
4. **Mover queries Prisma a repositorios** (Problema #3)
   - Impacto: Alto - Respeta Clean Architecture
   - Archivos: `workspaces.service.ts`, `workspace.repository.ts`
   - Referencia: `/REVIEW_EXAMPLES/repository-refactor.fix.ts`

5. **Implementar sistema de errores consistente** (Problema #8)
   - Impacto: Medio - Mejor experiencia de frontend
   - Archivos: `workspaces.service.ts`
   - Referencia: `/REVIEW_EXAMPLES/error-handling.fix.ts`

6. **Mejorar validaciones de miembros** (Problema #12)
   - Impacto: Medio - Previene datos inconsistentes
   - Archivo: `workspaces.service.ts`
   - Referencia: `/REVIEW_EXAMPLES/member-validations.fix.ts`

### 🎯 SPRINT 3 (1 semana)
7. **Mejorar sistema de invitaciones** (Problema #13)
   - Impacto: Medio - Mejor seguridad y UX
   - Archivo: `workspaces.service.ts`
   - Referencia: `/REVIEW_EXAMPLES/invitations.fix.ts`

8. **Agregar filtros avanzados a audit logs** (Problema #20)
   - Impacto: Bajo - Mejora observabilidad
   - Archivos: `workspaces.service.ts`, repositorio
   - Referencia: `/REVIEW_EXAMPLES/audit-logs-improvements.fix.ts`

9. **Agregar logging estructurado** (Problema #15)
   - Impacto: Bajo - Mejora debugging
   - Archivo: `workspaces.service.ts`

---

## GUÍA DE INTEGRACIÓN PARA FRONTEND

### Base URL
```
https://api.ordo.com/workspaces
```

### Autenticación
Todos los endpoints requieren header:
```
Authorization: Bearer <JWT_TOKEN>
```

### Endpoints Principales

#### 1. Crear Workspace
```typescript
POST /workspaces

// Request
interface CreateWorkspaceRequest {
  name: string;          // Requerido, 1-100 caracteres
  slug: string;          // Requerido, URL-safe (a-z0-9-)
  description?: string;  // Opcional, max 500 caracteres
  type: 'PERSONAL' | 'WORK' | 'TEAM';
  color?: string;        // Opcional, formato hex (#RRGGBB)
  icon?: string;         // Opcional, emoji/icono
}

// Response 201
interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: 'PERSONAL' | 'WORK' | 'TEAM';
  tier: 'FREE' | 'PRO' | 'ENTERPRISE';
  color: string;
  icon?: string;
  ownerId: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// Errores
400 - Datos inválidos
403 - Slug duplicado para este usuario
401 - No autenticado
```

#### 2. Listar Workspaces del Usuario
```typescript
GET /workspaces

// Response 200
interface WorkspaceWithStats {
  id: string;
  name: string;
  slug: string;
  type: string;
  tier: string;
  owner: {
    id: string;
    username: string;
    name: string;
    email: string;
  };
  stats: {
    projectCount: number;
    memberCount: number;
    taskCount: number;
  };
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}[]

// Ejemplo de fetch
async function getWorkspaces() {
  const response = await fetch('https://api.ordo.com/workspaces', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch workspaces');
  }

  return await response.json();
}
```

#### 3. Obtener Workspace por ID
```typescript
GET /workspaces/:id

// Response 200
Workspace

// Errores
404 - Workspace no encontrado
403 - No eres miembro
401 - No autenticado
```

#### 4. Actualizar Workspace
```typescript
PUT /workspaces/:id

// Request (todos los campos opcionales)
interface UpdateWorkspaceRequest {
  name?: string;
  description?: string;
  type?: 'PERSONAL' | 'WORK' | 'TEAM';
  color?: string;
  icon?: string;
}

// Response 200
Workspace

// Errores
400 - Datos inválidos
403 - Permisos insuficientes (requiere OWNER o ADMIN)
404 - Workspace no encontrado
```

#### 5. Eliminar Workspace (Soft Delete)
```typescript
DELETE /workspaces/:id

// Response 204 (sin contenido)

// Errores
403 - Solo el OWNER puede eliminar
404 - Workspace no encontrado
```

#### 6. Obtener Miembros
```typescript
GET /workspaces/:id/members

// Response 200
interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}[]

// Ejemplo con React Query
import { useQuery } from '@tanstack/react-query';

function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'members'],
    queryFn: async () => {
      const res = await fetch(`/workspaces/${workspaceId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  });
}
```

#### 7. Agregar Miembro
```typescript
POST /workspaces/:id/members

// Request
interface AddMemberRequest {
  userId: string;  // ID del usuario a agregar
  role?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';  // Default: MEMBER
}

// Response 201
WorkspaceMember

// Errores
403 - Permisos insuficientes (requiere OWNER o ADMIN)
404 - Usuario no encontrado
409 - Usuario ya es miembro
```

#### 8. Invitar Miembro por Email
```typescript
POST /workspaces/:id/invite

// Request
interface InviteMemberRequest {
  email: string;  // Email válido
  role?: 'ADMIN' | 'MEMBER' | 'VIEWER';  // Default: MEMBER
}

// Response 201
interface InvitationResponse {
  success: true;
  message: string;
  invitationId: string;
  devToken?: string;  // Solo en desarrollo
}

// Ejemplo
async function inviteMember(workspaceId: string, email: string) {
  const response = await fetch(`/workspaces/${workspaceId}/invite`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, role: 'MEMBER' }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}
```

#### 9. Aceptar Invitación
```typescript
POST /workspaces/invitations/accept

// Request
interface AcceptInvitationRequest {
  token: string;  // Token recibido por email
}

// Response 200
interface AcceptInvitationResponse {
  success: true;
  message: string;
  workspaceId: string;
}

// Errores
404 - Token inválido o expirado
400 - Invitación no está pendiente
```

#### 10. Obtener Audit Logs
```typescript
GET /workspaces/:id/audit-logs?limit=50&offset=0

// Query Parameters
interface AuditLogsQuery {
  limit?: number;    // Default: 50, Max: 100
  offset?: number;   // Default: 0
}

// Response 200
interface AuditLogsResponse {
  logs: {
    id: string;
    workspaceId: string;
    actorId?: string;
    action: string;  // 'WORKSPACE_CREATED', 'MEMBER_ADDED', etc.
    payload?: Record<string, any>;
    createdAt: string;
  }[];
  total: number;
}

// Ejemplo de paginación con React Query
function useAuditLogs(workspaceId: string, page: number) {
  return useQuery({
    queryKey: ['audit-logs', workspaceId, page],
    queryFn: async () => {
      const offset = page * 50;
      const res = await fetch(
        `/workspaces/${workspaceId}/audit-logs?limit=50&offset=${offset}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.json();
    },
  });
}
```

### TypeScript Types Completos
```typescript
// File: types/workspace.types.ts

export type WorkspaceType = 'PERSONAL' | 'WORK' | 'TEAM';
export type WorkspaceTier = 'FREE' | 'PRO' | 'ENTERPRISE';
export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: WorkspaceType;
  tier: WorkspaceTier;
  color: string;
  icon?: string;
  ownerId: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceWithStats extends Workspace {
  owner: {
    id: string;
    username: string;
    name: string;
    email: string;
  };
  stats: {
    projectCount: number;
    memberCount: number;
    taskCount: number;
  };
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export interface AuditLog {
  id: string;
  workspaceId: string;
  actorId?: string;
  action: string;
  payload?: Record<string, any>;
  createdAt: string;
}
```

### Manejo de Errores
```typescript
interface APIError {
  statusCode: number;
  errorCode: string;
  message: string;
  timestamp: string;
}

// Ejemplo de manejo
async function handleWorkspaceAction<T>(
  action: () => Promise<T>
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof Response) {
      const apiError: APIError = await error.json();

      switch (apiError.errorCode) {
        case 'WORKSPACE_NOT_FOUND':
          toast.error('Workspace no encontrado');
          break;
        case 'WORKSPACE_UNAUTHORIZED':
          toast.error('No tienes permisos');
          break;
        case 'WORKSPACE_SLUG_DUPLICATE':
          toast.error('Ya tienes un workspace con ese slug');
          break;
        default:
          toast.error(apiError.message);
      }

      throw apiError;
    }

    throw error;
  }
}
```

---

## REQUERIMIENTOS DE BASE DE DATOS

### Schema Prisma Requerido

```prisma
model Workspace {
  id          String   @id @default(cuid())
  name        String
  slug        String
  description String?
  type        WorkspaceType
  tier        WorkspaceTier @default(FREE)
  color       String   @default("#2563EB")
  icon        String?
  ownerId     String?
  owner       User?    @relation("OwnedWorkspaces", fields: [ownerId], references: [id])
  isArchived  Boolean  @default(false)
  isDeleted   Boolean  @default(false)
  deletedAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  members     WorkspaceMember[]
  projects    Project[]
  workflows   Workflow[]
  invitations WorkspaceInvitation[]
  settings    WorkspaceSettings?
  auditLogs   WorkspaceAuditLog[]

  @@unique([ownerId, slug])
  @@index([slug])
  @@index([ownerId])
  @@index([isDeleted])
}

model WorkspaceMember {
  id          String   @id @default(cuid())
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  userId      String
  user        User     @relation("WorkspaceMemberships", fields: [userId], references: [id], onDelete: Cascade)
  role        MemberRole
  joinedAt    DateTime @default(now())

  @@unique([workspaceId, userId])
  @@index([userId])
  @@index([workspaceId])
}

model WorkspaceInvitation {
  id          String      @id @default(cuid())
  workspaceId String
  workspace   Workspace   @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  email       String
  tokenHash   String      @unique
  role        MemberRole
  status      InviteStatus @default(PENDING)
  invitedById String?
  invitedBy   User?       @relation("SentInvitations", fields: [invitedById], references: [id])
  expiresAt   DateTime
  acceptedAt  DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([workspaceId])
  @@index([email])
  @@index([tokenHash])
  @@index([status, expiresAt])
}

model WorkspaceSettings {
  id             String    @id @default(cuid())
  workspaceId    String    @unique
  workspace      Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  defaultView    ViewType?
  defaultDueTime Int?      // Minutes from start of day
  timezone       String?   // IANA timezone
  locale         String?   // BCP 47 locale
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

model WorkspaceAuditLog {
  id          String    @id @default(cuid())
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  actorId     String?
  actor       User?     @relation("AuditActions", fields: [actorId], references: [id])
  action      String
  payload     Json?
  createdAt   DateTime  @default(now())

  @@index([workspaceId, createdAt(sort: Desc)])
  @@index([actorId])
  @@index([action])
}

enum WorkspaceType {
  PERSONAL
  WORK
  TEAM
}

enum WorkspaceTier {
  FREE
  PRO
  ENTERPRISE
}

enum MemberRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

enum InviteStatus {
  PENDING
  ACCEPTED
  EXPIRED
  CANCELLED
}

enum ViewType {
  LIST
  KANBAN
  CALENDAR
  TIMELINE
  FOCUS
}
```

### Índices Recomendados
```sql
-- Performance para queries frecuentes
CREATE INDEX idx_workspace_owner_slug ON Workspace(ownerId, slug);
CREATE INDEX idx_workspace_deleted ON Workspace(isDeleted) WHERE isDeleted = false;
CREATE INDEX idx_member_workspace ON WorkspaceMember(workspaceId);
CREATE INDEX idx_member_user ON WorkspaceMember(userId);
CREATE INDEX idx_invitation_workspace ON WorkspaceInvitation(workspaceId);
CREATE INDEX idx_invitation_email ON WorkspaceInvitation(email);
CREATE INDEX idx_invitation_token ON WorkspaceInvitation(tokenHash);
CREATE INDEX idx_audit_workspace_date ON WorkspaceAuditLog(workspaceId, createdAt DESC);
```

### Constraints de Integridad
```sql
-- Prevenir eliminación de owner de workspace
ALTER TABLE WorkspaceMember
  ADD CONSTRAINT prevent_owner_removal
  CHECK (role != 'OWNER' OR workspaceId NOT IN (
    SELECT id FROM Workspace WHERE ownerId = userId
  ));

-- Prevenir más de un OWNER por workspace
CREATE UNIQUE INDEX idx_one_owner_per_workspace
  ON WorkspaceMember(workspaceId)
  WHERE role = 'OWNER';
```

---

## TESTING RECOMENDADO

### Unit Tests (Service)
```typescript
// workspaces.service.spec.ts
describe('WorkspacesService', () => {
  let service: WorkspacesService;
  let workspaceRepo: jest.Mocked<WorkspaceRepository>;
  let userRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    // Mock repositories
    workspaceRepo = createMock<WorkspaceRepository>();
    userRepo = createMock<UserRepository>();

    service = new WorkspacesService(
      workspaceRepo,
      // ... otros repos
    );
  });

  describe('create', () => {
    it('should create workspace with owner as member', async () => {
      // Arrange
      const dto = {
        name: 'Test',
        slug: 'test',
        type: 'PERSONAL' as const,
      };
      const userId = 'user123';

      // Act
      const result = await service.create(dto, userId);

      // Assert
      expect(result).toBeDefined();
      expect(workspaceRepo.create).toHaveBeenCalled();
      expect(workspaceRepo.addMember).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'OWNER' })
      );
    });

    it('should throw error if slug is duplicate', async () => {
      // Test validación de slug duplicado
    });
  });
});
```

### Integration Tests (E2E)
```typescript
// workspaces.e2e-spec.ts
describe('Workspaces (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login y obtener token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'test123' });

    token = loginRes.body.accessToken;
  });

  it('/workspaces (POST) - should create workspace', () => {
    return request(app.getHttpServer())
      .post('/workspaces')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Workspace',
        slug: 'test-workspace',
        type: 'PERSONAL',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe('Test Workspace');
      });
  });

  it('/workspaces/:id/members (GET) - should list members', async () => {
    // Test listado de miembros
  });
});
```

---

## MÉTRICAS DE CALIDAD

### Cobertura de Tests Objetivo
- Unit Tests: 80%+
- Integration Tests: Endpoints críticos (create, members, invitations)
- E2E Tests: Flujos principales

### Performance Targets
- GET /workspaces: < 100ms (sin stats)
- GET /workspaces (con stats): < 500ms
- POST /workspaces: < 200ms
- GET /workspaces/:id/members: < 150ms

### Límites de Rate
- General: 100 req/min por usuario
- Invitations: 10 req/min por workspace

---

## CONCLUSIÓN

El módulo de workspaces tiene una **base sólida** con arquitectura limpia y buenas prácticas de DDD. Los problemas identificados son principalmente de **documentación, validación y adherencia estricta a Clean Architecture**.

**Próximos Pasos Recomendados**:
1. Implementar Swagger completo (1-2 días)
2. Refactorizar Guard con metadata (1 día)
3. Mover queries a repositorios (1-2 días)
4. Mejorar sistema de errores (4 horas)
5. Completar validaciones en DTOs y Service (1 día)

**Esfuerzo Total Estimado**: 1-2 semanas con 1 desarrollador

---

## ARCHIVOS DE REFERENCIA

Todos los ejemplos de código corregido están en:
```
/REVIEW_EXAMPLES/
├── workspaces.controller.fixed.ts
├── audit-logs-query.dto.ts
├── param-validation.example.ts
├── slug-validation.fix.ts
├── repository-refactor.fix.ts
├── error-handling.fix.ts
├── dtos.fixed.ts
├── repository-findby-slug.fix.ts
├── workspace-guard.fix.ts
├── member-validations.fix.ts
├── invitations.fix.ts
└── audit-logs-improvements.fix.ts
```

**Autor**: Claude Code (Sonnet 4.5)
**Fecha**: 2025-12-26
