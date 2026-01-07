import { Module } from '@nestjs/common';
import { BlogPostService } from './blog-post.service';
import { BlogPostController } from './blog-post.controller';
import { DatabaseModule } from '../database/database.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [DatabaseModule, RepositoriesModule, AIModule],
  controllers: [BlogPostController],
  providers: [BlogPostService],
  exports: [],
})
export class BlogPostModule {}
