import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { AIModule } from '../ai/ai.module';
import { MeetingsController } from './meetings.controller';
import { MeetingAssistantService } from './meeting-assistant.service';
import {
  MeetingRepository,
  CreateMeetingUseCase,
  GetMeetingUseCase,
  ListMeetingsUseCase,
} from '@ordo-todo/core';

@Module({
  imports: [DatabaseModule, RepositoriesModule, AIModule],
  controllers: [MeetingsController],
  providers: [
    {
      provide: CreateMeetingUseCase,
      useFactory: (meetingRepo: MeetingRepository) =>
        new CreateMeetingUseCase(meetingRepo),
      inject: ['MeetingRepository'],
    },
    {
      provide: GetMeetingUseCase,
      useFactory: (meetingRepo: MeetingRepository) =>
        new GetMeetingUseCase(meetingRepo),
      inject: ['MeetingRepository'],
    },
    {
      provide: ListMeetingsUseCase,
      useFactory: (meetingRepo: MeetingRepository) =>
        new ListMeetingsUseCase(meetingRepo),
      inject: ['MeetingRepository'],
    },
    MeetingAssistantService,
  ],
  exports: [MeetingAssistantService],
})
export class MeetingsModule {}
