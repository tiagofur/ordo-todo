import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { createTestUser, cleanupTestData, generateAuthToken } from './helpers';

/**
 * E2E Tests for /agent-jobs (ODD 004 S5).
 *
 * Report-backed runs are deterministic without an LLM key: GeminiAIService
 * returns getMockReport when unconfigured. Free-chat prompts are covered in
 * unit specs with a stubbed AIService.
 */
describe('Agent Jobs (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let registry: SchedulerRegistry;

  let userToken: string;
  let user: any;

  async function cleanJobs() {
    await prisma.agentJob.deleteMany().catch(() => {});
    await prisma.notification.deleteMany().catch(() => {});
    await prisma.productivityReport.deleteMany().catch(() => {});
    for (const name of registry.getCronJobs().keys()) {
      if (name.startsWith('agent-job:')) {
        try {
          registry.getCronJob(name).stop();
        } catch {
          /* already stopped */
        }
        registry.deleteCronJob(name);
      }
    }
  }

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
    registry = app.get<SchedulerRegistry>(SchedulerRegistry);
  });

  beforeEach(async () => {
    await cleanupTestData(prisma);
    await cleanJobs();
    user = await createTestUser(prisma, {
      email: 'jobs-user@example.com',
      name: 'Jobs User',
    });
    const auth = await generateAuthToken(prisma, jwtService, user.id);
    userToken = auth.token;
  });

  afterAll(async () => {
    await cleanupTestData(prisma);
    await cleanJobs();
    await app.close();
  });

  it('creates a job from NL schedule and registers its cron', async () => {
    const res = await request(app.getHttpServer())
      .post('/agent-jobs')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Resumen semanal',
        scheduleText: 'cada viernes a las 5',
        taskPrompt: 'prepárame el resumen semanal',
      })
      .expect(201);

    expect(res.body.schedule).toBe('0 17 * * 5');
    expect(res.body.isActive).toBe(true);
    expect(res.body.nextRunAt).toBeDefined();
    expect(registry.doesExist('cron', `agent-job:${res.body.id}`)).toBe(true);
  });

  it('rejects an unintelligible schedule with examples', async () => {
    const res = await request(app.getHttpServer())
      .post('/agent-jobs')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Vago',
        scheduleText: 'maybe someday',
        taskPrompt: 'do things',
      })
      .expect(400);
    expect(res.body.message).toContain('Ejemplos');
  });

  it('JD-02: rejects an invalid timezone with 400 and persists nothing', async () => {
    const before = await prisma.agentJob.count();
    await request(app.getHttpServer())
      .post('/agent-jobs')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Bad zone',
        scheduleText: 'cada día a las 8',
        taskPrompt: 'dame el resumen diario',
        timezone: 'Mars/Olympus',
      })
      .expect(400);
    expect(await prisma.agentJob.count()).toBe(before);
  });

  it('lists, gets, pauses, resumes and deletes', async () => {
    const created = await request(app.getHttpServer())
      .post('/agent-jobs')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Daily',
        scheduleText: 'cada día a las 8',
        taskPrompt: 'dame el resumen diario',
      })
      .expect(201);

    const list = await request(app.getHttpServer())
      .get('/agent-jobs')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(list.body).toHaveLength(1);

    await request(app.getHttpServer())
      .get(`/agent-jobs/${created.body.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/agent-jobs/${created.body.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ isActive: false })
      .expect(200);
    expect(registry.doesExist('cron', `agent-job:${created.body.id}`)).toBe(
      false,
    );

    await request(app.getHttpServer())
      .patch(`/agent-jobs/${created.body.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ isActive: true })
      .expect(200);
    expect(registry.doesExist('cron', `agent-job:${created.body.id}`)).toBe(
      true,
    );

    await request(app.getHttpServer())
      .delete(`/agent-jobs/${created.body.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(204);
    expect(registry.doesExist('cron', `agent-job:${created.body.id}`)).toBe(
      false,
    );
  });

  it('hides foreign jobs with 404', async () => {
    const other = await createTestUser(prisma, {
      email: 'jobs-other@example.com',
      name: 'Jobs Other',
    });
    const otherAuth = await generateAuthToken(prisma, jwtService, other.id);
    const created = await request(app.getHttpServer())
      .post('/agent-jobs')
      .set('Authorization', `Bearer ${otherAuth.token}`)
      .send({
        name: 'Ajeno',
        scheduleText: 'cada día a las 8',
        taskPrompt: 'dame el resumen diario',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/agent-jobs/${created.body.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(404);
  });

  it('runNow executes, notifies and records status', async () => {
    const created = await request(app.getHttpServer())
      .post('/agent-jobs')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Resumen semanal',
        scheduleText: 'cada viernes a las 5',
        taskPrompt: 'prepárame el resumen semanal',
      })
      .expect(201);

    const run = await request(app.getHttpServer())
      .post(`/agent-jobs/${created.body.id}/run`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(run.body.ok).toBe(true);

    const job = await prisma.agentJob.findUnique({
      where: { id: created.body.id },
    });
    expect(job?.lastRunAt).toBeDefined();
    expect(job?.lastStatus).toBe('ok');

    const notification = await prisma.notification.findFirst({
      where: { userId: user.id },
    });
    expect(notification).toBeDefined();
    expect(notification?.title).toContain('Resumen semanal');

    const report = await prisma.productivityReport.findFirst({
      where: { userId: user.id },
    });
    expect(report?.scope).toBe('WEEKLY_SCHEDULED');
  });

  it('requires authentication', async () => {
    await request(app.getHttpServer()).get('/agent-jobs').expect(401);
  });
});
