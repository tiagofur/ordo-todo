import { Module } from '@nestjs/common';
import { PublishingController } from './publishing.controller';
import { PublishingService } from './publishing.service';
import { PublishingRepository } from './publishing.repository';
import { ContentPiecesModule } from '../content-pieces/content-pieces.module';

@Module({
  imports: [ContentPiecesModule],
  controllers: [PublishingController],
  providers: [PublishingService, PublishingRepository],
  exports: [PublishingService],
})
export class PublishingModule {}
