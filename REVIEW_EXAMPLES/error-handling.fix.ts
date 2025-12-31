/**
 * SOLUCIÓN: Manejo de errores consistente con constantes y tipado
 */

// ============ CREAR CONSTANTES DE ERROR ============

// File: apps/backend/src/workspaces/workspace.errors.ts
export const WorkspaceErrors = {
  NOT_FOUND: 'WORKSPACE_NOT_FOUND',
  UNAUTHORIZED: 'WORKSPACE_UNAUTHORIZED',
  SLUG_DUPLICATE: 'WORKSPACE_SLUG_DUPLICATE',
  INVITATION_NOT_FOUND: 'INVITATION_NOT_FOUND',
  INVITATION_EXPIRED: 'INVITATION_EXPIRED',
  INVITATION_NOT_PENDING: 'INVITATION_NOT_PENDING',
  MEMBER_ALREADY_EXISTS: 'MEMBER_ALREADY_EXISTS',
  MEMBER_NOT_FOUND: 'MEMBER_NOT_FOUND',
  CANNOT_REMOVE_OWNER: 'CANNOT_REMOVE_OWNER',
} as const;

export type WorkspaceErrorCode = typeof WorkspaceErrors[keyof typeof WorkspaceErrors];

// Mensajes de error (pueden venir de i18n en el futuro)
export const WorkspaceErrorMessages: Record<WorkspaceErrorCode, string> = {
  WORKSPACE_NOT_FOUND: 'Workspace not found',
  WORKSPACE_UNAUTHORIZED: 'You do not have permission to perform this action',
  WORKSPACE_SLUG_DUPLICATE: 'You already have a workspace with this slug',
  INVITATION_NOT_FOUND: 'Invitation not found',
  INVITATION_EXPIRED: 'This invitation has expired',
  INVITATION_NOT_PENDING: 'This invitation is no longer pending',
  MEMBER_ALREADY_EXISTS: 'User is already a member of this workspace',
  MEMBER_NOT_FOUND: 'Member not found in this workspace',
  CANNOT_REMOVE_OWNER: 'Cannot remove workspace owner',
};

// ============ CREAR CUSTOM EXCEPTION ============

// File: apps/backend/src/workspaces/workspace.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';
import { WorkspaceErrorCode, WorkspaceErrorMessages } from './workspace.errors';

export class WorkspaceException extends HttpException {
  constructor(
    errorCode: WorkspaceErrorCode,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        statusCode,
        errorCode,
        message: WorkspaceErrorMessages[errorCode],
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}

// ============ USO EN EL SERVICE (REFACTORIZADO) ============

// File: apps/backend/src/workspaces/workspaces.service.ts
import { WorkspaceErrors, WorkspaceException } from './workspace.exception';

async remove(id: string, userId: string) {
  const softDeleteUseCase = new SoftDeleteWorkspaceUseCase(
    this.workspaceRepository,
  );

  try {
    await softDeleteUseCase.execute(id, userId);

    // Log workspace deletion
    await this.createAuditLog(id, 'WORKSPACE_DELETED', userId);

    return { success: true };
  } catch (error) {
    // Map domain errors to HTTP exceptions
    if (error.message === 'Workspace not found') {
      throw new WorkspaceException(
        WorkspaceErrors.NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    if (error.message === 'Unauthorized') {
      throw new WorkspaceException(
        WorkspaceErrors.UNAUTHORIZED,
        HttpStatus.FORBIDDEN,
      );
    }
    throw error;
  }
}

async archive(id: string, userId: string) {
  const archiveUseCase = new ArchiveWorkspaceUseCase(
    this.workspaceRepository,
  );

  try {
    const workspace = await archiveUseCase.execute(id, userId);

    await this.createAuditLog(id, 'WORKSPACE_ARCHIVED', userId);

    return workspace.props;
  } catch (error) {
    if (error.message === 'Workspace not found') {
      throw new WorkspaceException(
        WorkspaceErrors.NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    if (error.message === 'Unauthorized') {
      throw new WorkspaceException(
        WorkspaceErrors.UNAUTHORIZED,
        HttpStatus.FORBIDDEN,
      );
    }
    throw error;
  }
}

async acceptInvitation(token: string, userId: string) {
  const acceptInvitationUseCase = new AcceptInvitationUseCase(
    this.workspaceRepository,
    this.invitationRepository,
  );

  try {
    const invitation = await this.invitationRepository.findByToken(token);
    if (!invitation) {
      throw new WorkspaceException(
        WorkspaceErrors.INVITATION_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const workspaceId = invitation.props.workspaceId;

    await acceptInvitationUseCase.execute(token, userId);

    await this.createAuditLog(workspaceId, 'INVITATION_ACCEPTED', userId);

    return { success: true, message: 'Invitation accepted' };
  } catch (error) {
    if (error instanceof WorkspaceException) {
      throw error;
    }

    // Map use case errors
    const errorMap: Record<string, WorkspaceErrorCode> = {
      'Invalid invitation token': WorkspaceErrors.INVITATION_NOT_FOUND,
      'Invitation expired': WorkspaceErrors.INVITATION_EXPIRED,
      'Invitation is not pending': WorkspaceErrors.INVITATION_NOT_PENDING,
    };

    const errorCode = errorMap[error.message];
    if (errorCode) {
      throw new WorkspaceException(errorCode, HttpStatus.BAD_REQUEST);
    }

    throw error;
  }
}

/**
 * BENEFICIOS:
 * 1. Errores consistentes y tipados
 * 2. Códigos de error reutilizables
 * 3. Fácil integración con i18n
 * 4. Frontend puede manejar errores por código
 * 5. Respuestas de error estructuradas
 * 6. Separación entre errores de dominio y HTTP
 */
