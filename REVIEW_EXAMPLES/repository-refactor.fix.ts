/**
 * SOLUCIÓN: Mover queries Prisma al repositorio
 */

// ============ AGREGAR AL REPOSITORIO ============

// File: packages/core/src/workspace/repositories/workspace.repository.ts
export interface WorkspaceRepository {
  // ... métodos existentes ...

  /**
   * Finds workspace by owner username and slug
   */
  findByOwnerUsernameAndSlug(
    username: string,
    slug: string
  ): Promise<Workspace | null>;
}

// File: apps/backend/src/repositories/workspace.repository.ts
export class PrismaWorkspaceRepository implements WorkspaceRepository {
  // ... código existente ...

  /**
   * Finds workspace by owner username and slug with full stats
   */
  async findByOwnerUsernameAndSlug(
    username: string,
    slug: string,
  ): Promise<Workspace | null> {
    // Fetch user by username
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return null;
    }

    // Fetch workspace by ownerId and slug
    const workspace = await this.prisma.workspace.findUnique({
      where: {
        ownerId_slug: {
          ownerId: user.id,
          slug,
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
          },
        },
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

    // Calculate task count
    const taskCount = workspace.projects.reduce(
      (acc, p) => acc + p._count.tasks,
      0,
    );

    const domainWorkspace = this.toDomain(workspace);

    // Attach stats and owner info
    return domainWorkspace.setStats({
      projectCount: workspace._count.projects,
      memberCount: workspace._count.members,
      taskCount: taskCount,
    }).setOwner({
      id: workspace.owner.id,
      username: workspace.owner.username,
      name: workspace.owner.name,
      email: workspace.owner.email,
    });
  }
}

// ============ SIMPLIFICAR SERVICE ============

// File: apps/backend/src/workspaces/workspaces.service.ts
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
 * 1. Service layer más limpio y testeable
 * 2. Respeta Clean Architecture (Service no conoce Prisma)
 * 3. Repositorio encapsula toda lógica de acceso a datos
 * 4. Más fácil de mockear en tests unitarios
 * 5. Permite cambiar ORM sin afectar Service
 */
