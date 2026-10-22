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
  cleanupTestData,
  generateAuthToken,
  authHeaders,
} from './helpers';

/**
 * E2E Tests for Workspace Security
 *
 * Tests the critical security fix for findBySlug() to prevent
 * unauthorized access to workspaces with duplicate slugs.
 */
describe('Workspaces Security (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  // Test data
  let user1Token: string;
  let user2Token: string;
  let user2Id: string;
  let user1Workspace: any;
  let user2Workspace: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply global validation pipe
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
    // Clean up before each test
    await cleanupTestData(prisma);

    // Create two test users
    const user1 = await createTestUser(prisma, {
      email: 'user1@example.com',
      name: 'User One',
    });
    const user2 = await createTestUser(prisma, {
      email: 'user2@example.com',
      name: 'User Two',
    });
    user2Id = user2.id;

    // Generate auth tokens
    const auth1 = await generateAuthToken(prisma, jwtService, user1.id);
    const auth2 = await generateAuthToken(prisma, jwtService, user2.id);
    user1Token = auth1.token;
    user2Token = auth2.token;

    // Create workspaces with SAME slug for both users (critical test case)
    user1Workspace = await createTestWorkspace(prisma, user1.id, {
      name: 'My Workspace',
      slug: 'my-workspace', // Same slug!
    });

    user2Workspace = await createTestWorkspace(prisma, user2.id, {
      name: 'My Workspace',
      slug: 'my-workspace', // Same slug!
    });
  });

  afterAll(async () => {
    await cleanupTestData(prisma);
    await prisma.client.$disconnect();
    await app.close();
  });

  describe('Member lifecycle (ODD 018 S3 / W5-W6)', () => {
    // user2 = ADMIN of user1's workspace; user3 = plain MEMBER
    let adminToken: string;
    let memberToken: string;
    let memberUserId: string;

    beforeEach(async () => {
      await request(app.getHttpServer())
        .post(`/workspaces/${user1Workspace.id}/members`)
        .set(authHeaders(user1Token))
        .send({ userId: user2Id, role: 'ADMIN' })
        .expect(201);

      const user3 = await createTestUser(prisma, {
        email: 'user3@example.com',
        name: 'User Three',
      });
      memberUserId = user3.id;
      await request(app.getHttpServer())
        .post(`/workspaces/${user1Workspace.id}/members`)
        .set(authHeaders(user1Token))
        .send({ userId: user3.id, role: 'MEMBER' })
        .expect(201);
      const auth3 = await generateAuthToken(prisma, jwtService, user3.id);
      memberToken = auth3.token;
      adminToken = user2Token;
    });

    it('a MEMBER cannot change roles (403)', async () => {
      await request(app.getHttpServer())
        .patch(`/workspaces/${user1Workspace.id}/members/${user2Id}/role`)
        .set(authHeaders(memberToken))
        .send({ role: 'VIEWER' })
        .expect(403);
    });

    it('an ADMIN cannot assign OWNER nor change the owner role (400)', async () => {
      await request(app.getHttpServer())
        .patch(`/workspaces/${user1Workspace.id}/members/${user2Id}/role`)
        .set(authHeaders(adminToken))
        .send({ role: 'OWNER' })
        .expect(400);

      await request(app.getHttpServer())
        .patch(`/workspaces/${user1Workspace.id}/members/${user1Workspace.ownerId}/role`)
        .set(authHeaders(adminToken))
        .send({ role: 'MEMBER' })
        .expect(400);
    });

    it('an ADMIN demotes a MEMBER to VIEWER (200)', async () => {
      await request(app.getHttpServer())
        .patch(`/workspaces/${user1Workspace.id}/members/${memberUserId}/role`)
        .set(authHeaders(adminToken))
        .send({ role: 'VIEWER' })
        .expect(200);

      const members = await request(app.getHttpServer())
        .get(`/workspaces/${user1Workspace.id}/members`)
        .set(authHeaders(user1Token))
        .expect(200);
      const member = members.body.find(
        (m: { user?: { email?: string } | null }) =>
          m.user?.email === 'user3@example.com',
      );
      expect(member.role).toBe('VIEWER');
    });

    it('the OWNER cannot leave; a MEMBER can (W6)', async () => {
      await request(app.getHttpServer())
        .post(`/workspaces/${user1Workspace.id}/leave`)
        .set(authHeaders(user1Token))
        .expect(400);

      await request(app.getHttpServer())
        .post(`/workspaces/${user1Workspace.id}/leave`)
        .set(authHeaders(memberToken))
        .expect(200);

      const members = await request(app.getHttpServer())
        .get(`/workspaces/${user1Workspace.id}/members`)
        .set(authHeaders(user1Token))
        .expect(200);
      expect(
        members.body.map(
          (m: { user?: { email?: string } | null }) => m.user?.email,
        ),
      ).not.toContain('user3@example.com');
    });

    it('a cancelled invitation token can no longer be redeemed', async () => {
      const inviteRes = await request(app.getHttpServer())
        .post(`/workspaces/${user1Workspace.id}/invitations`)
        .set(authHeaders(user1Token))
        .send({ email: 'ghost@example.com', role: 'MEMBER' })
        .expect(201);
      const token = inviteRes.body.devToken;

      const listRes = await request(app.getHttpServer())
        .get(`/workspaces/${user1Workspace.id}/invitations`)
        .set(authHeaders(user1Token))
        .expect(200);
      const invitation = listRes.body.find(
        (i: { email?: string }) => i.email === 'ghost@example.com',
      );
      expect(invitation).toBeDefined();

      await request(app.getHttpServer())
        .delete(
          `/workspaces/${user1Workspace.id}/invitations/${invitation.id}`,
        )
        .set(authHeaders(user1Token))
        .expect(200);

      await request(app.getHttpServer())
        .post('/workspaces/invitations/accept')
        .set(authHeaders(user2Token))
        .send({ token })
        .expect(404);
    });

    it('an already-accepted token cannot be replayed (T4)', async () => {
      const inviteRes = await request(app.getHttpServer())
        .post(`/workspaces/${user1Workspace.id}/invitations`)
        .set(authHeaders(user1Token))
        .send({ email: 'user3@example.com', role: 'MEMBER' })
        .expect(201);

      // user3 (already a MEMBER via the direct add) redeems it once
      await request(app.getHttpServer())
        .post('/workspaces/invitations/accept')
        .set(authHeaders(memberToken))
        .send({ token: inviteRes.body.devToken })
        .expect(200);

      // The same token is now ACCEPTED: replaying it must not re-enter
      await request(app.getHttpServer())
        .post('/workspaces/invitations/accept')
        .set(authHeaders(memberToken))
        .send({ token: inviteRes.body.devToken })
        .expect(404);
    });
  });

  describe('Invitation acceptance (ODD 018 S4 / W4)', () => {
    it('only the invited email can redeem the token', async () => {
      // user1 invites user2 with a mixed-case email (must match case-insensitively)
      const inviteRes = await request(app.getHttpServer())
        .post(`/workspaces/${user1Workspace.id}/invitations`)
        .set(authHeaders(user1Token))
        .send({ email: 'User2@Example.com', role: 'MEMBER' })
        .expect(201);
      const token = inviteRes.body.devToken;
      expect(token).toBeDefined();

      // A third, authenticated account tries to use the link
      const user3 = await createTestUser(prisma, {
        email: 'user3@example.com',
        name: 'User Three',
      });
      const auth3 = await generateAuthToken(prisma, jwtService, user3.id);

      const impostorRes = await request(app.getHttpServer())
        .post('/workspaces/invitations/accept')
        .set(authHeaders(auth3.token))
        .send({ token })
        .expect(403);
      expect(impostorRes.body.message).toContain(
        'This invitation was sent to a different email address',
      );

      // The invited account succeeds
      await request(app.getHttpServer())
        .post('/workspaces/invitations/accept')
        .set(authHeaders(user2Token))
        .send({ token })
        .expect(200);

      const members = await request(app.getHttpServer())
        .get(`/workspaces/${user1Workspace.id}/members`)
        .set(authHeaders(user1Token))
        .expect(200);
      expect(
        members.body.map(
          (m: { user?: { email?: string } | null; userId?: string }) =>
            m.user?.email ?? m.userId,
        ),
      ).toContain('user2@example.com');
    });
  });

  describe('findBySlug Security', () => {
    it('should allow user1 to access their own workspace by slug', async () => {
      const response = await request(app.getHttpServer())
        .get('/workspaces/slug/my-workspace')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(user1Workspace.id);
      expect(response.body).toHaveProperty('slug', 'my-workspace');
      expect(response.body).toHaveProperty('ownerId');
    });

    it('should allow user2 to access their own workspace by slug', async () => {
      const response = await request(app.getHttpServer())
        .get('/workspaces/slug/my-workspace')
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(user2Workspace.id);
      expect(response.body).toHaveProperty('slug', 'my-workspace');
      expect(response.body).toHaveProperty('ownerId');
    });

    it('should return different workspaces for different users with same slug', async () => {
      // User 1 fetches their workspace
      const user1Response = await request(app.getHttpServer())
        .get('/workspaces/slug/my-workspace')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      // User 2 fetches their workspace
      const user2Response = await request(app.getHttpServer())
        .get('/workspaces/slug/my-workspace')
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      // CRITICAL: They should get DIFFERENT workspaces
      expect(user1Response.body.id).not.toBe(user2Response.body.id);
      expect(user1Response.body.id).toBe(user1Workspace.id);
      expect(user2Response.body.id).toBe(user2Workspace.id);
    });

    it('should prevent unauthorized access to workspace by ID', async () => {
      // User 1 tries to access User 2's workspace by ID
      await request(app.getHttpServer())
        .get(`/workspaces/${user2Workspace.id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(403); // Forbidden
    });

    it('should prevent unauthorized access to workspace projects', async () => {
      // Create a project in user2's workspace
      const project = await createTestProject(prisma, user2Workspace.id, {
        name: 'Secret Project',
      });

      // User 1 tries to access user2's project (should fail)
      await request(app.getHttpServer())
        .get(`/projects/${project.id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(403); // Forbidden
    });

    it('should return 404 for non-existent workspace slug', async () => {
      await request(app.getHttpServer())
        .get('/workspaces/slug/non-existent-slug')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(404); // Not Found
    });

    it('should require authentication for slug lookup', async () => {
      await request(app.getHttpServer())
        .get('/workspaces/slug/my-workspace')
        .expect(401); // Unauthorized
    });
  });

  describe('Workspace Access Control', () => {
    it('should allow user to list only their workspaces', async () => {
      const response = await request(app.getHttpServer())
        .get('/workspaces')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // User 1 should only see their workspace
      const workspaceIds = response.body.map((w: any) => w.id);
      expect(workspaceIds).toContain(user1Workspace.id);
      expect(workspaceIds).not.toContain(user2Workspace.id);
    });

    it('should allow workspace owner to update their workspace', async () => {
      const updateData = {
        name: 'Updated Workspace Name',
      };

      const response = await request(app.getHttpServer())
        .patch(`/workspaces/${user1Workspace.id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
    });

    it('should prevent non-owner from updating workspace', async () => {
      const updateData = {
        name: 'Hacked Workspace Name',
      };

      await request(app.getHttpServer())
        .patch(`/workspaces/${user2Workspace.id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(updateData)
        .expect(403); // Forbidden
    });
  });
});
