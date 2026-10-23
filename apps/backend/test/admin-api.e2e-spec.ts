import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/database/prisma.service';

/**
 * ODD 019 S4: the /admin read model and lifecycle endpoints — authorization,
 * metrics aggregation, user listing without content, gifted Pro reflected in
 * the Subscription table, and the invite-code lifecycle end to end.
 */
const ADMIN_EMAIL = `admin-${Date.now()}@example.com`;
const BOOTSTRAP_CODE = `BOOT-${Date.now()}`;

let AppModule: typeof import('../src/app.module').AppModule;

describe('Admin API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let adminToken: string;
  let adminId: string;
  let victimToken: string;
  let victimId: string;

  const createdEmails: string[] = [];
  const createdCodes: string[] = [];

  const register = (email: string, name: string, inviteCode: string) => {
    createdEmails.push(email);
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'Password123!',
        name,
        inviteCode,
        username:
          `${email.split('@')[0]}${Date.now()}${Math.floor(Math.random() * 1e4)}`
            .replace(/[^a-z0-9_-]/gi, '')
            .toLowerCase()
            .slice(0, 30),
      });
  };

  beforeAll(async () => {
    process.env.ADMIN_EMAILS = ADMIN_EMAIL;
    process.env.REGISTRATION_MODE = 'invite-only';
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ({ AppModule } = require('../src/app.module') as {
      AppModule: typeof AppModule;
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Bootstrap code: the admin itself must enter through the gate.
    createdCodes.push(BOOTSTRAP_CODE);
    await prisma.inviteCode.create({
      data: { code: BOOTSTRAP_CODE, maxUses: 2 },
    });

    const adminResponse = await register(
      ADMIN_EMAIL,
      'Admin User',
      BOOTSTRAP_CODE,
    ).expect(201);
    adminToken = adminResponse.body.accessToken;
    adminId = adminResponse.body.user.id;

    const victimResponse = await register(
      `victim-${Date.now()}@example.com`,
      'Victim User',
      BOOTSTRAP_CODE,
    ).expect(201);
    victimToken = victimResponse.body.accessToken;
    victimId = victimResponse.body.user.id;
  });

  afterAll(async () => {
    process.env.REGISTRATION_MODE = 'open';
    for (const email of createdEmails) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        await prisma.inviteRedemption.deleteMany({
          where: { userId: user.id },
        });
        await prisma.subscription.deleteMany({ where: { userId: user.id } });
        await prisma.user.delete({ where: { id: user.id } });
      }
    }
    for (const code of createdCodes) {
      await prisma.inviteCode.deleteMany({ where: { code } });
    }
    await app.close();
  });

  it('rejects non-admins on every admin surface', async () => {
    await request(app.getHttpServer())
      .get('/admin/overview')
      .set('Authorization', `Bearer ${victimToken}`)
      .expect(403);
    await request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${victimToken}`)
      .expect(403);
    await request(app.getHttpServer())
      .post('/admin/invite-codes')
      .set('Authorization', `Bearer ${victimToken}`)
      .send({ label: 'nope' })
      .expect(403);
  });

  it('aggregates platform metrics for the admin', async () => {
    const response = await request(app.getHttpServer())
      .get('/admin/overview')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.users.total).toBeGreaterThanOrEqual(2);
    expect(response.body.planDistribution).toBeDefined();
    expect(response.body.generatedAt).toBeDefined();
  });

  it('lists users with pagination and identification data only', async () => {
    const response = await request(app.getHttpServer())
      .get('/admin/users?limit=50')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.total).toBeGreaterThanOrEqual(2);
    const victim = response.body.users.find(
      (u: { id: string }) => u.id === victimId,
    );
    expect(victim).toMatchObject({ plan: 'FREE', status: 'ACTIVE' });
    expect(Object.keys(victim)).not.toContain('hashedPassword');
  });

  it('gifts and revokes Pro through the Subscription row', async () => {
    const granted = await request(app.getHttpServer())
      .post(`/admin/users/${victimId}/grant-pro`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ days: 30 })
      .expect(200);
    expect(granted.body).toMatchObject({ id: victimId, plan: 'PRO' });

    const sub = await prisma.subscription.findUnique({
      where: { userId: victimId },
    });
    expect(sub?.plan).toBe('PRO');
    expect(sub?.stripeCurrentPeriodEnd).toBeInstanceOf(Date);

    const revoked = await request(app.getHttpServer())
      .post(`/admin/users/${victimId}/revoke-pro`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(revoked.body).toMatchObject({ id: victimId, plan: 'FREE' });
  });

  it('runs the invite-code lifecycle: create → register → usage visible → deactivate', async () => {
    const created = await request(app.getHttpServer())
      .post('/admin/invite-codes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ label: 'e2e-lote', maxUses: 2 })
      .expect(201);

    const code = created.body.code as string;
    createdCodes.push(code);
    expect(code).toMatch(/^ORDO-[A-Z2-9]{4}-[A-Z2-9]{4}$/);

    // A brand-new user registers through the public gate with this code.
    const email = `invitee-${Date.now()}@example.com`;
    await register(email, 'Invitee User', code).expect(201);

    const afterRegister = await request(app.getHttpServer())
      .get('/admin/invite-codes')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    const row = afterRegister.body.find(
      (c: { code: string }) => c.code === code,
    );
    expect(row.redemptions).toBe(1);

    const deactivated = await request(app.getHttpServer())
      .patch(`/admin/invite-codes/${created.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false })
      .expect(200);
    expect(deactivated.body.isActive).toBe(false);
  });
});
