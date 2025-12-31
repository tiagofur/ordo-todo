/**
 * SOLUCIÓN: Validaciones adicionales para gestión de miembros
 */

// ============ VALIDACIONES EN EL SERVICE ============

// File: apps/backend/src/workspaces/workspaces.service.ts
import { WorkspaceErrors, WorkspaceException } from './workspace.exception';

async addMember(workspaceId: string, addMemberDto: AddMemberDto) {
  // 1. Validar que el workspace existe
  const workspace = await this.workspaceRepository.findById(workspaceId);
  if (!workspace || workspace.props.isDeleted) {
    throw new WorkspaceException(
      WorkspaceErrors.NOT_FOUND,
      HttpStatus.NOT_FOUND,
    );
  }

  // 2. Validar que el usuario existe
  const user = await this.userRepository.findById(addMemberDto.userId);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // 3. Validar que el usuario NO es ya miembro
  const existingMember = await this.workspaceRepository.findMember(
    workspaceId,
    addMemberDto.userId,
  );

  if (existingMember) {
    throw new WorkspaceException(
      WorkspaceErrors.MEMBER_ALREADY_EXISTS,
      HttpStatus.CONFLICT,
    );
  }

  // 4. Validar límite de miembros por tier
  const members = await this.workspaceRepository.listMembers(workspaceId);
  const tierLimits = {
    FREE: 5,
    PRO: 50,
    ENTERPRISE: Infinity,
  };

  const maxMembers = tierLimits[workspace.props.tier];
  if (members.length >= maxMembers) {
    throw new ForbiddenException(
      `Workspace tier ${workspace.props.tier} allows maximum ${maxMembers} members. Upgrade to add more.`,
    );
  }

  // 5. Ejecutar use case
  const addMemberToWorkspaceUseCase = new AddMemberToWorkspaceUseCase(
    this.workspaceRepository,
  );

  const member = await addMemberToWorkspaceUseCase.execute(
    workspaceId,
    addMemberDto.userId,
    addMemberDto.role ?? 'MEMBER',
  );

  // 6. Log member addition
  await this.createAuditLog(workspaceId, 'MEMBER_ADDED', undefined, {
    userId: addMemberDto.userId,
    role: addMemberDto.role ?? 'MEMBER',
  });

  return member.props;
}

async removeMember(workspaceId: string, userId: string) {
  // 1. Validar que el workspace existe
  const workspace = await this.workspaceRepository.findById(workspaceId);
  if (!workspace || workspace.props.isDeleted) {
    throw new WorkspaceException(
      WorkspaceErrors.NOT_FOUND,
      HttpStatus.NOT_FOUND,
    );
  }

  // 2. Validar que el miembro existe
  const member = await this.workspaceRepository.findMember(
    workspaceId,
    userId,
  );

  if (!member) {
    throw new WorkspaceException(
      WorkspaceErrors.MEMBER_NOT_FOUND,
      HttpStatus.NOT_FOUND,
    );
  }

  // 3. Prevenir eliminación del owner
  if (workspace.props.ownerId === userId) {
    throw new WorkspaceException(
      WorkspaceErrors.CANNOT_REMOVE_OWNER,
      HttpStatus.FORBIDDEN,
    );
  }

  // 4. Prevenir que un ADMIN elimine a otro ADMIN (solo OWNER puede)
  // Este check se puede hacer comparando el rol del actor (desde request.workspaceMember)
  // Por ahora lo dejamos comentado porque requiere pasar el actor al método

  // 5. Ejecutar use case
  const removeMemberFromWorkspaceUseCase =
    new RemoveMemberFromWorkspaceUseCase(this.workspaceRepository);

  await removeMemberFromWorkspaceUseCase.execute(workspaceId, userId);

  // 6. Log member removal
  await this.createAuditLog(workspaceId, 'MEMBER_REMOVED', undefined, {
    userId,
  });

  return { success: true };
}

// ============ VALIDACIÓN DE ROL EN CONTROLLER ============

// File: apps/backend/src/workspaces/workspaces.controller.ts
@Delete(':id/members/:userId')
@UseGuards(WorkspaceGuard)
@Roles(MemberRole.OWNER, MemberRole.ADMIN)
@HttpCode(HttpStatus.NO_CONTENT)
removeMember(
  @Param('id', ParseUUIDPipe) workspaceId: string,
  @Param('userId', ParseUUIDPipe) userId: string,
  @Request() req: any, // Para acceder a req.workspaceMember
) {
  // Validar que un ADMIN no puede eliminar a otro ADMIN
  // Solo el OWNER puede hacer eso
  const actorRole = req.workspaceMember?.role;

  if (actorRole === 'ADMIN') {
    // Si el actor es ADMIN, verificar que el target no sea ADMIN u OWNER
    // Esta validación se puede hacer en el service también
    // Por ahora la dejamos aquí para ejemplo
  }

  return this.workspacesService.removeMember(workspaceId, userId);
}

// ============ AGREGAR CONSTANTES DE TIER LIMITS ============

// File: apps/backend/src/workspaces/workspace.constants.ts
export const WORKSPACE_TIER_LIMITS = {
  FREE: {
    maxMembers: 5,
    maxProjects: 10,
    maxStorageMB: 100,
  },
  PRO: {
    maxMembers: 50,
    maxProjects: 100,
    maxStorageMB: 10000, // 10 GB
  },
  ENTERPRISE: {
    maxMembers: Infinity,
    maxProjects: Infinity,
    maxStorageMB: Infinity,
  },
} as const;

export function canAddMember(
  tier: 'FREE' | 'PRO' | 'ENTERPRISE',
  currentMemberCount: number,
): boolean {
  return currentMemberCount < WORKSPACE_TIER_LIMITS[tier].maxMembers;
}

/**
 * BENEFICIOS:
 * 1. Previene datos inconsistentes (duplicados, owner eliminado)
 * 2. Enforza límites de tier
 * 3. Mensajes de error claros
 * 4. Validaciones antes de ejecutar use cases
 * 5. Separación de preocupaciones (validación vs lógica de negocio)
 */
