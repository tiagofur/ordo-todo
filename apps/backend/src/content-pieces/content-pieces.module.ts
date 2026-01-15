import { Module } from '@nestjs/common';
import { ContentPiecesController } from './content-pieces.controller';
import { ContentPiecesService } from './content-pieces.service';
import { ContentPiecesRepository } from './content-pieces.repository';
import { IdeasModule } from '../ideas/ideas.module';

@Module({
    imports: [IdeasModule],
    controllers: [ContentPiecesController],
    providers: [ContentPiecesService, ContentPiecesRepository],
    exports: [ContentPiecesService],
})
export class ContentPiecesModule { }
