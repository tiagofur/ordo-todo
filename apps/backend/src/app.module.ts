import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { RepositoriesModule } from './repositories/repositories.module';
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
import { CommentsModule } from './comments/comments.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { UploadModule } from './upload/upload.module';
import { NotificationsModule } from './notifications/notifications.module';
import { GamificationModule } from './gamification/gamification.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from './common/logger/logger.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    RepositoriesModule,
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
    CommentsModule,
    AttachmentsModule,
    UploadModule,
    NotificationsModule,
    GamificationModule,
    WinstonModule.forRoot(loggerConfig),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
