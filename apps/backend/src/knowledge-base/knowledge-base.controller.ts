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
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { MemberRole } from '@prisma/client';

@Controller('kb')
export class KnowledgeBaseController {
    constructor(private readonly kbService: KnowledgeBaseService) { }

    // Categories
    @Post('categories')
    @Roles(MemberRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
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
    @Roles(MemberRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    updateCategory(@Param('id') id: string, @Body() dto: UpdateKBCategoryDto) {
        return this.kbService.updateCategory(id, dto);
    }

    @Delete('categories/:id')
    @Roles(MemberRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    removeCategory(@Param('id') id: string) {
        return this.kbService.removeCategory(id);
    }

    // Articles
    @Post('articles')
    @Roles(MemberRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    createArticle(@Body() dto: CreateKBArticleDto) {
        return this.kbService.createArticle(dto);
    }

    @Get('articles')
    @Public()
    findAllArticles(
        @Query('categoryId') categoryId?: string,
        @Query('publishedOnly') publishedOnly?: string,
    ) {
        return this.kbService.findAllArticles({
            categoryId,
            publishedOnly: publishedOnly !== 'false', // Default true for public
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
    @Roles(MemberRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    updateArticle(@Param('id') id: string, @Body() dto: UpdateKBArticleDto) {
        return this.kbService.updateArticle(id, dto);
    }

    @Delete('articles/:id')
    @Roles(MemberRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    removeArticle(@Param('id') id: string) {
        return this.kbService.removeArticle(id);
    }

    @Post('articles/:id/vote')
    @Public()
    vote(@Param('id') id: string, @Body('helpful') helpful: boolean) {
        return this.kbService.voteArticle(id, helpful);
    }
}
