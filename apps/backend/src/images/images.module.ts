import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ImagesService } from './images.service';

/**
 * Images Module
 *
 * Provides image processing capabilities for avatar uploads and image optimization.
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [ImagesModule],
 *   providers: [UsersService],
 * })
 * export class UsersModule {}
 * ```
 */
@Module({
  imports: [ConfigModule],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
