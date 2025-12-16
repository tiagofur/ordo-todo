import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { FocusController } from './focus.controller';
import { FocusAudioService } from './focus-audio.service';

@Module({
    imports: [DatabaseModule],
    controllers: [FocusController],
    providers: [FocusAudioService],
    exports: [FocusAudioService],
})
export class FocusModule { }
