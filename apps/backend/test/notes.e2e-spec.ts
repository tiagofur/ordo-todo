import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Notes API (e2e)', () => {
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
        email: `test-notes-${Date.now()}@example.com`,
        password: 'Test123!@#',
        name: 'Test Notes User',
        username: `testnotes${Date.now()}`,
      })
      .expect(201);

    authToken = registerResponse.body.accessToken;
    userId = registerResponse.body.user.id;

    // Create test workspace
    const workspaceResponse = await request(app.getHttpServer())
      .post('/workspaces')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Workspace for Notes',
        type: 'PERSONAL',
      });

    workspaceId = workspaceResponse.body.id;
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    await prisma.note.deleteMany({
      where: { authorId: userId },
    });
    await prisma.workspaceMember.deleteMany({
      where: { userId },
    });
    await prisma.workspace.deleteMany({
      where: { id: workspaceId },
    });
    await prisma.user.deleteMany({
      where: { id: userId },
    });

    await app.close();
  });

  afterEach(async () => {
    // Clean up notes after each test
    await prisma.note.deleteMany({
      where: { authorId: userId },
    });
  });

  describe('POST /notes', () => {
    it('should create a new note with minimum fields', () => {
      return request(app.getHttpServer())
        .post('/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Test note content',
          workspaceId: workspaceId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.content).toBe('Test note content');
          expect(res.body.authorId).toBe(userId);
          expect(res.body.workspaceId).toBe(workspaceId);
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    it('should create a new note with all fields', () => {
      return request(app.getHttpServer())
        .post('/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Complete note',
          workspaceId: workspaceId,
          x: 200,
          y: 300,
          width: 400,
          height: 500,
          color: '#ffeb3b',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.content).toBe('Complete note');
          expect(res.body.x).toBe(200);
          expect(res.body.y).toBe(300);
          expect(res.body.width).toBe(400);
          expect(res.body.height).toBe(500);
          expect(res.body.color).toBe('#ffeb3b');
        });
    });

    it('should throw error without content', () => {
      return request(app.getHttpServer())
        .post('/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          workspaceId: workspaceId,
        })
        .expect(400);
    });

    it('should throw error without workspaceId', () => {
      return request(app.getHttpServer())
        .post('/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Test note',
        })
        .expect(400);
    });

    it('should throw error with invalid color', () => {
      return request(app.getHttpServer())
        .post('/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Test note',
          workspaceId: workspaceId,
          color: 'invalid-color',
        })
        .expect(400);
    });

    it('should throw 401 without auth', () => {
      return request(app.getHttpServer())
        .post('/notes')
        .send({
          content: 'Test note',
          workspaceId: workspaceId,
        })
        .expect(401);
    });
  });

  describe('GET /notes', () => {
    it('should return all notes for workspace', async () => {
      // Create test notes
      await prisma.note.createMany({
        data: [
          {
            content: 'Note 1',
            workspaceId: workspaceId,
            authorId: userId,
          },
          {
            content: 'Note 2',
            workspaceId: workspaceId,
            authorId: userId,
          },
        ],
      });

      return request(app.getHttpServer())
        .get('/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ workspaceId: workspaceId })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(2);
          expect(res.body[0].content).toBe('Note 2'); // Ordered by createdAt desc
          expect(res.body[1].content).toBe('Note 1');
        });
    });

    it('should return empty array if no notes', () => {
      return request(app.getHttpServer())
        .get('/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ workspaceId: workspaceId })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual([]);
        });
    });

    it('should throw 401 without auth', () => {
      return request(app.getHttpServer())
        .get('/notes')
        .query({ workspaceId: workspaceId })
        .expect(401);
    });
  });

  describe('GET /notes/:id', () => {
    it('should return a single note', async () => {
      const note = await prisma.note.create({
        data: {
          content: 'Test note for get',
          workspaceId: workspaceId,
          authorId: userId,
        },
      });

      return request(app.getHttpServer())
        .get(`/notes/${note.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(note.id);
          expect(res.body.content).toBe('Test note for get');
        });
    });

    it('should throw 404 if note not found', () => {
      return request(app.getHttpServer())
        .get('/notes/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should throw 401 without auth', () => {
      return request(app.getHttpServer()).get('/notes/some-id').expect(401);
    });
  });

  describe('PATCH /notes/:id', () => {
    it('should update note content', async () => {
      const note = await prisma.note.create({
        data: {
          content: 'Original content',
          workspaceId: workspaceId,
          authorId: userId,
        },
      });

      return request(app.getHttpServer())
        .patch(`/notes/${note.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Updated content',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.content).toBe('Updated content');
        });
    });

    it('should update only specified fields', async () => {
      const note = await prisma.note.create({
        data: {
          content: 'Original',
          workspaceId: workspaceId,
          authorId: userId,
          color: '#feff9c',
        },
      });

      return request(app.getHttpServer())
        .patch(`/notes/${note.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Updated content only',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.content).toBe('Updated content only');
          expect(res.body.color).toBe('#feff9c'); // Unchanged
        });
    });

    it('should update multiple fields', async () => {
      const note = await prisma.note.create({
        data: {
          content: 'Original',
          workspaceId: workspaceId,
          authorId: userId,
          x: 100,
          y: 100,
        },
      });

      return request(app.getHttpServer())
        .patch(`/notes/${note.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Updated',
          x: 200,
          y: 300,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.content).toBe('Updated');
          expect(res.body.x).toBe(200);
          expect(res.body.y).toBe(300);
        });
    });

    it('should throw 404 if note not found', () => {
      return request(app.getHttpServer())
        .patch('/notes/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Updated',
        })
        .expect(404);
    });
  });

  describe('DELETE /notes/:id', () => {
    it('should delete note', async () => {
      const note = await prisma.note.create({
        data: {
          content: 'To be deleted',
          workspaceId: workspaceId,
          authorId: userId,
        },
      });

      return request(app.getHttpServer())
        .delete(`/notes/${note.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(async (res) => {
          expect(res.body.id).toBe(note.id);

          // Verify it's actually deleted
          const deletedNote = await prisma.note.findUnique({
            where: { id: note.id },
          });
          expect(deletedNote).toBeNull();
        });
    });

    it('should throw 404 if note not found', () => {
      return request(app.getHttpServer())
        .delete('/notes/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
