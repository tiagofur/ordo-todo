import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Projects API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: string;
  let workspaceId: string;

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
        email: `test-projects-${Date.now()}@example.com`,
        password: 'Test123!@#',
        name: 'Test User Projects',
        username: `testuserproj${Date.now()}`,
      })
      .expect(201);

    authToken = registerResponse.body.accessToken;
    userId = registerResponse.body.user.id;

    // Create test workspace
    const workspaceResponse = await request(app.getHttpServer())
      .post('/workspaces')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Workspace for Projects',
        type: 'PERSONAL',
      });

    workspaceId = workspaceResponse.body.id;
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

  describe('POST /projects', () => {
    it('should create a new project', () => {
      return request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Project 1',
          description: 'Test Description',
          workspaceId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Test Project 1');
          expect(res.body.workspaceId).toBe(workspaceId);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/projects')
        .send({
          name: 'Test Project',
          workspaceId,
        })
        .expect(401);
    });

    it('should fail with invalid data', () => {
      return request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing required name
          workspaceId,
        })
        .expect(400);
    });
  });

  describe('GET /projects', () => {
    let projectId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Project for GET test',
          workspaceId,
        });
      projectId = response.body.id;
    });

    it('should return all projects for a workspace', () => {
      return request(app.getHttpServer())
        .get(`/projects?workspaceId=${workspaceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          res.body.forEach((project: { workspaceId: string }) => {
            expect(project.workspaceId).toBe(workspaceId);
          });
        });
    });

    it('should require workspaceId parameter', () => {
      return request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  });

  describe('GET /projects/all', () => {
    it('should return all projects for current user', () => {
      return request(app.getHttpServer())
        .get('/projects/all')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('GET /projects/:id', () => {
    let projectId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Project for GET by ID test',
          workspaceId,
        });
      projectId = response.body.id;
    });

    it('should return a specific project', () => {
      return request(app.getHttpServer())
        .get(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(projectId);
          expect(res.body.name).toBe('Project for GET by ID test');
        });
    });

    it('should return 404 for non-existent project', () => {
      return request(app.getHttpServer())
        .get('/projects/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /projects/:id', () => {
    let projectId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Project for UPDATE test',
          workspaceId,
        });
      projectId = response.body.id;
    });

    it('should update a project', () => {
      return request(app.getHttpServer())
        .put(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Project Name',
          description: 'Updated description',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Project Name');
          expect(res.body.description).toBe('Updated description');
        });
    });
  });

  describe('PATCH /projects/:id/archive', () => {
    let projectId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Project for ARCHIVE test',
          workspaceId,
        });
      projectId = response.body.id;
    });

    it('should archive a project', () => {
      return request(app.getHttpServer())
        .patch(`/projects/${projectId}/archive`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.isArchived).toBe(true);
        });
    });

    it('should unarchive a project', () => {
      return request(app.getHttpServer())
        .patch(`/projects/${projectId}/archive`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.isArchived).toBe(false);
        });
    });
  });

  describe('PATCH /projects/:id/complete', () => {
    let projectId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Project for COMPLETE test',
          workspaceId,
        });
      projectId = response.body.id;
    });

    it('should mark a project as completed', () => {
      return request(app.getHttpServer())
        .patch(`/projects/${projectId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('COMPLETED');
          expect(res.body.completedAt).toBeTruthy();
        });
    });
  });

  describe('Trash Functionality', () => {
    let projectIdForTrash: string;
    let projectIdForRestore: string;
    let projectIdForPermanentDelete: string;

    beforeAll(async () => {
      // Create projects for trash tests
      const response1 = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Project for Trash Test 1',
          workspaceId,
        });
      projectIdForTrash = response1.body.id;

      const response2 = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Project for Restore Test',
          workspaceId,
        });
      projectIdForRestore = response2.body.id;

      const response3 = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Project for Permanent Delete Test',
          workspaceId,
        });
      projectIdForPermanentDelete = response3.body.id;
    });

    describe('DELETE /projects/:id', () => {
      it('should soft delete a project', () => {
        return request(app.getHttpServer())
          .delete(`/projects/${projectIdForTrash}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(204);
      });
    });

    describe('GET /projects/deleted', () => {
      it('should return deleted projects for a workspace', async () => {
        // Get deleted projects
        return request(app.getHttpServer())
          .get(`/projects/deleted?workspaceId=${workspaceId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            const deletedProject = res.body.find(
              (project: { id: string }) => project.id === projectIdForTrash,
            );
            expect(deletedProject).toBeDefined();
          });
      });
    });

    describe('POST /projects/:id/restore', () => {
      beforeAll(async () => {
        // Delete project first
        await request(app.getHttpServer())
          .delete(`/projects/${projectIdForRestore}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(204);
      });

      it('should restore a deleted project', () => {
        return request(app.getHttpServer())
          .post(`/projects/${projectIdForRestore}/restore`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.id).toBe(projectIdForRestore);
            expect(res.body.deletedAt).toBeNull();
          });
      });
    });

    describe('DELETE /projects/:id/permanent', () => {
      beforeAll(async () => {
        // Delete project first (soft delete)
        await request(app.getHttpServer())
          .delete(`/projects/${projectIdForPermanentDelete}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(204);
      });

      it('should permanently delete a project', async () => {
        await request(app.getHttpServer())
          .delete(`/projects/${projectIdForPermanentDelete}/permanent`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(204);

        // Verify project is permanently deleted
        const project = await prisma.project.findUnique({
          where: { id: projectIdForPermanentDelete },
        });
        expect(project).toBeNull();
      });
    });
  });
});
