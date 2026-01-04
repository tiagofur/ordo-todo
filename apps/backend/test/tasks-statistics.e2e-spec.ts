import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '@ordo-todo/db';
import { JwtService } from '@nestjs/jwt';
import {
  createTestUser,
  createTestWorkspace,
  createTestProject,
  createTestTask,
  cleanupTestData,
  generateAuthToken,
} from './helpers';

/**
 * E2E Tests for Task Statistics via Analytics Endpoint
 *
 * Tests the groupByStatus() fix through the /analytics/task-status-distribution
 * endpoint to verify it includes both owned AND assigned tasks.
 */
describe('Tasks Statistics (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  // Test data
  let userToken: string;
  let user: any;
  let workspace: any;
  let project: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);
  });

  beforeEach(async () => {
    // Clean up before each test
    await cleanupTestData(prisma);

    // Create test user
    user = await createTestUser(prisma, {
      email: 'testuser@example.com',
      name: 'Test User',
    });

    // Generate auth token
    const auth = await generateAuthToken(prisma, jwtService, user.id);
    userToken = auth.token;

    // Create workspace and project
    workspace = await createTestWorkspace(prisma, user.id, {
      name: 'Test Workspace',
    });
    project = await createTestProject(prisma, workspace.id, {
      name: 'Test Project',
    });
  });

  afterAll(async () => {
    await cleanupTestData(prisma);
    await prisma.$disconnect();
    await app.close();
  });

  describe('GET /analytics/task-status-distribution', () => {
    it('should return task status distribution for owned tasks', async () => {
      // Create tasks owned by user (no assignee)
      await createTestTask(prisma, project.id, user.id, {
        title: 'Owned Task 1',
        status: 'TODO',
      });
      await createTestTask(prisma, project.id, user.id, {
        title: 'Owned Task 2',
        status: 'IN_PROGRESS',
      });
      await createTestTask(prisma, project.id, user.id, {
        title: 'Owned Task 3',
        status: 'DONE',
      });

      const response = await request(app.getHttpServer())
        .get('/analytics/task-status-distribution')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Response is an array of { status, count } objects
      expect(Array.isArray(response.body)).toBe(true);

      const statusMap = new Map(
        response.body.map((item: any) => [item.status, item.count]),
      );

      // Verify counts
      expect(statusMap.get('TODO')).toBe(1);
      expect(statusMap.get('IN_PROGRESS')).toBe(1);
      expect(statusMap.get('DONE')).toBe(1);
    });

    it('should include tasks assigned to user', async () => {
      // Create another user
      const otherUser = await createTestUser(prisma, {
        email: 'otheruser@example.com',
        name: 'Other User',
      });

      // Create tasks owned by other user but assigned to test user
      await prisma.task.create({
        data: {
          id: `task-${Math.random().toString(36).substring(7)}`,
          title: 'Assigned Task 1',
          status: 'TODO',
          projectId: project.id,
          ownerId: otherUser.id,
          assigneeId: user.id, // Assigned to test user
          order: 0,
        },
      });

      await prisma.task.create({
        data: {
          id: `task-${Math.random().toString(36).substring(7)}`,
          title: 'Assigned Task 2',
          status: 'IN_PROGRESS',
          projectId: project.id,
          ownerId: otherUser.id,
          assigneeId: user.id, // Assigned to test user
          order: 0,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/analytics/task-status-distribution')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      const statusMap = new Map(
        response.body.map((item: any) => [item.status, item.count]),
      );

      // Should count assigned tasks
      expect(statusMap.get('TODO')).toBe(1);
      expect(statusMap.get('IN_PROGRESS')).toBe(1);
    });

    it('should combine owned and assigned tasks correctly', async () => {
      // Create another user
      const otherUser = await createTestUser(prisma, {
        email: 'otheruser@example.com',
        name: 'Other User',
      });

      // Create tasks owned by user
      await createTestTask(prisma, project.id, user.id, {
        title: 'Owned TODO',
        status: 'TODO',
      });
      await createTestTask(prisma, project.id, user.id, {
        title: 'Owned IN_PROGRESS',
        status: 'IN_PROGRESS',
      });

      // Create tasks assigned to user
      await prisma.task.create({
        data: {
          id: `task-${Math.random().toString(36).substring(7)}`,
          title: 'Assigned TODO',
          status: 'TODO',
          projectId: project.id,
          ownerId: otherUser.id,
          assigneeId: user.id,
          order: 0,
        },
      });

      await prisma.task.create({
        data: {
          id: `task-${Math.random().toString(36).substring(7)}`,
          title: 'Assigned DONE',
          status: 'DONE',
          projectId: project.id,
          ownerId: otherUser.id,
          assigneeId: user.id,
          order: 0,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/analytics/task-status-distribution')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      const statusMap = new Map(
        response.body.map((item: any) => [item.status, item.count]),
      );

      // CRITICAL: Should COMBINE owned and assigned tasks
      // TODO: 1 owned + 1 assigned = 2 total
      expect(statusMap.get('TODO')).toBe(2);
      // IN_PROGRESS: 1 owned + 0 assigned = 1 total
      expect(statusMap.get('IN_PROGRESS')).toBe(1);
      // DONE: 0 owned + 1 assigned = 1 total
      expect(statusMap.get('DONE')).toBe(1);
    });

    it('should exclude soft-deleted tasks', async () => {
      // Create a task and then soft-delete it
      const task = await createTestTask(prisma, project.id, user.id, {
        title: 'To Be Deleted',
        status: 'TODO',
      });

      await prisma.task.update({
        where: { id: task.id },
        data: { isDeleted: true, deletedAt: new Date() },
      });

      const response = await request(app.getHttpServer())
        .get('/analytics/task-status-distribution')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      const statusMap = new Map(
        response.body.map((item: any) => [item.status, item.count]),
      );
      expect(statusMap.get('TODO')).toBeUndefined(); // Should not count deleted task
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/analytics/task-status-distribution')
        .expect(401); // Unauthorized
    });
  });
});
