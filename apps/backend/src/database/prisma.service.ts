import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;
  private pool: Pool;

  constructor() {
    // Create PostgreSQL connection pool
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Create Prisma adapter
    const adapter = new PrismaPg(this.pool);

    // Initialize Prisma Client with adapter
    this.prisma = new PrismaClient({ adapter });
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
}
