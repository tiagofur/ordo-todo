import { PrismaService } from '@ordo-todo/db';

/**
 * Creates a test user in the database
 *
 * @param prisma - PrismaService instance
 * @param overrides - Optional properties to override
 * @returns The created user
 */
export async function createTestUser(
  prisma: PrismaService,
  overrides: Partial<{
    id: string;
    email: string;
    name: string;
  }> = {},
) {
  const id = overrides.id || `user-${Math.random().toString(36).substring(7)}`;
  const email = overrides.email || `test-${id}@example.com`;
  const name = overrides.name || 'Test User';

  return prisma.user.create({
    data: {
      id,
      email,
      name,
      emailVerified: new Date(),
      image: null,
    },
  });
}

/**
 * Creates multiple test users
 *
 * @param prisma - PrismaService instance
 * @param count - Number of users to create
 * @returns Array of created users
 */
export async function createTestUsers(prisma: PrismaService, count: number) {
  const users = [];
  for (let i = 0; i < count; i++) {
    const user = await createTestUser(prisma, {
      name: `Test User ${i + 1}`,
    });
    users.push(user);
  }
  return users;
}

/**
 * Creates a test workspace
 *
 * @param prisma - PrismaService instance
 * @param userId - ID of the workspace owner
 * @param overrides - Optional properties to override
 * @returns The created workspace
 */
export async function createTestWorkspace(
  prisma: PrismaService,
  userId: string,
  overrides: Partial<{
    id: string;
    name: string;
    description: string;
    type: 'PERSONAL' | 'WORK' | 'TEAM';
  }> = {},
) {
  const id =
    overrides.id || `workspace-${Math.random().toString(36).substring(7)}`;
  const name = overrides.name || 'Test Workspace';
  const description = overrides.description || 'Test workspace description';
  const type = overrides.type || 'PERSONAL';

  const workspace = await prisma.workspace.create({
    data: {
      id,
      name,
      description,
      type,
      ownerId: userId,
    },
  });

  // Create owner membership
  await prisma.workspaceMember.create({
    data: {
      workspaceId: workspace.id,
      userId,
      role: 'OWNER',
    },
  });

  return workspace;
}

/**
 * Creates a test project
 *
 * @param prisma - PrismaService instance
 * @param workspaceId - ID of the workspace
 * @param overrides - Optional properties to override
 * @returns The created project
 */
export async function createTestProject(
  prisma: PrismaService,
  workspaceId: string,
  overrides: Partial<{
    id: string;
    name: string;
    description: string;
    status: 'ACTIVE' | 'ARCHIVED';
  }> = {},
) {
  const id =
    overrides.id || `project-${Math.random().toString(36).substring(7)}`;
  const name = overrides.name || 'Test Project';
  const description = overrides.description || 'Test project description';
  const status = overrides.status || 'ACTIVE';

  return prisma.project.create({
    data: {
      id,
      name,
      description,
      status,
      workspaceId,
    },
  });
}

/**
 * Creates a test task
 *
 * @param prisma - PrismaService instance
 * @param projectId - ID of the project
 * @param userId - ID of the task owner
 * @param overrides - Optional properties to override
 * @returns The created task
 */
export async function createTestTask(
  prisma: PrismaService,
  projectId: string,
  userId: string,
  overrides: Partial<{
    id: string;
    title: string;
    description: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  }> = {},
) {
  const id = overrides.id || `task-${Math.random().toString(36).substring(7)}`;
  const title = overrides.title || 'Test Task';
  const description = overrides.description || 'Test task description';
  const status = overrides.status || 'TODO';
  const priority = overrides.priority || 'MEDIUM';

  return prisma.task.create({
    data: {
      id,
      title,
      description,
      status,
      priority,
      projectId,
      ownerId: userId,
      order: 0,
    },
  });
}

/**
 * Creates multiple test tasks
 *
 * @param prisma - PrismaService instance
 * @param projectId - ID of the project
 * @param userId - ID of the task owner
 * @param count - Number of tasks to create
 * @returns Array of created tasks
 */
export async function createTestTasks(
  prisma: PrismaService,
  projectId: string,
  userId: string,
  count: number,
) {
  const tasks = [];
  for (let i = 0; i < count; i++) {
    const task = await createTestTask(prisma, projectId, userId, {
      title: `Test Task ${i + 1}`,
    });
    tasks.push(task);
  }
  return tasks;
}

/**
 * Cleans up all test data
 *
 * @param prisma - PrismaService instance
 */
export async function cleanupTestData(prisma: PrismaService) {
  // Delete in reverse order of dependencies
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();
}
