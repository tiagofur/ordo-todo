import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { DayPlanService } from './day-plan.service';
import { SchedulingModule } from '../scheduling/scheduling.module';
import { TagsModule } from '../tags/tags.module';
import { CommentsModule } from '../comments/comments.module';
import { AttachmentsModule } from '../attachments/attachments.module';
import { ActivitiesModule } from '../activities/activities.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { GamificationModule } from '../gamification/gamification.module';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    DatabaseModule,
    RepositoriesModule,
    ActivitiesModule,
    forwardRef(() => TagsModule),
    forwardRef(() => CommentsModule),
    forwardRef(() => AttachmentsModule),
    NotificationsModule,
    GamificationModule,
    AIModule,
    // ODD 005 S3/T3b + S4/T4: DayPlanService + RiskAlertService needs.
    // No cycle: SchedulingModule imports RepositoriesModule only.
    SchedulingModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'default-jwt-secret-ordo-calendar',
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [TasksController],
  providers: [TasksService, DayPlanService],
  exports: [TasksService, DayPlanService],
})
export class TasksModule {}
