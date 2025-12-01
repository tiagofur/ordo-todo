import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { GeminiAIService } from './gemini-ai.service';

@Module({
  imports: [ConfigModule, DatabaseModule, RepositoriesModule],
  controllers: [AIController],
  providers: [AIService, GeminiAIService],
  exports: [AIService, GeminiAIService],
})
export class AIModule {}
