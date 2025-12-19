import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AIModule } from '../ai/ai.module';
import { MeetingsController } from './meetings.controller';
import { MeetingAssistantService } from './meeting-assistant.service';

@Module({
  imports: [DatabaseModule, AIModule],
  controllers: [MeetingsController],
  providers: [MeetingAssistantService],
  exports: [MeetingAssistantService],
})
export class MeetingsModule {}
