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
import { EmbeddingIndexerService } from './retrieval/embedding-indexer.service';
import { RetrievalService } from './retrieval/retrieval.service';
import { AgentToolsService } from './tools/agent-tools.service';
import { AuthAuditService } from '../auth/auth-audit.service';
import { CreditsService } from './credits/credits.service';

@Module({
  imports: [ConfigModule, DatabaseModule, RepositoriesModule],
  controllers: [AIController],
  providers: [
    AIService,
    GeminiAIService,
    TaskNlParserService,
    BurnoutPreventionService,
    EmbeddingIndexerService,
    RetrievalService,
    AgentToolsService,
    // Direct provider (exact MCP precedent: mcp.module.ts): works because
    // ConfigService is global, and the audit repo @Optional() resolves via
    // RepositoriesModule (imported above) so events persist.
    AuthAuditService,
    CreditsService,
    { provide: LLM_PROVIDER, useClass: GeminiLlmProvider },
  ],
  exports: [
    AIService,
    GeminiAIService,
    BurnoutPreventionService,
    EmbeddingIndexerService,
    LLM_PROVIDER,
  ],
})
export class AIModule {}
