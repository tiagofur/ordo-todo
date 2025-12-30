import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { RepositoriesModule } from './repositories/repositories.module';
import { CacheModule } from './cache/cache.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { TagsModule } from './tags/tags.module';
import { TimersModule } from './timers/timers.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AIModule } from './ai/ai.module';
import { ChatModule } from './chat/chat.module';
import { CommentsModule } from './comments/comments.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { UploadModule } from './upload/upload.module';
import { NotificationsModule } from './notifications/notifications.module';
import { GamificationModule } from './gamification/gamification.module';
import { TemplatesModule } from './templates/templates.module';
import { CollaborationModule } from './collaboration/collaboration.module';
import { HabitsModule } from './habits/habits.module';
import { ObjectivesModule } from './objectives/objectives.module';
import { CustomFieldsModule } from './custom-fields/custom-fields.module';
import { FocusModule } from './focus/focus.module';
import { MeetingsModule } from './meetings/meetings.module';
import { SearchModule } from './search/search.module';
import { HealthModule } from './health/health.module';
import { BlogPostModule } from './blog/blog-post.module';
import { ChangelogModule } from './changelog/changelog.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { ContactModule } from './contact/contact.module';
import { RoadmapModule } from './roadmap/roadmap.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { CustomThrottleGuard } from './common/guards/throttle.guard';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from './common/logger/logger.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100, // Default limit (100 requests per minute)
      },
    ]),
    CacheModule,
    ConfigModule,
    DatabaseModule,
    RepositoriesModule,
    HealthModule, // Health check endpoints (no prefix)
    AuthModule,
    UsersModule,
    WorkspacesModule,
    WorkflowsModule,
    ProjectsModule,
    TasksModule,
    TagsModule,
    TimersModule,
    AnalyticsModule,
    AIModule,
    ChatModule,
    CommentsModule,
    AttachmentsModule,
    UploadModule,
    NotificationsModule,
    GamificationModule,
    TemplatesModule,
    CollaborationModule,
    HabitsModule,
    ObjectivesModule,
    CustomFieldsModule,
    FocusModule,
    MeetingsModule,
    SearchModule,
    BlogPostModule,
    ChangelogModule,
    NewsletterModule,
    ContactModule,
    RoadmapModule,
    WinstonModule.forRoot(loggerConfig),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottleGuard,
    },
  ],
})
export class AppModule {}
