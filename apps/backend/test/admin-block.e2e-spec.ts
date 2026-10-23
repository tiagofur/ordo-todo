import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/database/prisma.service';

/**
 * ODD 019 S3: an admin blocks a user, the victim's live session dies on the
 * next request, login is rejected while blocked, and unblocking restores
 * access. ADMIN_EMAILS is pointed at a throwaway identity before the app
 * graph loads (the ConfigService snapshot is taken at bootstrap).
 */
const ADMIN_EMAIL = `admin-${Date.now()}@example.com`;

let AppModule: typeof import('../src/app.module').AppModule;

describe('Admin user blocking (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const createdEmails: string[] = [];

  const register = (email: string, name: string) => {
    createdEmails.push(email);
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'Password123!',
        name,
        username: `${email.split('@')[0]}${Date.now()}`.slice(0, 30),
      });
  };

  beforeAll(async () => {
    process.env.ADMIN_EMAILS = ADMIN_EMAIL;
    // CJS require after the env override: the ConfigService snapshot must see
    // this admin identity (jest without ESM; same trick as invite-registration).
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
    for (const email of createdEmails) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        await prisma.inviteRedemption.deleteMany({
          where: { userId: user.id },
        });
        await prisma.user.delete({ where: { id: user.id } });
      }
    }
    await app.close();
  });

  it('runs the full block → session death → unblock cycle', async () => {
    const adminResponse = await register(ADMIN_EMAIL, 'Admin User').expect(201);
    const adminToken = adminResponse.body.accessToken as string;
    const adminId = adminResponse.body.user.id as string;

    const victimResponse = await register(
      `victim-${Date.now()}@example.com`,
      'Victim User',
    ).expect(201);
    const victimToken = victimResponse.body.accessToken as string;
    const victimId = victimResponse.body.user.id as string;

    // Non-admins cannot use the admin surface.
    await request(app.getHttpServer())
      .post(`/admin/users/${adminId}/block`)
      .set('Authorization', `Bearer ${victimToken}`)
      .expect(403);

    // The admin cannot block themselves.
    const selfBlock = await request(app.getHttpServer())
      .post(`/admin/users/${adminId}/block`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(400);
    expect(selfBlock.body.code).toBe('ADMIN_SELF_BLOCK');

    // Victim session is alive before the block.
    await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${victimToken}`)
      .expect(200);

    // Block.
    const blocked = await request(app.getHttpServer())
      .post(`/admin/users/${victimId}/block`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(blocked.body).toEqual({ id: victimId, status: 'BLOCKED' });

    // The already-issued token dies on the very next request (A3).
    await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${victimToken}`)
      .expect(401);

    // And login is rejected with the machine-readable code.
    const rejected = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: victimResponse.body.user.email,
        password: 'Password123!',
      })
      .expect(401);
    expect(rejected.body.code).toBe('ACCOUNT_BLOCKED');

    // Unblock restores access.
    const unblocked = await request(app.getHttpServer())
      .post(`/admin/users/${victimId}/unblock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(unblocked.body).toEqual({ id: victimId, status: 'ACTIVE' });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: victimResponse.body.user.email,
        password: 'Password123!',
      })
      .expect(200);

    // Audit trail rows exist for both actions.
    const audits = await prisma.authAuditLog.findMany({
      where: {
        userId: victimId,
        type: { in: ['ADMIN_USER_BLOCKED', 'ADMIN_USER_UNBLOCKED'] },
      },
    });
    expect(audits).toHaveLength(2);
    expect(
      audits.every(
        (a) =>
          (a.metadata as { adminEmail?: string })?.adminEmail === ADMIN_EMAIL,
      ),
    ).toBe(true);
  });
});
