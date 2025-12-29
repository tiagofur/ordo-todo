import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Collaboration API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // User A (Creator)
  let userAToken: string;
  let userAId: string;

  // User B (Assignee/Collaborator)
  let userBToken: string;
  let userBId: string;

  let workspaceId: string;
  let projectId: string;
  let taskId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create User A
    const registerResponseA = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `usera-${Date.now()}@example.com`,
        password: 'Password123!',
        name: 'User A',
        username: `usera${Date.now()}`,
      })
      .expect(201);
    userAToken = registerResponseA.body.accessToken;
    userAId = registerResponseA.body.user.id;

    // Create User B
    const registerResponseB = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `userb-${Date.now()}@example.com`,
        password: 'Password123!',
        name: 'UserB',
        username: `userb${Date.now()}`,
      })
      .expect(201);
    userBToken = registerResponseB.body.accessToken;
    userBId = registerResponseB.body.user.id;

    // User A creates workspace
    const workspaceResponse = await request(app.getHttpServer())
      .post('/workspaces')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        name: 'Collab Workspace',
        type: 'TEAM',
      });
    workspaceId = workspaceResponse.body.id;

    // User A adds User B to workspace
    await request(app.getHttpServer())
      .post(`/workspaces/${workspaceId}/members`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        email: registerResponseB.body.user.email,
        role: 'MEMBER',
      });

    // User A creates project
    const projectResponse = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        name: 'Collab Project',
        workspaceId,
      });
    projectId = projectResponse.body.id;

    // User A creates task assigned to User B
    const taskResponse = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        title: 'Collab Task',
        projectId,
        assigneeId: userBId,
      });
    taskId = taskResponse.body.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.comment.deleteMany({ where: { taskId } });
    await prisma.notification.deleteMany({
      where: { OR: [{ userId: userAId }, { userId: userBId }] },
    });
    await prisma.task.deleteMany({ where: { id: taskId } });
    await prisma.project.deleteMany({ where: { id: projectId } });
    await prisma.workspaceMember.deleteMany({ where: { workspaceId } });
    await prisma.workspace.deleteMany({ where: { id: workspaceId } });
    // Filter out undefined user IDs before deletion
    const userIdsToDelete = [userAId, userBId].filter((id): id is string => !!id);
    if (userIdsToDelete.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: userIdsToDelete } } });
    }

    await app.close();
  });

  describe('Comments Flow', () => {
    let commentId: string;

    it('User B should be able to comment on the task', async () => {
      const response = await request(app.getHttpServer())
        .post('/comments')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          content: 'Hello from User B',
          taskId,
        })
        .expect(201);

      expect(response.body.content).toBe('Hello from User B');
      expect(response.body.author.id).toBe(userBId);
      commentId = response.body.id;
    });

    it("User A should receive a notification about User B's comment", async () => {
      // Wait a bit for async notification creation if necessary, though usually it's awaited in the service
      const response = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      const notifications = response.body;
      expect(Array.isArray(notifications)).toBe(true);
      const commentNotification = notifications.find(
        (n) =>
          n.type === 'COMMENT_ADDED' &&
          n.resourceId === taskId &&
          n.message.includes('User B commented'),
      );
      expect(commentNotification).toBeDefined();
      expect(commentNotification.isRead).toBe(false);
    });

    it('User A should be able to reply (comment)', async () => {
      await request(app.getHttpServer())
        .post('/comments')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          content: 'Thanks User B',
          taskId,
        })
        .expect(201);
    });

    it("User B should receive a notification about User A's comment", async () => {
      const response = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${userBToken}`)
        .expect(200);

      const notifications = response.body;
      const commentNotification = notifications.find(
        (n) =>
          n.type === 'COMMENT_ADDED' &&
          n.resourceId === taskId &&
          n.message.includes('User A commented'),
      );
      expect(commentNotification).toBeDefined();
    });

    it('User A should be able to mention User B', async () => {
      await request(app.getHttpServer())
        .post('/comments')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          content: 'Hey @UserB, check this out', // Note: Mentions logic uses name matching, user name is "User B"
          taskId,
        })
        .expect(201);
    });

    // Note: The mention logic in CommentsService uses `name: { contains: name, mode: 'insensitive' }`.
    // If I send "@UserB", it looks for users with name containing "UserB".
    // My user name is "User B". "UserB" might not match "User B" depending on how strict the regex/search is.
    // The regex is /@(\w+)/g. \w matches [a-zA-Z0-9_]. So "@User B" would match "User".
    // Let's adjust the test user name or the mention to match.
    // If I change User B's name to "UserB" it would be safer for this test.
  });

  describe('Notifications Flow', () => {
    it('User A should be able to mark all notifications as read', async () => {
      await request(app.getHttpServer())
        .post('/notifications/mark-all-read')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/notifications/unread-count')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      expect(response.body.count).toBe(0);
    });
  });
});
