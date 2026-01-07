import { Test, TestingModule } from '@nestjs/testing';
import { FAQService } from './faq.service';
import { FAQ } from '@ordo-todo/core';
import type { IFAQRepository } from '@ordo-todo/core';

describe('FAQService', () => {
    let service: FAQService;
    let repository: jest.Mocked<IFAQRepository>;

    const mockFAQ = new FAQ({
        id: 'faq-1',
        question: 'Q1',
        answer: 'A1',
        category: 'C1',
        order: 0,
        published: true,
    });

    beforeEach(async () => {
        const mockRepo = {
            findById: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            getCategories: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FAQService,
                { provide: 'FAQRepository', useValue: mockRepo },
            ],
        }).compile();

        service = module.get<FAQService>(FAQService);
        repository = module.get('FAQRepository');
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create an FAQ', async () => {
        repository.create.mockResolvedValue(mockFAQ);
        const result = await service.create({
            question: 'Q1',
            answer: 'A1',
            category: 'C1',
        });
        expect(result).toEqual(mockFAQ);
        expect(repository.create).toHaveBeenCalled();
    });

    it('should find all faqs', async () => {
        repository.findAll.mockResolvedValue([mockFAQ]);
        const result = await service.findAll();
        expect(result).toEqual([mockFAQ]);
        expect(repository.findAll).toHaveBeenCalled();
    });

    it('should find one faq', async () => {
        repository.findById.mockResolvedValue(mockFAQ);
        const result = await service.findOne('faq-1');
        expect(result).toEqual(mockFAQ);
    });

    it('should throw NotFoundException if faq not found', async () => {
        repository.findById.mockResolvedValue(null);
        await expect(service.findOne('invalid')).rejects.toThrow();
    });
});
