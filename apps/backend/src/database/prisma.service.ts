import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;
  private pool: Pool;

  constructor() {
    // Create PostgreSQL connection pool with optimized settings
    // Connection pooling configuration for high-traffic production workloads
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,

      // Connection pool settings
      max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX) : 20, // Maximum pool size
      min: process.env.DB_POOL_MIN ? parseInt(process.env.DB_POOL_MIN) : 5, // Minimum pool size
      idleTimeoutMillis: 30000, // Close idle connections after 30 seconds

      // Connection timeout settings
      connectionTimeoutMillis: 10000, // 10 seconds to establish connection

      // Note: idle_in_transaction_session_timeout and statement_timeout
      // should be set at the PostgreSQL server level or via SET commands
    });

    // Create Prisma adapter
    const adapter = new PrismaPg(this.pool);

    // Initialize Prisma Client with adapter and performance optimizations
    this.prisma = new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
    });
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
    await this.pool.end();
  }

  // Expose Prisma Client methods
  get client() {
    return this.prisma;
  }

  // Expose transaction method
  get $transaction() {
    return this.prisma.$transaction.bind(this.prisma);
  }

  // Expose executeRaw method
  get $executeRaw() {
    return this.prisma.$executeRaw.bind(this.prisma);
  }

  // Expose queryRaw method
  get $queryRaw() {
    return this.prisma.$queryRaw.bind(this.prisma);
  }

  // Proxy all model methods
  get user() {
    return this.prisma.user;
  }

  get workspace() {
    return this.prisma.workspace;
  }

  get workspaceMember() {
    return this.prisma.workspaceMember;
  }

  get workflow() {
    return this.prisma.workflow;
  }

  get project() {
    return this.prisma.project;
  }

  get task() {
    return this.prisma.task;
  }

  get tag() {
    return this.prisma.tag;
  }

  get taskTag() {
    return this.prisma.taskTag;
  }

  get timeSession() {
    return this.prisma.timeSession;
  }

  get comment() {
    return this.prisma.comment;
  }

  get attachment() {
    return this.prisma.attachment;
  }

  get userPreferences() {
    return this.prisma.userPreferences;
  }

  get subscription() {
    return this.prisma.subscription;
  }

  get account() {
    return this.prisma.account;
  }

  get session() {
    return this.prisma.session;
  }

  get aIProfile() {
    return this.prisma.aIProfile;
  }

  get productivityReport() {
    return this.prisma.productivityReport;
  }

  get dailyMetrics() {
    return this.prisma.dailyMetrics;
  }

  get recurrence() {
    return this.prisma.recurrence;
  }

  get taskDependency() {
    return this.prisma.taskDependency;
  }

  get activity() {
    return this.prisma.activity;
  }

  get workspaceInvitation() {
    return this.prisma.workspaceInvitation;
  }

  get workspaceSettings() {
    return this.prisma.workspaceSettings;
  }

  get workspaceAuditLog() {
    return this.prisma.workspaceAuditLog;
  }

  get notification() {
    return this.prisma.notification;
  }

  get note() {
    return this.prisma.note;
  }

  get achievement() {
    return this.prisma.achievement;
  }

  get userAchievement() {
    return this.prisma.userAchievement;
  }

  get taskTemplate() {
    return this.prisma.taskTemplate;
  }

  get userIntegration() {
    return this.prisma.userIntegration;
  }

  get chatConversation() {
    return this.prisma.chatConversation;
  }

  get chatMessage() {
    return this.prisma.chatMessage;
  }

  get habit() {
    return this.prisma.habit;
  }

  get habitCompletion() {
    return this.prisma.habitCompletion;
  }

  get objective() {
    return this.prisma.objective;
  }

  get keyResult() {
    return this.prisma.keyResult;
  }

  get keyResultTask() {
    return this.prisma.keyResultTask;
  }

  get blogPost() {
    return this.prisma.blogPost;
  }

  get blogComment() {
    return this.prisma.blogComment;
  }

  get meeting() {
    return this.prisma.meeting;
  }

  get adminUser() {
    return this.prisma.adminUser;
  }

  get customField() {
    return this.prisma.customField;
  }

  get customFieldValue() {
    return this.prisma.customFieldValue;
  }

  get changelogEntry() {
    return this.prisma.changelogEntry;
  }

  get newsletterSubscriber() {
    return this.prisma.newsletterSubscriber;
  }

  get contactSubmission() {
    return this.prisma.contactSubmission;
  }

  get roadmapItem() {
    return this.prisma.roadmapItem;
  }

  get roadmapVote() {
    return this.prisma.roadmapVote;
  }

  get faq() {
    return this.prisma.fAQ;
  }

  get kBCategory() {
    return this.prisma.kBCategory;
  }

  get kBArticle() {
    return this.prisma.kBArticle;
  }
}
