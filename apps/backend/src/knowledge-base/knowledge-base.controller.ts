import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';
import { CreateKBCategoryDto } from './dto/create-category.dto';
import { UpdateKBCategoryDto } from './dto/update-category.dto';
import { CreateKBArticleDto } from './dto/create-article.dto';
import { UpdateKBArticleDto } from './dto/update-article.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/admin.guard';
import { Public } from '../common/decorators/public.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('kb')
export class KnowledgeBaseController {
  constructor(private readonly kbService: KnowledgeBaseService) {}

  // Categories
  @Post('categories')
  @UseGuards(JwtAuthGuard, AdminGuard)
  createCategory(@Body() dto: CreateKBCategoryDto) {
    return this.kbService.createCategory(dto);
  }

  @Get('categories')
  @Public()
  findAllCategories() {
    return this.kbService.findAllCategories();
  }

  @Get('categories/:idOrSlug')
  @Public()
  findCategory(@Param('idOrSlug') idOrSlug: string) {
    return this.kbService.findCategory(idOrSlug);
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  updateCategory(@Param('id') id: string, @Body() dto: UpdateKBCategoryDto) {
    return this.kbService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  removeCategory(@Param('id') id: string) {
    return this.kbService.removeCategory(id);
  }

  // Articles
  @Post('articles')
  @UseGuards(JwtAuthGuard, AdminGuard)
  createArticle(@Body() dto: CreateKBArticleDto) {
    return this.kbService.createArticle(dto);
  }

  @Get('articles')
  @Public()
  findAllArticles(
    @Query() pagination: PaginationDto,
    @Query('categoryId') categoryId?: string,
    @Query('publishedOnly') publishedOnly?: string,
  ) {
    return this.kbService.findAllArticles({
      categoryId,
      publishedOnly: publishedOnly !== 'false', // Default true for public
      take: pagination.take,
      skip: pagination.skip,
    });
  }

  @Get('articles/search')
  @Public()
  search(@Query('q') query: string) {
    return this.kbService.search(query);
  }

  @Get('articles/:idOrSlug')
  @Public()
  findArticle(@Param('idOrSlug') idOrSlug: string) {
    return this.kbService.findArticle(idOrSlug);
  }

  @Patch('articles/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  updateArticle(@Param('id') id: string, @Body() dto: UpdateKBArticleDto) {
    return this.kbService.updateArticle(id, dto);
  }

  @Delete('articles/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  removeArticle(@Param('id') id: string) {
    return this.kbService.removeArticle(id);
  }

  @Post('articles/:id/vote')
  @Public()
  vote(@Param('id') id: string, @Body('helpful') helpful: boolean) {
    return this.kbService.voteArticle(id, helpful);
  }
}
