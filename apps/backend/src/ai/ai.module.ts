import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { GeminiAIService } from './gemini-ai.service';
import { BurnoutPreventionService } from './burnout-prevention.service';

@Module({
  imports: [ConfigModule, DatabaseModule, RepositoriesModule],
  controllers: [AIController],
  providers: [AIService, GeminiAIService, BurnoutPreventionService],
  exports: [AIService, GeminiAIService, BurnoutPreventionService],
})
export class AIModule {}
