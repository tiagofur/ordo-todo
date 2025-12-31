/**
 * SOLUCIÓN: Mejoras al sistema de invitaciones
 */

// ============ VALIDACIONES Y MEJORAS EN SERVICE ============

// File: apps/backend/src/workspaces/workspaces.service.ts
async inviteMember(
  workspaceId: string,
  userId: string,
  email: string,
  role: 'ADMIN' | 'MEMBER' | 'VIEWER',
) {
  // 1. Validar que el workspace existe
  const workspace = await this.workspaceRepository.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException('Workspace not found');
  }

  // 2. Validar límite de miembros por tier (preventivo)
  const members = await this.workspaceRepository.listMembers(workspaceId);
  const tierLimits = {
    FREE: 5,
    PRO: 50,
    ENTERPRISE: Infinity,
  };

  if (members.length >= tierLimits[workspace.props.tier]) {
    throw new ForbiddenException(
      `Workspace tier ${workspace.props.tier} has reached maximum members limit`,
    );
  }

  // 3. Validar que el email no es ya miembro
  const userByEmail = await this.prisma.user.findUnique({
    where: { email },
  });

  if (userByEmail) {
    const existingMember = await this.workspaceRepository.findMember(
      workspaceId,
      userByEmail.id,
    );

    if (existingMember) {
      throw new ConflictException('User is already a member of this workspace');
    }
  }

  // 4. Verificar si ya existe una invitación pendiente para este email
  const existingInvitations = await this.invitationRepository.findByEmail(email);
  const pendingInvitation = existingInvitations.find(
    (inv) =>
      inv.props.workspaceId === workspaceId &&
      inv.props.status === 'PENDING' &&
      inv.props.expiresAt > new Date(),
  );

  if (pendingInvitation) {
    // Opción 1: Retornar error
    throw new ConflictException(
      'A pending invitation already exists for this email',
    );

    // Opción 2: Cancelar la anterior y crear nueva (descomentar si prefieres esto)
    /*
    pendingInvitation.cancel();
    await this.invitationRepository.update(pendingInvitation);

    await this.createAuditLog(workspaceId, 'INVITATION_CANCELLED', userId, {
      email,
      reason: 'Replaced by new invitation',
    });
    */
  }

  // 5. Ejecutar use case
  const inviteMemberUseCase = new InviteMemberUseCase(
    this.workspaceRepository,
    this.invitationRepository,
  );

  try {
    const result = await inviteMemberUseCase.execute(
      workspaceId,
      email,
      role,
      userId,
    );

    // 6. Log member invitation
    await this.createAuditLog(workspaceId, 'MEMBER_INVITED', userId, {
      email,
      role,
    });

    // 7. Enviar email (en producción)
    // await this.emailService.sendInvitationEmail(email, result.token, workspace);

    // 8. Retornar respuesta (sin token en producción)
    const response: any = {
      success: true,
      message: 'Invitation sent successfully',
      invitationId: result.invitation.id,
    };

    // Solo incluir token en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      response.devToken = result.token;
      response.devNote = 'Token only visible in development mode';
    }

    return response;
  } catch (error) {
    if (error.message === 'Workspace not found') {
      throw new NotFoundException(error.message);
    }
    throw error;
  }
}

async acceptInvitation(token: string, userId: string) {
  // 1. Buscar invitación
  const invitation = await this.invitationRepository.findByToken(token);
  if (!invitation) {
    throw new NotFoundException('Invalid invitation token');
  }

  // 2. Validar que no está expirada
  if (invitation.props.expiresAt < new Date()) {
    // Marcar como expirada
    invitation.expire();
    await this.invitationRepository.update(invitation);

    throw new BadRequestException('Invitation has expired');
  }

  // 3. Validar que está pendiente
  if (invitation.props.status !== 'PENDING') {
    throw new BadRequestException(
      `Invitation is ${invitation.props.status.toLowerCase()}`,
    );
  }

  // 4. Validar que el usuario no es ya miembro
  const existingMember = await this.workspaceRepository.findMember(
    invitation.props.workspaceId,
    userId,
  );

  if (existingMember) {
    // Auto-marcar como aceptada y retornar éxito
    invitation.accept();
    await this.invitationRepository.update(invitation);

    return {
      success: true,
      message: 'You are already a member of this workspace',
      alreadyMember: true,
    };
  }

  // 5. Ejecutar use case
  const acceptInvitationUseCase = new AcceptInvitationUseCase(
    this.workspaceRepository,
    this.invitationRepository,
  );

  const workspaceId = invitation.props.workspaceId;

  try {
    await acceptInvitationUseCase.execute(token, userId);

    // 6. Log invitation acceptance
    await this.createAuditLog(workspaceId, 'INVITATION_ACCEPTED', userId, {
      email: invitation.props.email,
      role: invitation.props.role,
    });

    return {
      success: true,
      message: 'Invitation accepted successfully',
      workspaceId,
    };
  } catch (error) {
    // Manejo de errores ya implementado
    throw error;
  }
}

// ============ ENDPOINT PARA CANCELAR INVITACIÓN ============

// File: apps/backend/src/workspaces/workspaces.controller.ts
@Delete(':id/invitations/:invitationId')
@UseGuards(WorkspaceGuard)
@Roles(MemberRole.OWNER, MemberRole.ADMIN)
@HttpCode(HttpStatus.NO_CONTENT)
@ApiOperation({
  summary: 'Cancel pending invitation',
  description: 'Cancels a pending invitation. Only OWNER and ADMIN can perform this action.',
})
cancelInvitation(
  @Param('id', ParseUUIDPipe) workspaceId: string,
  @Param('invitationId', ParseUUIDPipe) invitationId: string,
  @CurrentUser() user: RequestUser,
) {
  return this.workspacesService.cancelInvitation(workspaceId, invitationId, user.id);
}

// ============ MÉTODO EN SERVICE ============

async cancelInvitation(
  workspaceId: string,
  invitationId: string,
  actorId: string,
) {
  const invitation = await this.invitationRepository.findById(invitationId);

  if (!invitation) {
    throw new NotFoundException('Invitation not found');
  }

  if (invitation.props.workspaceId !== workspaceId) {
    throw new ForbiddenException('Invitation does not belong to this workspace');
  }

  if (invitation.props.status !== 'PENDING') {
    throw new BadRequestException(
      `Cannot cancel invitation with status: ${invitation.props.status}`,
    );
  }

  invitation.cancel();
  await this.invitationRepository.update(invitation);

  await this.createAuditLog(workspaceId, 'INVITATION_CANCELLED', actorId, {
    email: invitation.props.email,
    invitationId,
  });

  return { success: true };
}

// ============ LIMPIEZA AUTOMÁTICA DE INVITACIONES EXPIRADAS ============

// File: apps/backend/src/workspaces/workspace.scheduler.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class WorkspaceScheduler {
  private readonly logger = new Logger(WorkspaceScheduler.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Marca invitaciones expiradas automáticamente
   * Se ejecuta cada hora
   */
  @Cron(CronExpression.EVERY_HOUR)
  async expireInvitations() {
    const now = new Date();

    const result = await this.prisma.workspaceInvitation.updateMany({
      where: {
        status: 'PENDING',
        expiresAt: {
          lt: now,
        },
      },
      data: {
        status: 'EXPIRED',
        updatedAt: now,
      },
    });

    if (result.count > 0) {
      this.logger.log(`Marked ${result.count} invitations as expired`);
    }
  }

  /**
   * Limpia invitaciones viejas (más de 30 días)
   * Se ejecuta diariamente a las 3 AM
   */
  @Cron('0 3 * * *')
  async cleanOldInvitations() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.prisma.workspaceInvitation.deleteMany({
      where: {
        status: {
          in: ['EXPIRED', 'CANCELLED'],
        },
        updatedAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    if (result.count > 0) {
      this.logger.log(`Cleaned ${result.count} old invitations`);
    }
  }
}

/**
 * BENEFICIOS:
 * 1. Previene invitaciones duplicadas
 * 2. Valida límites antes de invitar
 * 3. No expone tokens en producción
 * 4. Permite cancelar invitaciones
 * 5. Limpieza automática de invitaciones viejas
 * 6. Mejor manejo de edge cases
 * 7. Audit logs completos
 */
