import { Module } from '@nestjs/common';
import { ChangelogService } from './changelog.service';
import { ChangelogController } from './changelog.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [ChangelogController],
    providers: [ChangelogService],
    exports: [ChangelogService],
})
export class ChangelogModule { }
