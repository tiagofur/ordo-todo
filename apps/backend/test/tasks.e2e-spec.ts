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
            });

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
            where: { creatorId: userId },
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

        it('should delete a task', () => {
            return request(app.getHttpServer())
                .delete(`/tasks/${taskId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(204);
        });
    });
});
