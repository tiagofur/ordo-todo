/**
 * SOLUCIÓN: WorkspaceGuard robusto con metadata
 */

// ============ CREAR DECORADOR PARA METADATA ============

// File: apps/backend/src/common/decorators/workspace-context.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const WORKSPACE_CONTEXT_KEY = 'workspaceContext';

export type WorkspaceContextType = 'direct' | 'from-project' | 'from-task';

export interface WorkspaceContextConfig {
  /**
   * Tipo de contexto de workspace
   * - 'direct': El ID del workspace está en los params
   * - 'from-project': Necesita buscar el workspace desde el projectId
   * - 'from-task': Necesita buscar el workspace desde el taskId
   */
  type: WorkspaceContextType;

  /**
   * Nombre del parámetro que contiene el ID
   * Por defecto: 'id' para direct, 'projectId' o 'taskId' según tipo
   */
  paramName?: string;
}

/**
 * Marca un endpoint como que requiere contexto de workspace
 *
 * @example
 * @WorkspaceContext({ type: 'direct', paramName: 'id' })
 * @Get(':id')
 * findOne(@Param('id') id: string) { ... }
 *
 * @WorkspaceContext({ type: 'from-project', paramName: 'projectId' })
 * @Get('projects/:projectId/tasks')
 * getTasks(@Param('projectId') projectId: string) { ... }
 */
export const WorkspaceContext = (config: WorkspaceContextConfig) =>
  SetMetadata(WORKSPACE_CONTEXT_KEY, config);

// ============ WORKSPACE GUARD REFACTORIZADO ============

// File: apps/backend/src/common/guards/workspace.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';
import { MemberRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import {
  WORKSPACE_CONTEXT_KEY,
  WorkspaceContextConfig,
} from '../decorators/workspace-context.decorator';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  private readonly logger = new Logger(WorkspaceGuard.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.warn('WorkspaceGuard: No user in request');
      return false;
    }

    // 1. Extract workspace context configuration
    const workspaceConfig = this.reflector.get<WorkspaceContextConfig>(
      WORKSPACE_CONTEXT_KEY,
      context.getHandler(),
    );

    // If no workspace context is configured, allow (guard not applicable)
    if (!workspaceConfig) {
      this.logger.debug('WorkspaceGuard: No workspace context configured');
      return true;
    }

    // 2. Extract workspace ID based on configuration
    const workspaceId = await this.extractWorkspaceId(
      request,
      workspaceConfig,
    );

    if (!workspaceId) {
      throw new BadRequestException(
        'Workspace context could not be determined',
      );
    }

    // 3. Check workspace membership
    let membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
    });

    // 4. Auto-repair for legacy workspaces (owner without membership)
    if (!membership) {
      membership = await this.handleLegacyWorkspace(workspaceId, user.id);
    }

    if (!membership) {
      this.logger.warn(
        `WorkspaceGuard: User ${user.id} is not a member of workspace ${workspaceId}`,
      );
      throw new ForbiddenException('You are not a member of this workspace');
    }

    // 5. Check role permissions (if defined)
    const requiredRoles = this.reflector.getAllAndOverride<MemberRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles && !requiredRoles.includes(membership.role)) {
      this.logger.warn(
        `WorkspaceGuard: User ${user.id} has role ${membership.role} but needs one of: ${requiredRoles.join(', ')}`,
      );
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredRoles.join(', ')}`,
      );
    }

    // 6. Attach membership to request for easier access in controller
    request.workspaceMember = membership;
    request.workspaceId = workspaceId;

    this.logger.debug(
      `WorkspaceGuard: Access granted to user ${user.id} for workspace ${workspaceId}`,
    );

    return true;
  }

  /**
   * Extracts workspace ID based on context configuration
   */
  private async extractWorkspaceId(
    request: any,
    config: WorkspaceContextConfig,
  ): Promise<string | null> {
    const params = request.params || {};

    switch (config.type) {
      case 'direct':
        // Workspace ID is directly in params
        const paramName = config.paramName || 'id';
        return params[paramName] || null;

      case 'from-project':
        // Need to lookup workspace from project
        const projectId = params[config.paramName || 'projectId'];
        if (!projectId) return null;

        const project = await this.prisma.project.findUnique({
          where: { id: projectId },
          select: { workspaceId: true },
        });

        return project?.workspaceId || null;

      case 'from-task':
        // Need to lookup workspace from task
        const taskId = params[config.paramName || 'taskId'];
        if (!taskId) return null;

        const task = await this.prisma.task.findUnique({
          where: { id: taskId },
          include: {
            project: {
              select: { workspaceId: true },
            },
          },
        });

        return task?.project?.workspaceId || null;

      default:
        this.logger.error(
          `Unknown workspace context type: ${(config as any).type}`,
        );
        return null;
    }
  }

  /**
   * Handles legacy workspaces where owner is not in members table
   */
  private async handleLegacyWorkspace(
    workspaceId: string,
    userId: string,
  ): Promise<any | null> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });

    if (workspace?.ownerId === userId) {
      this.logger.log(
        `WorkspaceGuard: Auto-repairing legacy workspace ${workspaceId} - adding owner as member`,
      );

      try {
        // Auto-repair: Add owner as a member
        return await this.prisma.workspaceMember.create({
          data: {
            workspaceId,
            userId,
            role: MemberRole.OWNER,
          },
        });
      } catch (error) {
        // If creation fails (e.g., race condition), try to fetch again
        this.logger.error(
          `WorkspaceGuard: Failed to auto-repair workspace ${workspaceId}`,
          error,
        );
        return await this.prisma.workspaceMember.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId,
              userId,
            },
          },
        });
      }
    }

    return null;
  }
}

// ============ USO EN CONTROLLERS ============

// File: apps/backend/src/workspaces/workspaces.controller.ts
import { WorkspaceContext } from '../common/decorators/workspace-context.decorator';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  // Workspace directo
  @Get(':id')
  @UseGuards(WorkspaceGuard)
  @WorkspaceContext({ type: 'direct', paramName: 'id' })
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER, MemberRole.VIEWER)
  findOne(@Param('id') id: string) {
    return this.workspacesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(WorkspaceGuard)
  @WorkspaceContext({ type: 'direct', paramName: 'id' })
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateWorkspaceDto) {
    return this.workspacesService.update(id, dto);
  }
}

// File: apps/backend/src/projects/projects.controller.ts (ejemplo)
@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  // El workspace se deriva del project
  @Get(':id')
  @UseGuards(WorkspaceGuard)
  @WorkspaceContext({ type: 'from-project', paramName: 'id' })
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER, MemberRole.VIEWER)
  findOne(@Param('id') projectId: string) {
    return this.projectsService.findOne(projectId);
  }
}

// File: apps/backend/src/tasks/tasks.controller.ts (ejemplo)
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  // El workspace se deriva del task
  @Get(':id')
  @UseGuards(WorkspaceGuard)
  @WorkspaceContext({ type: 'from-task', paramName: 'id' })
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  findOne(@Param('id') taskId: string) {
    return this.tasksService.findOne(taskId);
  }
}

/**
 * BENEFICIOS:
 * 1. No depende de string matching de rutas (frágil)
 * 2. Configuración explícita y declarativa
 * 3. Fácil de extender para nuevos contextos
 * 4. Logging para debugging
 * 5. Manejo robusto de legacy workspaces
 * 6. Reutilizable para Projects, Tasks, etc.
 * 7. Type-safe con TypeScript
 * 8. Inyecta workspaceId en request para uso en controllers
 */
