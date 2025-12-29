import { Module } from '@nestjs/common';
import { BlogPostService } from './blog-post.service';
import { BlogPostController } from './blog-post.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [BlogPostController],
  providers: [BlogPostService],
  exports: [BlogPostService],
})
export class BlogPostModule {}
