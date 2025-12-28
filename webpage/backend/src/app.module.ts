import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { BlogPostModule } from './blog/blog-post.module';

@Module({
  imports: [PrismaModule, BlogPostModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
