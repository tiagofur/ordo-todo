import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { DatabaseModule } from '../database/database.module';
import { PrismaNoteRepository } from '../repositories/prisma-note.repository';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [DatabaseModule, AIModule],
  controllers: [NotesController],
  providers: [
    NotesService,
    {
      provide: 'NoteRepository',
      useClass: PrismaNoteRepository,
    },
  ],
  exports: [NotesService],
})
export class NotesModule {}
