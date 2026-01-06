import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { BlogPostService } from './blog-post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Blog')
@Controller('blog')
export class BlogPostController {
  constructor(private readonly blogPostService: BlogPostService) { }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all blog posts' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'published', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Return all blog posts.' })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('published') published?: string,
  ) {
    return this.blogPostService.findAll({
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 10,
      publishedOnly: published === 'true',
    });
  }

  @Get('categories')
  @Public()
  @ApiOperation({ summary: 'Get all blog categories' })
  @ApiResponse({ status: 200, description: 'Return all unique categories.' })
  getCategories() {
    return this.blogPostService.getCategories();
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Get a blog post by slug' })
  @ApiResponse({ status: 200, description: 'Return the blog post.' })
  @ApiResponse({ status: 404, description: 'Blog post not found.' })
  findOne(@Param('slug') slug: string) {
    return this.blogPostService.findOne(slug);
  }

  @Post(':slug/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a comment to a blog post' })
  @ApiResponse({ status: 201, description: 'Comment added successfully.' })
  @ApiResponse({ status: 404, description: 'Blog post not found.' })
  addComment(
    @Param('slug') slug: string,
    @Body() addCommentDto: AddCommentDto,
    @CurrentUser() user: User,
  ) {
    return this.blogPostService.addComment(
      slug,
      user.id,
      addCommentDto.content,
    );
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Comment not found.' })
  deleteComment(@Param('id') id: string, @CurrentUser() user: User) {
    return this.blogPostService.deleteComment(id, user.id);
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate a blog post using AI' })
  @ApiResponse({
    status: 201,
    description: 'Blog post content generated successfully.',
  })
  async generate(@Body('topic') topic: string) {
    return this.blogPostService.generatePost(topic);
  }

  // Admin Endpoints protected by JwtAuthGuard for now
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new blog post' })
  @ApiResponse({
    status: 201,
    description: 'The blog post has been successfully created.',
  })
  create(@Body() createPostDto: CreatePostDto) {
    return this.blogPostService.create(createPostDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a blog post' })
  @ApiResponse({
    status: 200,
    description: 'The blog post has been successfully updated.',
  })
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.blogPostService.update(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a blog post' })
  @ApiResponse({
    status: 200,
    description: 'The blog post has been successfully deleted.',
  })
  delete(@Param('id') id: string) {
    return this.blogPostService.delete(id);
  }
}
