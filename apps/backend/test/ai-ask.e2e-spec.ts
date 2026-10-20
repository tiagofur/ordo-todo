import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LLM_PROVIDER } from '../src/ai/llm/llm-provider.interface';
import { MockLlmProvider } from '../src/ai/llm/mock-llm-provider';
import { EmbeddingIndexerService } from '../src/ai/retrieval/embedding-indexer.service';
import {
  createTestUser,
  createTestWorkspace,
  createTestProject,
  createTestTask,
  cleanupTestData,
  generateAuthToken,
} from './helpers';

/**
 * E2E Tests for POST /ai/ask (ODD 004 S2)
 *
 * Uses MockLlmProvider (no real LLM). The leak test is the S2 contract:
 * a user must never receive citations for content they cannot see, even
 * when the vector search matches it.
 */
describe('AI Ask (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let indexer: EmbeddingIndexerService;

  let userToken: string;
  let user: any;
  let workspace: any;
  let project: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(LLM_PROVIDER)
      .useValue(new MockLlmProvider())
      .compile();

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
    indexer = app.get<EmbeddingIndexerService>(EmbeddingIndexerService);
  });

  beforeEach(async () => {
    await cleanupTestData(prisma);
    await prisma.aiEmbedding.deleteMany();

    user = await createTestUser(prisma, {
      email: 'ask-user@example.com',
      name: 'Ask User',
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

  it('POST /ai/ask answers with citations', async () => {
    const task = await createTestTask(prisma, project.id, user.id, {
      title: 'Buy oat milk',
      description: 'Two cartons for the week',
    });
    await indexer.indexContent(
      'TASK',
      task.id,
      `${task.title}\n${task.description ?? ''}`,
    );

    const response = await request(app.getHttpServer())
      .post('/ai/ask')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ question: 'What should I buy?' })
      .expect(200);

    expect(response.body.answer).toContain('Mock response');
    expect(Array.isArray(response.body.citations)).toBe(true);
    expect(response.body.citations).toHaveLength(1);
    expect(response.body.citations[0]).toMatchObject({
      type: 'TASK',
      id: task.id,
      title: 'Buy oat milk',
    });
  });

  it('POST /ai/ask rejects an invalid DTO', async () => {
    await request(app.getHttpServer())
      .post('/ai/ask')
      .set('Authorization', `Bearer ${userToken}`)
      .send({})
      .expect(400);
  });

  it('POST /ai/ask requires authentication', async () => {
    await request(app.getHttpServer())
      .post('/ai/ask')
      .send({ question: 'hello?' })
      .expect(401);
  });

  it('never leaks content from a foreign workspace (leak contract)', async () => {
    // User A owns a task indexed as the ONLY embedding in the DB.
    const task = await createTestTask(prisma, project.id, user.id, {
      title: 'secreto alfa quarterly review',
      description: 'contenido confidencial del workspace A',
    });
    await indexer.indexContent(
      'TASK',
      task.id,
      `${task.title}\n${task.description ?? ''}`,
    );

    // User B lives in a separate workspace with no membership in A's.
    const userB = await createTestUser(prisma, {
      email: 'ask-outsider@example.com',
      name: 'Ask Outsider',
    });
    const authB = await generateAuthToken(prisma, jwtService, userB.id);
    await createTestWorkspace(prisma, userB.id);

    // B asks: the single vector candidate exists, but phase 2 (permission
    // verification) must filter it out.
    const foreign = await request(app.getHttpServer())
      .post('/ai/ask')
      .set('Authorization', `Bearer ${authB.token}`)
      .send({ question: 'secreto alfa quarterly review' })
      .expect(200);
    expect(foreign.body.citations).toEqual([]);

    // A asks: the same candidate passes verification and is cited.
    const own = await request(app.getHttpServer())
      .post('/ai/ask')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ question: 'secreto alfa quarterly review' })
      .expect(200);
    expect(own.body.citations).toHaveLength(1);
    expect(own.body.citations[0]).toMatchObject({
      type: 'TASK',
      id: task.id,
    });
  });
});
