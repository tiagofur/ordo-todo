import { Module } from '@nestjs/common';
import { CollaborationGateway } from './collaboration.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WsThrottleGuard } from '../common/guards/ws-throttle.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    CollaborationGateway,
    {
      provide: WsThrottleGuard,
      useValue: new WsThrottleGuard(50, 60),
    },
  ],
  exports: [CollaborationGateway],
})
export class CollaborationModule {}
