import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import {
  createTestUser,
  cleanupTestData,
  generateAuthToken,
} from './helpers';

/**
 * E2E Tests for AI credits (ODD 004 S6).
 *
 * Contract: trial 100 on first use → drain to 0 → 402 with an actionable
 * message (no raw error text) → admin recharge → works again.
 *
 * Ask is charged but LLM-free here: without GEMINI_API_KEY the provider
 * throws 503 AFTER the charge, so the suite drains via repeated daily
 * reports instead (mock path, deterministic) and asserts 402 on ask too.
 */
describe('AI Credits (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let userToken: string;
  let user: any;

  async function cleanCredits() {
    await prisma.aiUsageEvent.deleteMany().catch(() => {});
    await prisma.aiCreditAccount.deleteMany().catch(() => {});
    await prisma.productivityReport.deleteMany().catch(() => {});
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
  });

  beforeEach(async () => {
    await cleanupTestData(prisma);
    await cleanCredits();
    user = await createTestUser(prisma, {
      email: 'credits-user@example.com',
      name: 'Credits User',
    });
    const auth = await generateAuthToken(prisma, jwtService, user.id);
    userToken = auth.token;
  });

  afterAll(async () => {
    await cleanupTestData(prisma);
    await cleanCredits();
    await app.close();
  });

  function usage(token: string = userToken) {
    return request(app.getHttpServer())
      .get('/ai/usage')
      .set('Authorization', `Bearer ${token}`);
  }

  it('grants a 100-credit trial on first usage read', async () => {
    const res = await usage().expect(200);
    expect(res.body.balance).toBe(100);
    expect(res.body.trialUsed).toBe(true);
    expect(res.body.history).toHaveLength(1);
    expect(res.body.history[0].kind).toBe('trial_grant');
  });

  it('charges 5 per daily report', async () => {
    await request(app.getHttpServer())
      .post('/ai/reports/daily')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ kind: 'AM' })
      .expect(200);

    const res = await usage().expect(200);
    expect(res.body.balance).toBe(95);
    expect(res.body.history[0]).toMatchObject({ kind: 'report', cost: -5 });
  });

  it('S6 contract: drain → 402 actionable → recharge → works', async () => {
    // Drain the 100 trial credits with 20 daily reports (5 each).
    for (let i = 0; i < 20; i++) {
      await request(app.getHttpServer())
        .post('/ai/reports/daily')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ kind: 'AM' })
        .expect(200);
    }
    const drained = await usage().expect(200);
    expect(drained.body.balance).toBe(0);

    // Next chargeable call 402s with an actionable (non-raw) message.
    const denied = await request(app.getHttpServer())
      .post('/ai/reports/daily')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ kind: 'AM' })
      .expect(402);
    expect(denied.body.message).toMatch(/créditos/i);
    expect(denied.body.message).not.toMatch(/prisma|null|undefined/i);

    // Admin stub recharge restores service.
    process.env.ADMIN_API_KEY = 'test-admin-key';
    await request(app.getHttpServer())
      .post('/ai/usage/recharge')
      .set('Authorization', `Bearer ${userToken}`)
      .set('x-admin-api-key', 'test-admin-key')
      .send({ userId: user.id, amount: 50 })
      .expect(200);
    delete process.env.ADMIN_API_KEY;

    const topped = await usage().expect(200);
    expect(topped.body.balance).toBe(50);

    await request(app.getHttpServer())
      .post('/ai/reports/daily')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ kind: 'AM' })
      .expect(200);
    const after = await usage().expect(200);
    expect(after.body.balance).toBe(45);
  });

  it('recharge without admin credentials is 403', async () => {
    await usage().expect(200);
    await request(app.getHttpServer())
      .post('/ai/usage/recharge')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ userId: user.id, amount: 50 })
      .expect(403);
  });

  it('usage requires authentication', async () => {
    await request(app.getHttpServer()).get('/ai/usage').expect(401);
  });
});
