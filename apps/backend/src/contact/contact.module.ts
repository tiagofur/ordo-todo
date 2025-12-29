import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [ContactController],
    providers: [ContactService],
    exports: [ContactService],
})
export class ContactModule { }
