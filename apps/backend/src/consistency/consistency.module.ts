import { Module } from '@nestjs/common';
import { ConsistencyController } from './consistency.controller';
import { ConsistencyService } from './consistency.service';
import { ConsistencyRepository } from './consistency.repository';

@Module({
    controllers: [ConsistencyController],
    providers: [ConsistencyService, ConsistencyRepository],
    exports: [ConsistencyService],
})
export class ConsistencyModule { }
