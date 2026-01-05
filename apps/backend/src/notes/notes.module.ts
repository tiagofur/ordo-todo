import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { DatabaseModule } from '../database/database.module';
import { PrismaNoteRepository } from '../repositories/prisma-note.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [NotesController],
  providers: [
    NotesService,
    {
      provide: 'NoteRepository',
      useClass: PrismaNoteRepository,
    },
  ],
})
export class NotesModule {}
