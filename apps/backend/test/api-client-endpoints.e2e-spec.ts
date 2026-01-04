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
 * E2E Tests for New API Client Endpoints
 *
 * Tests the newly added endpoints:
 * - OAuth endpoints (Google/GitHub)
 * - Task Dependencies
 * - File Upload (attachments)
 */
describe('API Client Endpoints (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  // Test data
  let userToken: string;
  let user: any;
  let workspace: any;
  let project: any;
  let task1: any;
  let task2: any;
  let task3: any;

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
    workspace = await createTestWorkspace(prisma, user.id);
    project = await createTestProject(prisma, workspace.id);

    // Create test tasks
    task1 = await createTestTask(prisma, project.id, user.id, {
      title: 'Task 1',
    });
    task2 = await createTestTask(prisma, project.id, user.id, {
      title: 'Task 2',
    });
    task3 = await createTestTask(prisma, project.id, user.id, {
      title: 'Task 3',
    });
  });

  afterAll(async () => {
    await cleanupTestData(prisma);
    await prisma.$disconnect();
    await app.close();
  });

  describe('OAuth Endpoints', () => {
    describe('Google OAuth', () => {
      it('should return Google OAuth authorization URL', async () => {
        const response = await request(app.getHttpServer())
          .get('/auth/google')
          .expect(200);

        expect(response.body).toHaveProperty('authUrl');
        expect(typeof response.body.authUrl).toBe('string');
        expect(response.body.authUrl).toContain('https://accounts.google.com');
      });

      it('should handle Google OAuth callback with code', async () => {
        // This test verifies the endpoint exists and accepts the code parameter
        // Actual OAuth flow would require valid code from Google
        const response = await request(app.getHttpServer())
          .get('/auth/google/callback')
          .query({ code: 'test_code_12345' })
          .expect((res) => {
            // May return 401 or 400 with invalid code, but should not return 404
            expect([400, 401]).toContain(res.status);
          });

        // Endpoint should exist (not 404)
        expect(response.status).not.toBe(404);
      });
    });

    describe('GitHub OAuth', () => {
      it('should return GitHub OAuth authorization URL', async () => {
        const response = await request(app.getHttpServer())
          .get('/auth/github')
          .expect(200);

        expect(response.body).toHaveProperty('authUrl');
        expect(typeof response.body.authUrl).toBe('string');
        expect(response.body.authUrl).toContain('https://github.com');
      });

      it('should handle GitHub OAuth callback with code', async () => {
        // This test verifies the endpoint exists and accepts the code parameter
        const response = await request(app.getHttpServer())
          .get('/auth/github/callback')
          .query({ code: 'test_code_67890' })
          .expect((res) => {
            // May return 401 or 400 with invalid code, but should not return 404
            expect([400, 401]).toContain(res.status);
          });

        // Endpoint should exist (not 404)
        expect(response.status).not.toBe(404);
      });
    });
  });

  describe('Task Dependencies Endpoints', () => {
    describe('GET /tasks/:id/dependencies', () => {
      it('should get task dependencies', async () => {
        // Create dependencies: task1 depends on task2 and task3
        await prisma.taskDependency.create({
          data: {
            taskId: task1.id,
            blockingTaskId: task2.id,
          },
        });

        await prisma.taskDependency.create({
          data: {
            taskId: task1.id,
            blockingTaskId: task3.id,
          },
        });

        const response = await request(app.getHttpServer())
          .get(`/tasks/${task1.id}/dependencies`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(2);

        const dependencyIds = response.body.map((t: any) => t.id);
        expect(dependencyIds).toContain(task2.id);
        expect(dependencyIds).toContain(task3.id);
      });

      it('should return empty array for task with no dependencies', async () => {
        const response = await request(app.getHttpServer())
          .get(`/tasks/${task1.id}/dependencies`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
      });

      it('should require authentication', async () => {
        await request(app.getHttpServer())
          .get(`/tasks/${task1.id}/dependencies`)
          .expect(401);
      });
    });

    describe('POST /tasks/:id/dependencies', () => {
      it('should add a dependency to a task', async () => {
        const response = await request(app.getHttpServer())
          .post(`/tasks/${task1.id}/dependencies`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ blockingTaskId: task2.id })
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('blockingTaskId', task2.id);

        // Verify dependency was created
        const dependency = await prisma.taskDependency.findUnique({
          where: {
            taskId_blockingTaskId: {
              taskId: task1.id,
              blockingTaskId: task2.id,
            },
          },
        });

        expect(dependency).not.toBeNull();
      });

      it('should prevent duplicate dependencies', async () => {
        // Create dependency first time
        await request(app.getHttpServer())
          .post(`/tasks/${task1.id}/dependencies`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ blockingTaskId: task2.id })
          .expect(201);

        // Try to create same dependency again
        await request(app.getHttpServer())
          .post(`/tasks/${task1.id}/dependencies`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ blockingTaskId: task2.id })
          .expect((res) => {
            // Should return conflict or bad request
            expect([409, 400]).toContain(res.status);
          });
      });

      it('should prevent self-dependency', async () => {
        await request(app.getHttpServer())
          .post(`/tasks/${task1.id}/dependencies`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ blockingTaskId: task1.id }) // Can't depend on yourself
          .expect((res) => {
            // Should return bad request
            expect(res.status).toBe(400);
          });
      });

      it('should require authentication', async () => {
        await request(app.getHttpServer())
          .post(`/tasks/${task1.id}/dependencies`)
          .send({ blockingTaskId: task2.id })
          .expect(401);
      });
    });

    describe('DELETE /tasks/:id/dependencies/:blockingTaskId', () => {
      beforeEach(async () => {
        // Create a dependency for testing deletion
        await prisma.taskDependency.create({
          data: {
            taskId: task1.id,
            blockingTaskId: task2.id,
          },
        });
      });

      it('should remove a dependency from a task', async () => {
        await request(app.getHttpServer())
          .delete(`/tasks/${task1.id}/dependencies/${task2.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(204); // No content

        // Verify dependency was deleted
        const dependency = await prisma.taskDependency.findUnique({
          where: {
            taskId_blockingTaskId: {
              taskId: task1.id,
              blockingTaskId: task2.id,
            },
          },
        });

        expect(dependency).toBeNull();
      });

      it('should return 404 for non-existent dependency', async () => {
        await request(app.getHttpServer())
          .delete(`/tasks/${task1.id}/dependencies/${task3.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(404);
      });

      it('should require authentication', async () => {
        await request(app.getHttpServer())
          .delete(`/tasks/${task1.id}/dependencies/${task2.id}`)
          .expect(401);
      });
    });

    describe('Dependency Chain Validation', () => {
      it('should prevent circular dependencies', async () => {
        // task1 depends on task2
        await prisma.taskDependency.create({
          data: {
            taskId: task1.id,
            blockingTaskId: task2.id,
          },
        });

        // Try to make task2 depend on task1 (would create circular dependency)
        await request(app.getHttpServer())
          .post(`/tasks/${task2.id}/dependencies`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ blockingTaskId: task1.id })
          .expect((res) => {
            // Should return bad request or conflict
            expect([400, 409]).toContain(res.status);
          });
      });
    });
  });

  describe('File Upload Endpoint', () => {
    describe('POST /attachments/upload', () => {
      it('should accept file upload with multipart/form-data', async () => {
        // Create a mock file buffer
        const fileBuffer = Buffer.from('test file content');

        const response = await request(app.getHttpServer())
          .post('/attachments/upload')
          .set('Authorization', `Bearer ${userToken}`)
          .field('taskId', task1.id)
          .attach('file', fileBuffer, 'test.txt')
          .expect((res) => {
            // May return 201 or 200
            expect([200, 201]).toContain(res.status);
          });

        // Verify response structure
        if (response.status === 201 || response.status === 200) {
          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('fileName');
        }
      });

      it('should accept file upload without task', async () => {
        const fileBuffer = Buffer.from('standalone file content');

        await request(app.getHttpServer())
          .post('/attachments/upload')
          .set('Authorization', `Bearer ${userToken}`)
          .attach('file', fileBuffer, 'standalone.txt')
          .expect((res) => {
            // Endpoint should exist and accept file
            expect([200, 201, 400]).toContain(res.status);
          });
      });

      it('should require authentication', async () => {
        const fileBuffer = Buffer.from('unauthorized file');

        await request(app.getHttpServer())
          .post('/attachments/upload')
          .attach('file', fileBuffer, 'unauthorized.txt')
          .expect(401);
      });

      it('should require file in request', async () => {
        await request(app.getHttpServer())
          .post('/attachments/upload')
          .set('Authorization', `Bearer ${userToken}`)
          .field('taskId', task1.id)
          // No file attached
          .expect((res) => {
            // Should return bad request
            expect(res.status).toBe(400);
          });
      });
    });
  });

  describe('Endpoint Availability', () => {
    it('should have all OAuth endpoints registered', async () => {
      // Test that the routes are registered
      const response = await request(app.getHttpServer())
        .get('/auth/google')
        .expect(200);

      expect(response.body).toHaveProperty('authUrl');
    });

    it('should have all task dependency endpoints registered', async () => {
      // GET /tasks/:id/dependencies
      await request(app.getHttpServer())
        .get(`/tasks/${task1.id}/dependencies`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // POST /tasks/:id/dependencies
      await request(app.getHttpServer())
        .post(`/tasks/${task1.id}/dependencies`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ blockingTaskId: task2.id })
        .expect((res) => {
          expect([201, 409, 400]).toContain(res.status);
        });
    });

    it('should have file upload endpoint registered', async () => {
      const fileBuffer = Buffer.from('test');

      await request(app.getHttpServer())
        .post('/attachments/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', fileBuffer, 'test.txt')
        .expect((res) => {
          // Endpoint should exist (not 404)
          expect(res.status).not.toBe(404);
        });
    });
  });
});
