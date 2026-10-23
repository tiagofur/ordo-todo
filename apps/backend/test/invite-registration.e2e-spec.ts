import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/database/prisma.service';

/**
 * ODD 019 S2: while REGISTRATION_MODE=invite-only no account can be created
 * without consuming a valid InviteCode.
 *
 * The env var must be set BEFORE the AppModule graph is evaluated: the
 * backend's ConfigModule validates the env at bootstrap and serves that
 * snapshot afterwards. jest-e2e.setup.ts defaults the rest of the suites to
 * 'open'; this file imports AppModule dynamically after flipping the flag
 * (maxWorkers 1, so the restored value never bleeds into another file).
 */
let AppModule: typeof import('../src/app.module').AppModule;

describe('Invite-only registration (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const createdEmails: string[] = [];
  const createdCodes: string[] = [];
  const unique = (prefix: string) =>
    `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

  const createInvite = async (
    overrides: { maxUses?: number; expiresAt?: Date; isActive?: boolean } = {},
  ) => {
    const code = unique('TESTCODE');
    createdCodes.push(code);
    return prisma.inviteCode.create({
      data: {
        code,
        maxUses: overrides.maxUses ?? 1,
        expiresAt: overrides.expiresAt ?? null,
        isActive: overrides.isActive ?? true,
      },
    });
  };

  const registerAttempt = (email: string, inviteCode?: string) =>
    request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'Password123!',
        name: 'Invited User',
        username: email.split('@')[0].slice(0, 30),
        ...(inviteCode ? { inviteCode } : {}),
      });

  beforeAll(async () => {
    process.env.REGISTRATION_MODE = 'invite-only';
    // CJS require (jest without ESM): evaluates the AppModule graph AFTER the
    // env flag above, unlike a hoisted static import.
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
  });

  afterAll(async () => {
    process.env.REGISTRATION_MODE = 'open';

    for (const email of createdEmails) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        await prisma.inviteRedemption.deleteMany({
          where: { userId: user.id },
        });
        await prisma.user.delete({ where: { id: user.id } });
      }
    }
    for (const code of createdCodes) {
      await prisma.inviteCode.deleteMany({ where: { code } });
    }
    await app.close();
  });

  it('exposes the registration mode publicly', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/registration-mode')
      .expect(200);

    expect(response.body).toEqual({ mode: 'invite-only' });
  });

  it('rejects a registration without a code (INVITE_INVALID)', async () => {
    const email = `${unique('nocode')}@example.com`;
    createdEmails.push(email);

    const response = await registerAttempt(email).expect(400);

    expect(response.body.code).toBe('INVITE_INVALID');
    await expect(
      prisma.user.findUnique({ where: { email } }),
    ).resolves.toBeNull();
  });

  it('rejects an unknown code (INVITE_INVALID)', async () => {
    const email = `${unique('unknown')}@example.com`;
    createdEmails.push(email);

    const response = await registerAttempt(email, 'ORDO-ZZZZ-ZZZZ').expect(400);

    expect(response.body.code).toBe('INVITE_INVALID');
  });

  it('rejects an expired code (INVITE_EXPIRED, 410)', async () => {
    const invite = await createInvite({
      expiresAt: new Date(Date.now() - 1000),
    });
    const email = `${unique('expired')}@example.com`;
    createdEmails.push(email);

    const response = await registerAttempt(email, invite.code).expect(410);

    expect(response.body.code).toBe('INVITE_EXPIRED');
    const stored = await prisma.inviteCode.findUnique({
      where: { id: invite.id },
    });
    expect(stored?.usedCount).toBe(0);
  });

  it('registers the user with a valid code and consumes exactly one use', async () => {
    const invite = await createInvite({ maxUses: 2 });
    const email = `${unique('happy')}@example.com`;
    createdEmails.push(email);

    const response = await registerAttempt(email, invite.code).expect(201);
    expect(response.body.accessToken).toBeTruthy();

    const user = await prisma.user.findUnique({ where: { email } });
    expect(user).toBeTruthy();

    const stored = await prisma.inviteCode.findUnique({
      where: { id: invite.id },
    });
    expect(stored?.usedCount).toBe(1);

    const redemption = await prisma.inviteRedemption.findUnique({
      where: { userId: user!.id },
    });
    expect(redemption?.inviteCodeId).toBe(invite.id);
  });

  it('exhausted codes reject the next registration (INVITE_EXHAUSTED)', async () => {
    const invite = await createInvite({ maxUses: 1 });
    const first = `${unique('first')}@example.com`;
    const second = `${unique('second')}@example.com`;
    createdEmails.push(first, second);

    await registerAttempt(first, invite.code).expect(201);

    const response = await registerAttempt(second, invite.code).expect(400);
    expect(response.body.code).toBe('INVITE_EXHAUSTED');

    const stored = await prisma.inviteCode.findUnique({
      where: { id: invite.id },
    });
    expect(stored?.usedCount).toBe(1);
    await expect(
      prisma.user.findUnique({ where: { email: second } }),
    ).resolves.toBeNull();
  });

  it('deactivated codes reject registrations (INVITE_INACTIVE)', async () => {
    const invite = await createInvite({ isActive: false });
    const email = `${unique('inactive')}@example.com`;
    createdEmails.push(email);

    const response = await registerAttempt(email, invite.code).expect(400);

    expect(response.body.code).toBe('INVITE_INACTIVE');
  });

  it('the same user can never redeem twice (unique redemption)', async () => {
    const invite = await createInvite({ maxUses: 5 });
    const email = `${unique('once')}@example.com`;
    createdEmails.push(email);

    await registerAttempt(email, invite.code).expect(201);

    const user = await prisma.user.findUnique({ where: { email } });
    expect(user).toBeTruthy();
    const redemptions = await prisma.inviteRedemption.findMany({
      where: { userId: user!.id },
    });
    expect(redemptions).toHaveLength(1);
  });
});
