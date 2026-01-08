import { Module } from '@nestjs/common';
import { CollaborationGateway } from './collaboration.gateway';
import { TeamWorkloadService } from './team-workload.service';
import { TeamWorkloadController } from './team-workload.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WsThrottleGuard } from '../common/guards/ws-throttle.guard';
import { DatabaseModule } from '../database/database.module';
import { RepositoriesModule } from '../repositories/repositories.module';

@Module({
  imports: [
    DatabaseModule,
    RepositoriesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [TeamWorkloadController],
  providers: [
    CollaborationGateway,
    TeamWorkloadService,
    {
      provide: WsThrottleGuard,
      useValue: new WsThrottleGuard(50, 60),
    },
  ],
  exports: [CollaborationGateway, TeamWorkloadService],
})
export class CollaborationModule {}
