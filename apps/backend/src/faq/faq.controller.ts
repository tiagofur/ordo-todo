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
import { FAQService } from './faq.service';
import { CreateFAQDto } from './dto/create-faq.dto';
import { UpdateFAQDto } from './dto/update-faq.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MemberRole } from '@prisma/client';

@Controller('faq')
export class FAQController {
  constructor(private readonly faqService: FAQService) {}

  @Post()
  @Roles(MemberRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() createDto: CreateFAQDto) {
    return this.faqService.create(createDto);
  }

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('publishedOnly') publishedOnly?: string,
  ) {
    return this.faqService.findAll({
      category,
      publishedOnly: publishedOnly === 'true',
    });
  }

  @Get('categories')
  getCategories() {
    return this.faqService.getCategories();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.faqService.findOne(id);
  }

  @Patch(':id')
  @Roles(MemberRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() updateDto: UpdateFAQDto) {
    return this.faqService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(MemberRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.faqService.remove(id);
  }
}
