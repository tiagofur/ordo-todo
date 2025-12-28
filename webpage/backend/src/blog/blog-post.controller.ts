import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { BlogPostService } from './blog-post.service';
import { Prisma } from '@ordo-todo/db';

@Controller('blog')
export class BlogPostController {
  constructor(private readonly blogPostService: BlogPostService) {}

  @Get()
  findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.blogPostService.findAll({
      skip: Number(skip) || 0,
      take: Number(take) || 10,
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
    });
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.blogPostService.findOne(slug);
  }
}
