import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Tasks API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: string;
  let workspaceId: string;
  let projectId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create test user and get auth token
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `test-${Date.now()}@example.com`,
        password: 'Test123!@#',
        name: 'Test User',
        username: `testuser${Date.now()}`,
      })
      .expect(201);

    authToken = registerResponse.body.accessToken;
    userId = registerResponse.body.user.id;

    // Create test workspace
    const workspaceResponse = await request(app.getHttpServer())
      .post('/workspaces')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Workspace',
        type: 'PERSONAL',
      });

    workspaceId = workspaceResponse.body.id;

    // Create test project
    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Project',
        workspaceId,
      });

    projectId = projectResponse.body.id;
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    await prisma.task.deleteMany({
      where: { ownerId: userId },
    });
    await prisma.project.deleteMany({
      where: { workspaceId },
    });
    await prisma.workspace.deleteMany({
      where: { id: workspaceId },
    });
    await prisma.user.deleteMany({
      where: { id: userId },
    });

    await app.close();
  });

  describe('POST /tasks', () => {
    it('should create a new task', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          description: 'Test Description',
          projectId,
          priority: 'MEDIUM',
          status: 'TODO',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('Test Task');
          expect(res.body.priority).toBe('MEDIUM');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Test Task',
          projectId,
        })
        .expect(401);
    });

    it('should fail with invalid data', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing required title
          projectId,
        })
        .expect(400);
    });
  });

  describe('GET /tasks', () => {
    let taskId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task for GET test',
          projectId,
        });
      taskId = response.body.id;
    });

    it('should return all tasks for the user', () => {
      return request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should filter tasks by projectId', () => {
      return request(app.getHttpServer())
        .get(`/tasks?projectId=${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((task: any) => {
            expect(task.projectId).toBe(projectId);
          });
        });
    });
  });

  describe('GET /tasks/:id', () => {
    let taskId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task for GET by ID test',
          projectId,
        });
      taskId = response.body.id;
    });

    it('should return a specific task', () => {
      return request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(taskId);
          expect(res.body.title).toBe('Task for GET by ID test');
        });
    });

    it('should return 404 for non-existent task', () => {
      return request(app.getHttpServer())
        .get('/tasks/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /tasks/:id', () => {
    let taskId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task for UPDATE test',
          projectId,
        });
      taskId = response.body.id;
    });

    it('should update a task', () => {
      return request(app.getHttpServer())
        .put(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Task Title',
          priority: 'HIGH',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Updated Task Title');
          expect(res.body.priority).toBe('HIGH');
        });
    });
  });

  describe('PATCH /tasks/:id/complete', () => {
    let taskId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task for COMPLETE test',
          projectId,
        });
      taskId = response.body.id;
    });

    it('should mark a task as completed', () => {
      return request(app.getHttpServer())
        .patch(`/tasks/${taskId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('COMPLETED');
        });
    });
  });

  describe('DELETE /tasks/:id', () => {
    let taskId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task for DELETE test',
          projectId,
        });
      taskId = response.body.id;
    });

    it('should soft delete a task', () => {
      return request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });

  describe('Trash Functionality', () => {
    let taskIdForTrash: string;
    let taskIdForRestore: string;
    let taskIdForPermanentDelete: string;

    beforeAll(async () => {
      // Create tasks for trash tests
      const response1 = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task for Trash Test 1',
          projectId,
        });
      taskIdForTrash = response1.body.id;

      const response2 = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task for Restore Test',
          projectId,
        });
      taskIdForRestore = response2.body.id;

      const response3 = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task for Permanent Delete Test',
          projectId,
        });
      taskIdForPermanentDelete = response3.body.id;
    });

    describe('GET /tasks/deleted', () => {
      it('should return deleted tasks for a project', async () => {
        // First delete a task
        await request(app.getHttpServer())
          .delete(`/tasks/${taskIdForTrash}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(204);

        // Then get deleted tasks
        return request(app.getHttpServer())
          .get(`/tasks/deleted?projectId=${projectId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            const deletedTask = res.body.find(
              (task: { id: string }) => task.id === taskIdForTrash,
            );
            expect(deletedTask).toBeDefined();
          });
      });
    });

    describe('POST /tasks/:id/restore', () => {
      beforeAll(async () => {
        // Delete task first
        await request(app.getHttpServer())
          .delete(`/tasks/${taskIdForRestore}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(204);
      });

      it('should restore a deleted task', () => {
        return request(app.getHttpServer())
          .post(`/tasks/${taskIdForRestore}/restore`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.id).toBe(taskIdForRestore);
            expect(res.body.deletedAt).toBeNull();
          });
      });
    });

    describe('DELETE /tasks/:id/permanent', () => {
      beforeAll(async () => {
        // Delete task first (soft delete)
        await request(app.getHttpServer())
          .delete(`/tasks/${taskIdForPermanentDelete}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(204);
      });

      it('should permanently delete a task', async () => {
        await request(app.getHttpServer())
          .delete(`/tasks/${taskIdForPermanentDelete}/permanent`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(204);

        // Verify task is permanently deleted
        const task = await prisma.task.findUnique({
          where: { id: taskIdForPermanentDelete },
        });
        expect(task).toBeNull();
      });
    });
  });
});
