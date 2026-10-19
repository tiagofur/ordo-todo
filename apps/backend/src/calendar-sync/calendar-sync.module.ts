import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { V1Module } from '../v1/v1.module';
import { CalendarConnectionsController } from './calendar-connections.controller';
import { CalendarConnectionsService } from './calendar-connections.service';
import { CalendarPushService } from './calendar-push.service';
import { CalendarPullService } from './calendar-pull.service';
import { CalendarConflictsService } from './calendar-conflicts.service';
import { GoogleCalendarProvider } from './google-calendar.provider';
import { OutlookCalendarProvider } from './outlook-calendar.provider';

@Module({
  imports: [DatabaseModule, ConfigModule, V1Module],
  controllers: [CalendarConnectionsController],
  providers: [
    CalendarConnectionsService,
    CalendarPushService,
    CalendarPullService,
    CalendarConflictsService,
    GoogleCalendarProvider,
    OutlookCalendarProvider,
  ],
  exports: [
    CalendarConnectionsService,
    CalendarPushService,
    CalendarPullService,
    CalendarConflictsService,
  ],
})
export class CalendarSyncModule {}
