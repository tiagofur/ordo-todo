/**
 * SOLUCIÓN: Refactorizar findBySlug para usar composite key
 */

// ============ ACTUALIZAR INTERFAZ ============

// File: packages/core/src/workspace/repositories/workspace.repository.ts
export interface WorkspaceRepository {
  create(workspace: Workspace): Promise<Workspace>;
  findById(id: string): Promise<Workspace | null>;

  /**
   * @deprecated Use findByOwnerAndSlug instead for namespaced workspaces
   */
  findBySlug(slug: string): Promise<Workspace | null>;

  /**
   * Finds workspace by owner ID and slug (recommended)
   */
  findByOwnerAndSlug(ownerId: string, slug: string): Promise<Workspace | null>;

  /**
   * Finds workspace by owner username and slug
   */
  findByOwnerUsernameAndSlug(username: string, slug: string): Promise<Workspace | null>;

  findByOwnerId(ownerId: string): Promise<Workspace[]>;
  findByUserId(userId: string): Promise<Workspace[]>;
  update(workspace: Workspace): Promise<Workspace>;
  delete(id: string): Promise<void>;

  // Member management
  addMember(member: WorkspaceMember): Promise<WorkspaceMember>;
  removeMember(workspaceId: string, userId: string): Promise<void>;
  findMember(workspaceId: string, userId: string): Promise<WorkspaceMember | null>;
  listMembers(workspaceId: string): Promise<WorkspaceMember[]>;
}

// ============ IMPLEMENTACIÓN EN PRISMA ============

// File: apps/backend/src/repositories/workspace.repository.ts
@Injectable()
export class PrismaWorkspaceRepository implements WorkspaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ... métodos existentes ...

  /**
   * @deprecated Use findByOwnerAndSlug instead
   * Finds first workspace with matching slug (ambiguous with namespaces)
   */
  async findBySlug(slug: string): Promise<Workspace | null> {
    // Log deprecation warning
    console.warn(
      '[DEPRECATED] findBySlug is ambiguous. Use findByOwnerAndSlug instead.'
    );

    const workspace = await this.prisma.workspace.findFirst({
      where: {
        slug,
        isDeleted: false,
      },
      include: {
        _count: {
          select: {
            projects: true,
            members: true,
          },
        },
        projects: {
          select: {
            _count: {
              select: { tasks: true },
            },
          },
        },
      },
    });

    if (!workspace) return null;

    const domainWorkspace = this.toDomain(workspace);
    const taskCount = workspace.projects.reduce(
      (acc, p) => acc + p._count.tasks,
      0,
    );

    return domainWorkspace.setStats({
      projectCount: workspace._count.projects,
      memberCount: workspace._count.members,
      taskCount: taskCount,
    });
  }

  /**
   * Finds workspace by owner ID and slug using unique constraint
   */
  async findByOwnerAndSlug(
    ownerId: string,
    slug: string,
  ): Promise<Workspace | null> {
    const workspace = await this.prisma.workspace.findUnique({
      where: {
        ownerId_slug: {
          ownerId,
          slug,
        },
      },
      include: {
        _count: {
          select: {
            projects: true,
            members: true,
          },
        },
        projects: {
          select: {
            _count: {
              select: { tasks: true },
            },
          },
        },
      },
    });

    if (!workspace || workspace.isDeleted) {
      return null;
    }

    const domainWorkspace = this.toDomain(workspace);
    const taskCount = workspace.projects.reduce(
      (acc, p) => acc + p._count.tasks,
      0,
    );

    return domainWorkspace.setStats({
      projectCount: workspace._count.projects,
      memberCount: workspace._count.members,
      taskCount: taskCount,
    });
  }

  /**
   * Finds workspace by owner username and slug
   */
  async findByOwnerUsernameAndSlug(
    username: string,
    slug: string,
  ): Promise<Workspace | null> {
    // First, find the user by username
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      return null;
    }

    // Then use findByOwnerAndSlug
    return this.findByOwnerAndSlug(user.id, slug);
  }
}

// ============ ACTUALIZAR SERVICE ============

// File: apps/backend/src/workspaces/workspaces.service.ts
async findBySlug(slug: string) {
  // Este método debería deprecarse eventualmente
  const workspace = await this.workspaceRepository.findBySlug(slug);
  if (!workspace || workspace.props.isDeleted) {
    throw new NotFoundException('Workspace not found');
  }
  return workspace.props;
}

async findByUserAndSlug(username: string, slug: string) {
  const workspace = await this.workspaceRepository.findByOwnerUsernameAndSlug(
    username,
    slug,
  );

  if (!workspace) {
    throw new NotFoundException('Workspace not found');
  }

  return workspace.props;
}

/**
 * BENEFICIOS:
 * 1. Usa unique constraint correctamente
 * 2. Elimina ambigüedad de findBySlug
 * 3. Deprecation warning para migración gradual
 * 4. API más clara y predecible
 * 5. Mejor soporte para namespaces
 */
