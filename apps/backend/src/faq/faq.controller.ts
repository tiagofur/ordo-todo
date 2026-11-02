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
import { QueryFaqDto } from './dto/query-faq.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/admin.guard';

@Controller('faq')
export class FAQController {
  constructor(private readonly faqService: FAQService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() createDto: CreateFAQDto) {
    return this.faqService.create(createDto);
  }

  @Get()
  findAll(@Query() query: QueryFaqDto) {
    return this.faqService.findAll({
      category: query.category,
      publishedOnly: query.publishedOnly === 'true',
      take: query.take,
      skip: query.skip,
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
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param('id') id: string, @Body() updateDto: UpdateFAQDto) {
    return this.faqService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id') id: string) {
    return this.faqService.remove(id);
  }
}
