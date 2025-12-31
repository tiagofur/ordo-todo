/**
 * SOLUCIÓN: Validación de slug duplicado siguiendo Clean Architecture
 */

// ============ OPCIÓN 1: Mover al repositorio ============

// File: apps/backend/src/repositories/workspace.repository.ts
export class PrismaWorkspaceRepository implements WorkspaceRepository {
  // ... código existente ...

  /**
   * Checks if a workspace with the given slug already exists for the owner
   */
  async existsByOwnerAndSlug(ownerId: string, slug: string): Promise<boolean> {
    const existing = await this.prisma.workspace.findUnique({
      where: {
        ownerId_slug: {
          ownerId,
          slug,
        },
      },
    });
    return !!existing;
  }
}

// File: packages/core/src/workspace/repositories/workspace.repository.ts
export interface WorkspaceRepository {
  // ... métodos existentes ...
  existsByOwnerAndSlug(ownerId: string, slug: string): Promise<boolean>;
}

// ============ OPCIÓN 2: Mover al Use Case ============

// File: packages/core/src/workspace/use-cases/create-workspace.use-case.ts
export class CreateWorkspaceUseCase implements UseCase<CreateWorkspaceInput, Workspace> {
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  async execute(input: CreateWorkspaceInput): Promise<Workspace> {
    // Validar slug único por owner
    if (input.ownerId) {
      const exists = await this.workspaceRepository.existsByOwnerAndSlug(
        input.ownerId,
        input.slug
      );

      if (exists) {
        throw new Error('WORKSPACE_SLUG_DUPLICATE');
      }
    }

    const workspace = new Workspace({
      ...input,
      isArchived: false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await this.workspaceRepository.create(workspace);
  }
}

// ============ USO EN EL SERVICE (LIMPIO) ============

// File: apps/backend/src/workspaces/workspaces.service.ts
async create(createWorkspaceDto: CreateWorkspaceDto, userId: string) {
  const user = await this.userRepository.findById(userId);

  const createWorkspaceUseCase = new CreateWorkspaceUseCase(
    this.workspaceRepository,
  );

  try {
    const workspace = await createWorkspaceUseCase.execute({
      ...createWorkspaceDto,
      tier: 'FREE',
      color: createWorkspaceDto.color ?? '#2563EB',
      ownerId: userId,
    });

    // Add creator as workspace member with OWNER role
    const addMemberUseCase = new AddMemberToWorkspaceUseCase(
      this.workspaceRepository,
    );
    await addMemberUseCase.execute(workspace.id as string, userId, 'OWNER');

    // Create default workflow
    const createWorkflowUseCase = new CreateWorkflowUseCase(
      this.workflowRepository,
    );
    await createWorkflowUseCase.execute({
      name: 'General',
      workspaceId: workspace.id as string,
      description: 'Default workflow for general projects',
    });

    // Log workspace creation
    await this.createAuditLog(
      workspace.id as string,
      'WORKSPACE_CREATED',
      userId,
      {
        name: workspace.props.name,
        type: workspace.props.type,
      },
    );

    return workspace.props;
  } catch (error) {
    if (error.message === 'WORKSPACE_SLUG_DUPLICATE') {
      throw new ForbiddenException(
        'Ya tienes un workspace con este slug',
      );
    }
    throw error;
  }
}
