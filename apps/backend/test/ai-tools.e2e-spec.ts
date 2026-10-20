import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
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
 * E2E Tests for POST /ai/tools/propose + /ai/tools/execute (ODD 004 S3).
 *
 * Real AppModule, NO mocked LLM (tools never touch the LLM).
 *
 * NOTE on T2b indexing hooks: task writes trigger EmbeddingIndexerService,
 * whose Gemini embed call fails without a GEMINI_API_KEY and is swallowed
 * by the never-breaks-write guard (warn only). If a key IS present, tasks
 * get indexed for real — harmless to every assertion below (audits are
 * counted on authAuditLog, not on embeddings).
 */
describe('AI Tools (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let userToken: string;
  let user: any;
  let workspace: any;
  let project: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

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
    await cleanupTestData(prisma);
    await prisma.aiEmbedding.deleteMany().catch(() => {});

    user = await createTestUser(prisma, {
      email: 'tools-user@example.com',
      name: 'Tools User',
    });
    const auth = await generateAuthToken(prisma, jwtService, user.id);
    userToken = auth.token;

    workspace = await createTestWorkspace(prisma, user.id);
    project = await createTestProject(prisma, workspace.id);
  });

  afterAll(async () => {
    await cleanupTestData(prisma);
    await prisma.aiEmbedding.deleteMany().catch(() => {});
    await app.close();
  });

  function propose(body: unknown, token: string = userToken) {
    return request(app.getHttpServer())
      .post('/ai/tools/propose')
      .set('Authorization', `Bearer ${token}`)
      .send(body);
  }

  function execute(body: unknown, token: string = userToken) {
    return request(app.getHttpServer())
      .post('/ai/tools/execute')
      .set('Authorization', `Bearer ${token}`)
      .send(body);
  }

  it('propose: 1 step (create_task) needs no confirmation', async () => {
    const res = await propose({
      calls: [
        {
          tool: 'create_task',
          args: { title: 'Buy milk', projectId: project.id },
        },
      ],
    }).expect(200);

    expect(res.body.plan.planId).toBeDefined();
    expect(res.body.plan.steps).toHaveLength(1);
    expect(res.body.plan.steps[0].description).toContain('Buy milk');
    expect(res.body.plan.requiresConfirmation).toBe(false);
    expect(res.body.plan.reason).toBeDefined();
  });

  it('propose: 4 steps require confirmation with a reason naming the limit', async () => {
    const task = await createTestTask(prisma, project.id, user.id, {
      title: 'repeat me',
    });
    const calls = [1, 2, 3, 4].map(() => ({
      tool: 'complete_task',
      args: { taskId: task.id },
    }));

    const res = await propose({ calls }).expect(200);

    expect(res.body.plan.requiresConfirmation).toBe(true);
    expect(res.body.plan.reason).toMatch(/4.*3|límite/);
  });

  it('propose: update_task to CANCELLED requires confirmation', async () => {
    const task = await createTestTask(prisma, project.id, user.id);

    const res = await propose({
      calls: [
        {
          tool: 'update_task',
          args: { taskId: task.id, status: 'CANCELLED' },
        },
      ],
    }).expect(200);

    expect(res.body.plan.requiresConfirmation).toBe(true);
  });

  it('execute: unconfirmed plan requiring confirmation 403s and mutates nothing (S3 contract)', async () => {
    const before = await prisma.task.count();

    const proposed = await propose({
      calls: [
        {
          tool: 'create_task',
          args: { title: 'must not exist', projectId: project.id },
        },
      ],
    }).expect(200);
    expect(proposed.body.plan.requiresConfirmation).toBe(false);

    // Force the server-side policy to require confirmation by sending 4
    // calls: the server re-derives requiresConfirmation (never trusts us).
    const fourCalls = [1, 2, 3, 4].map((i) => ({
      tool: 'create_task',
      args: { title: `must not exist ${i}`, projectId: project.id },
    }));
    await execute({
      planId: proposed.body.plan.planId,
      calls: fourCalls,
      confirmed: false,
    }).expect(403);

    expect(await prisma.task.count()).toBe(before);
    expect(
      await prisma.task.findFirst({
        where: { title: { startsWith: 'must not exist' } },
      }),
    ).toBeNull();
  });

  it('propose->execute confirmed: "reprograma mis vencidas" updates both + audits x2', async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const t1 = await createTestTask(prisma, project.id, user.id, {
      title: 'vencida uno',
    });
    const t2 = await createTestTask(prisma, project.id, user.id, {
      title: 'vencida dos',
    });
    await prisma.task.updateMany({
      where: { id: { in: [t1.id, t2.id] } },
      data: { dueDate: yesterday },
    });

    const calls = [t1.id, t2.id].map((taskId) => ({
      tool: 'update_task',
      args: { taskId, dueDate: tomorrow.toISOString() },
    }));
    const proposed = await propose({ calls }).expect(200);
    expect(proposed.body.plan.requiresConfirmation).toBe(false);

    const done = await execute({
      planId: proposed.body.plan.planId,
      calls,
      confirmed: true,
    }).expect(200);
    expect(done.body.result.executed).toHaveLength(2);
    expect(done.body.result.executed.every((s: any) => s.ok)).toBe(true);

    const after = await prisma.task.findMany({
      where: { id: { in: [t1.id, t2.id] } },
      select: { dueDate: true },
    });
    for (const row of after) {
      expect(row.dueDate?.toISOString()).toBe(tomorrow.toISOString());
    }

    const audits = await prisma.authAuditLog.findMany({
      where: { type: 'AGENT_TOOL_CALL' },
    });
    expect(audits).toHaveLength(2);
    expect(audits[0].userId).toBe(user.id);
    expect(audits[0].metadata).toMatchObject({ tool: 'update_task' });
  });

  it('schedule_block: executes and persists time-blocking fields', async () => {
    const task = await createTestTask(prisma, project.id, user.id, {
      title: 'bloqueable',
    });
    const calls = [
      {
        tool: 'schedule_block',
        args: {
          taskId: task.id,
          date: '2026-10-21',
          startTime: '09:00',
          endTime: '10:30',
        },
      },
    ];
    const proposed = await propose({ calls }).expect(200);

    await execute({
      planId: proposed.body.plan.planId,
      calls,
      confirmed: false,
    }).expect(200);

    const row = await prisma.task.findUnique({ where: { id: task.id } });
    expect(row?.isTimeBlocked).toBe(true);
    expect(row?.scheduledTime).toBe('09:00');
    expect(row?.scheduledEndTime).toBe('10:30');
    expect(row?.scheduledDate?.toISOString().slice(0, 10)).toBe('2026-10-21');
  });

  it('authz: user B proposing update_task on user A task gets 403', async () => {
    const task = await createTestTask(prisma, project.id, user.id, {
      title: 'ajena',
    });
    const userB = await createTestUser(prisma, {
      email: 'tools-outsider@example.com',
      name: 'Tools Outsider',
    });
    const authB = await generateAuthToken(prisma, jwtService, userB.id);
    await createTestWorkspace(prisma, userB.id);

    await propose(
      {
        calls: [{ tool: 'update_task', args: { taskId: task.id, title: 'x' } }],
      },
      authB.token,
    ).expect(403);
  });

  it('authz: VIEWER member cannot mutate via tools (JD-01)', async () => {
    const viewer = await createTestUser(prisma, {
      email: 'tools-viewer@example.com',
      name: 'Tools Viewer',
    });
    const authV = await generateAuthToken(prisma, jwtService, viewer.id);
    await prisma.workspaceMember.create({
      data: { workspaceId: workspace.id, userId: viewer.id, role: 'VIEWER' },
    });

    await propose(
      {
        calls: [
          {
            tool: 'create_task',
            args: { title: 'viewer task', projectId: project.id },
          },
        ],
      },
      authV.token,
    ).expect(403);

    await propose(
      {
        calls: [
          {
            tool: 'create_project',
            args: { name: 'viewer project', workspaceId: workspace.id },
          },
        ],
      },
      authV.token,
    ).expect(403);
  });

  it('authz: MEMBER non-owner gets 403 on complete_task at propose (JD-05)', async () => {
    const task = await createTestTask(prisma, project.id, user.id, {
      title: 'completable',
    });
    const member = await createTestUser(prisma, {
      email: 'tools-member@example.com',
      name: 'Tools Member',
    });
    const authM = await generateAuthToken(prisma, jwtService, member.id);
    await prisma.workspaceMember.create({
      data: { workspaceId: workspace.id, userId: member.id, role: 'MEMBER' },
    });

    await propose(
      { calls: [{ tool: 'complete_task', args: { taskId: task.id } }] },
      authM.token,
    ).expect(403);
  });

  it('rejects malformed payloads (DTO boundary)', async () => {
    await propose({ calls: [] }).expect(400);
    await propose({
      calls: [{ tool: 'drop_database', args: {} }],
    }).expect(400);
    await execute({
      planId: 'x',
      calls: [{ tool: 'complete_task', args: {} }],
      confirmed: 'yes',
    }).expect(400);
  });

  it('requires authentication', async () => {
    await request(app.getHttpServer())
      .post('/ai/tools/propose')
      .send({ calls: [] })
      .expect(401);
    await request(app.getHttpServer())
      .post('/ai/tools/execute')
      .send({ planId: 'x', calls: [], confirmed: true })
      .expect(401);
  });
});
