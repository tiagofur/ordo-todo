import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

/**
 * HTTP-level contract of the consent decision endpoint. The web consent
 * screen submits a top-level `<form method="POST">`, so this pins what
 * unit specs (which inject an already-parsed body) cannot: that a real
 * `application/x-www-form-urlencoded` request reaches the handler with
 * its fields parsed, and that the Origin gate runs before anything else.
 *
 * PrismaService is replaced with an in-memory fake: this spec must not
 * depend on a database. Origins are derived from the effective
 * FRONTEND_URL at request time so the spec stays deploy-config agnostic
 * (the www/apex tolerance is covered by unit specs).
 */
describe('OAuth consent decision (e2e)', () => {
  let app: INestApplication<App>;
  let findClient: jest.Mock;
  let frontendOrigin: string;

  beforeAll(async () => {
    findClient = jest.fn().mockResolvedValue(null);
    // Permissive fake: AppModule's init hooks touch other Prisma
    // delegates (webhook processing, session cleanup…); they get benign
    // async no-ops while the OAuth client lookup stays observable.
    const delegate = () => ({
      findUnique: async () => null,
      findFirst: async () => null,
      findMany: async () => [],
      count: async () => 0,
      create: async () => ({}),
      update: async () => ({}),
      upsert: async () => ({}),
      delete: async () => ({}),
      deleteMany: async () => ({ count: 0 }),
      updateMany: async () => ({ count: 0 }),
      aggregate: async () => ({}),
    });
    const prismaFake = new Proxy(
      { oAuthClient: { findUnique: findClient } },
      {
        get: (target: Record<string, unknown>, prop: string | symbol) => {
          if (prop in target) return target[prop as string];
          if (
            prop === '$connect' ||
            prop === '$disconnect' ||
            prop === '$transaction'
          ) {
            return async () => undefined;
          }
          return delegate();
        },
      },
    );
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaFake)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    frontendOrigin = new URL(
      process.env.FRONTEND_URL ?? 'http://localhost:3100',
    ).origin;
  });

  afterAll(async () => {
    await app.close();
  });

  const form = () =>
    new URLSearchParams({
      client_id: 'ordo_cl_formtest',
      redirect_uri: 'https://chatgpt.com/aip/x/oauth/callback',
      scope: 'read',
      state: 'st1',
      code_challenge: 'c'.repeat(43),
      code_challenge_method: 'S256',
      decision: 'approve',
    }).toString();

  it('parses the urlencoded decision and lands unknown clients on the consent error screen', async () => {
    const res = await request(app.getHttpServer())
      .post('/oauth/authorize')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Origin', frontendOrigin)
      .send(form())
      .expect(302);

    const loc = new URL(res.headers.location);
    expect(loc.origin + loc.pathname).toBe(
      `${frontendOrigin}/connect/authorize`,
    );
    expect(loc.searchParams.get('ordo_error')).toBe('invalid_request');
    // The urlencoded body reached the service layer with its fields
    // parsed (an unparsed body would look up clientId "" instead).
    expect(findClient).toHaveBeenCalledWith({
      where: { clientId: 'ordo_cl_formtest' },
    });
  });

  it('rejects a decision posted from a foreign origin before any lookup', async () => {
    findClient.mockClear();
    await request(app.getHttpServer())
      .post('/oauth/authorize')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Origin', 'https://evil.test')
      .send(form())
      .expect(403);
    expect(findClient).not.toHaveBeenCalled();
  });

  it('accepts the decision from the action query with no decision field in the body (wire format of the consent screen)', async () => {
    const formWithoutDecision = new URLSearchParams(form());
    formWithoutDecision.delete('decision');

    const res = await request(app.getHttpServer())
      .post('/oauth/authorize?decision=approve')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Origin', frontendOrigin)
      .send(formWithoutDecision.toString())
      .expect(302);

    // Same unknown-client landing as the body-decision case: the query
    // decision was accepted past the decision gate (no ordo_error about
    // the decision), validation still rejects the unknown client.
    const loc = new URL(res.headers.location);
    expect(loc.searchParams.get('ordo_error')).toBe('invalid_request');
    expect(findClient).toHaveBeenCalledWith({
      where: { clientId: 'ordo_cl_formtest' },
    });
  });
});
