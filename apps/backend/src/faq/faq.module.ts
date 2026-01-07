import { Module } from '@nestjs/common';
import { FAQService } from './faq.service';
import { FAQController } from './faq.controller';
import { RepositoriesModule } from '../repositories/repositories.module';

@Module({
    imports: [RepositoriesModule],
    controllers: [FAQController],
    providers: [FAQService],
    exports: [FAQService],
})
export class FAQModule { }
