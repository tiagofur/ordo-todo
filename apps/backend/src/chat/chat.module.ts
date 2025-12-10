import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatRepository } from './chat.repository';
import { ProductivityCoachService } from './productivity-coach.service';
import { AIModule } from '../ai/ai.module';

@Module({
    imports: [AIModule],
    controllers: [ChatController],
    providers: [ChatService, ChatRepository, ProductivityCoachService],
    exports: [ChatService, ProductivityCoachService],
})
export class ChatModule { }
