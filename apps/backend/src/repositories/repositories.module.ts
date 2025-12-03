import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PrismaService } from '../database/prisma.service';
import { PrismaUserRepository } from './user.repository';
import { PrismaTaskRepository } from './task.repository';
import { PrismaProjectRepository } from './project.repository';
import { PrismaWorkspaceRepository } from './workspace.repository';
import { PrismaWorkflowRepository } from './workflow.repository';
import { PrismaTagRepository } from './tag.repository';
import { PrismaTimerRepository } from './timer.repository';
import { PrismaAnalyticsRepository } from './analytics.repository';
import { PrismaAIProfileRepository } from './ai-profile.repository';
import { PrismaProductivityReportRepository } from './productivity-report.repository';
import { PrismaWorkspaceInvitationRepository } from './workspace-invitation.repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: 'UserRepository',
      useFactory: (prisma: PrismaService) => new PrismaUserRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'TaskRepository',
      useFactory: (prisma: PrismaService) => new PrismaTaskRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'ProjectRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaProjectRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'WorkspaceRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaWorkspaceRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'WorkflowRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaWorkflowRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'TagRepository',
      useFactory: (prisma: PrismaService) => new PrismaTagRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'TimerRepository',
      useFactory: (prisma: PrismaService) => new PrismaTimerRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'AnalyticsRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaAnalyticsRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'AIProfileRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaAIProfileRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'ProductivityReportRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaProductivityReportRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'WorkspaceInvitationRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaWorkspaceInvitationRepository(prisma),
      inject: [PrismaService],
    },
  ],
  exports: [
    'UserRepository',
    'TaskRepository',
    'ProjectRepository',
    'WorkspaceRepository',
    'WorkflowRepository',
    'TagRepository',
    'TimerRepository',
    'AnalyticsRepository',
    'AIProfileRepository',
    'ProductivityReportRepository',
    'WorkspaceInvitationRepository',
  ],
})
export class RepositoriesModule { }
