import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { FAQ } from '@ordo-todo/core';
import type { IFAQRepository } from '@ordo-todo/core';
import { CreateFAQDto } from './dto/create-faq.dto';
import { UpdateFAQDto } from './dto/update-faq.dto';

@Injectable()
export class FAQService {
  constructor(
    @Inject('FAQRepository')
    private readonly faqRepository: IFAQRepository,
  ) {}

  async create(createDto: CreateFAQDto): Promise<FAQ> {
    const faq = FAQ.create({
      question: createDto.question,
      answer: createDto.answer,
      category: createDto.category,
      order: createDto.order ?? 0,
      published: createDto.published ?? true,
    });

    return this.faqRepository.create(faq);
  }

  async findAll(options?: {
    publishedOnly?: boolean;
    category?: string;
  }): Promise<FAQ[]> {
    return this.faqRepository.findAll(options);
  }

  async findOne(id: string): Promise<FAQ> {
    const faq = await this.faqRepository.findById(id);
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    return faq;
  }

  async update(id: string, updateDto: UpdateFAQDto): Promise<FAQ> {
    const faq = await this.findOne(id);
    const updatedFAQ = faq.update(updateDto);
    return this.faqRepository.update(updatedFAQ);
  }

  async remove(id: string): Promise<{ success: boolean }> {
    await this.findOne(id);
    await this.faqRepository.delete(id);
    return { success: true };
  }

  async getCategories(): Promise<string[]> {
    return this.faqRepository.getCategories();
  }
}
