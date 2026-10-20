import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { GeminiAIService } from './gemini-ai.service';
import { TaskNlParserService } from './task-nl-parser.service';
import { BurnoutPreventionService } from './burnout-prevention.service';
import { LLM_PROVIDER } from './llm/llm-provider.interface';
import { GeminiLlmProvider } from './llm/gemini-llm-provider';

@Module({
  imports: [ConfigModule, DatabaseModule, RepositoriesModule],
  controllers: [AIController],
  providers: [
    AIService,
    GeminiAIService,
    TaskNlParserService,
    BurnoutPreventionService,
    { provide: LLM_PROVIDER, useClass: GeminiLlmProvider },
  ],
  exports: [AIService, GeminiAIService, BurnoutPreventionService, LLM_PROVIDER],
})
export class AIModule {}
