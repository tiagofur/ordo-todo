import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AIModule } from '../ai/ai.module';
import { SearchController } from './search.controller';
import { SemanticSearchService } from './semantic-search.service';

@Module({
    imports: [DatabaseModule, AIModule],
    controllers: [SearchController],
    providers: [SemanticSearchService],
    exports: [SemanticSearchService],
})
export class SearchModule { }
