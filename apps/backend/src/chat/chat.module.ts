import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ProductivityCoachService } from './productivity-coach.service';
import { AIModule } from '../ai/ai.module';
import { RepositoriesModule } from '../repositories/repositories.module';

@Module({
  imports: [AIModule, RepositoriesModule],
  controllers: [ChatController],
  providers: [ChatService, ProductivityCoachService],
  exports: [ChatService, ProductivityCoachService],
})
export class ChatModule { }
