import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { CalendarConnectionsController } from './calendar-connections.controller';
import { CalendarConnectionsService } from './calendar-connections.service';
import { GoogleCalendarProvider } from './google-calendar.provider';
import { OutlookCalendarProvider } from './outlook-calendar.provider';

@Module({
  imports: [DatabaseModule, ConfigModule],
  controllers: [CalendarConnectionsController],
  providers: [
    CalendarConnectionsService,
    GoogleCalendarProvider,
    OutlookCalendarProvider,
  ],
  exports: [CalendarConnectionsService],
})
export class CalendarSyncModule {}
