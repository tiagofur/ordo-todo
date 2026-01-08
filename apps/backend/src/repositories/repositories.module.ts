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
import { PrismaWorkspaceSettingsRepository } from './workspace-settings.repository';
import { PrismaWorkspaceAuditLogRepository } from './workspace-audit-log.repository';
import { PrismaCommentRepository } from './prisma-comment.repository';
import { PrismaAttachmentRepository } from './prisma-attachment.repository';
import { PrismaNotificationRepository } from './prisma-notification.repository';
import { PrismaHabitRepository } from './prisma-habit.repository';
import { PrismaChangelogRepository } from './prisma-changelog.repository';
import { PrismaNewsletterRepository } from './prisma-newsletter.repository';
import { PrismaContactRepository } from './prisma-contact.repository';
import { PrismaRoadmapRepository } from './prisma-roadmap.repository';
import { PrismaBlogRepository } from './prisma-blog.repository';
import { PrismaGamificationRepository } from './prisma-gamification.repository';
import { PrismaChatRepository } from './prisma-chat.repository';
import { PrismaTaskTemplateRepository } from './prisma-task-template.repository';
import { PrismaObjectiveRepository } from './prisma-objective.repository';
import { PrismaFAQRepository } from './prisma-faq.repository';
import { PrismaKBRepository } from './prisma-kb.repository';
import { PrismaCollaborationRepository } from './prisma-collaboration.repository';
import { PrismaCustomFieldRepository } from './prisma-custom-field.repository';
import { PrismaFocusRepository } from './prisma-focus.repository';
import { PrismaMeetingRepository } from './prisma-meeting.repository';
import { PrismaActivityRepository } from './prisma-activity.repository';
import { PrismaRecurrenceRepository } from './prisma-recurrence.repository';
import { PrismaTaskDependencyRepository } from './prisma-task-dependency.repository';
import { PrismaSubscriptionRepository } from './prisma-subscription.repository';
import { PrismaWorkspaceMemberRepository } from './prisma-workspace-member.repository';
import { PrismaUserIntegrationRepository } from './prisma-user-integration.repository';
import { PrismaAdminUserRepository } from './prisma-admin-user.repository';
import { PrismaSessionRepository } from './prisma-session.repository';
import { PrismaAccountRepository } from './prisma-account.repository';

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
    {
      provide: 'WorkspaceSettingsRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaWorkspaceSettingsRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'WorkspaceAuditLogRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaWorkspaceAuditLogRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'CommentRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaCommentRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'AttachmentRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaAttachmentRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'NotificationRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaNotificationRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'HabitRepository',
      useFactory: (prisma: PrismaService) => new PrismaHabitRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'ChangelogRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaChangelogRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'NewsletterRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaNewsletterRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'ContactRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaContactRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'RoadmapRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaRoadmapRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'BlogRepository',
      useFactory: (prisma: PrismaService) => new PrismaBlogRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'GamificationRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaGamificationRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'ChatRepository',
      useFactory: (prisma: PrismaService) => new PrismaChatRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'TaskTemplateRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaTaskTemplateRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'ObjectiveRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaObjectiveRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'FAQRepository',
      useFactory: (prisma: PrismaService) => new PrismaFAQRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'KBRepository',
      useFactory: (prisma: PrismaService) => new PrismaKBRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'CollaborationRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaCollaborationRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'CustomFieldRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaCustomFieldRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'FocusRepository',
      useFactory: (prisma: PrismaService) => new PrismaFocusRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'MeetingRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaMeetingRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'ActivityRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaActivityRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'RecurrenceRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaRecurrenceRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'TaskDependencyRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaTaskDependencyRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'SubscriptionRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaSubscriptionRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'WorkspaceMemberRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaWorkspaceMemberRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'UserIntegrationRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaUserIntegrationRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'AdminUserRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaAdminUserRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'SessionRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaSessionRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'AccountRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaAccountRepository(prisma),
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
    'WorkspaceSettingsRepository',
    'WorkspaceAuditLogRepository',
    'CommentRepository',
    'AttachmentRepository',
    'NotificationRepository',
    'HabitRepository',
    'ChangelogRepository',
    'NewsletterRepository',
    'ContactRepository',
    'RoadmapRepository',
    'BlogRepository',
    'GamificationRepository',
    'ChatRepository',
    'TaskTemplateRepository',
    'ObjectiveRepository',
    'FAQRepository',
    'KBRepository',
    'CollaborationRepository',
    'CustomFieldRepository',
    'FocusRepository',
    'MeetingRepository',
    'ActivityRepository',
    'RecurrenceRepository',
    'TaskDependencyRepository',
    'SubscriptionRepository',
    'WorkspaceMemberRepository',
    'UserIntegrationRepository',
    'AdminUserRepository',
    'SessionRepository',
    'AccountRepository',
  ],
})
export class RepositoriesModule {}
