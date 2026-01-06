import { Test, TestingModule } from '@nestjs/testing';
import { NewsletterService } from './newsletter.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { NewsletterSubscriber } from '@ordo-todo/core';
import type { INewsletterRepository } from '@ordo-todo/core';

describe('NewsletterService', () => {
  let service: NewsletterService;
  let newsletterRepository: jest.Mocked<INewsletterRepository>;

  const mockSubscriber = new NewsletterSubscriber({
    id: 'sub-1',
    email: 'test@test.com',
    active: true,
    createdAt: new Date(),
  });

  beforeEach(async () => {
    newsletterRepository = {
      findByEmail: jest.fn(),
      findByUserId: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsletterService,
        { provide: 'NewsletterRepository', useValue: newsletterRepository },
      ],
    }).compile();

    service = module.get<NewsletterService>(NewsletterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('subscribe', () => {
    it('should create new subscription if not exists', async () => {
      newsletterRepository.findByEmail.mockResolvedValue(null);
      newsletterRepository.create.mockResolvedValue(mockSubscriber);

      await service.subscribe({ email: 'test@test.com' });

      expect(newsletterRepository.create).toHaveBeenCalled();
    });

    it('should throw BadRequest if already subscribed', async () => {
      newsletterRepository.findByEmail.mockResolvedValue(mockSubscriber);

      await expect(
        service.subscribe({ email: 'test@test.com' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reactivate if inactive', async () => {
      const inactiveSubscriber = new NewsletterSubscriber({
        id: 'sub-1',
        email: 'test@test.com',
        active: false,
        createdAt: new Date(),
      });

      newsletterRepository.findByEmail.mockResolvedValue(inactiveSubscriber);
      newsletterRepository.update.mockResolvedValue(mockSubscriber);

      await service.subscribe({ email: 'test@test.com' });

      expect(newsletterRepository.update).toHaveBeenCalled();
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe existing user', async () => {
      newsletterRepository.findByEmail.mockResolvedValue(mockSubscriber);
      const unsubscribed = new NewsletterSubscriber({
        ...mockSubscriber.props,
        active: false,
      });
      newsletterRepository.update.mockResolvedValue(unsubscribed);

      const result = await service.unsubscribe({ email: 'test@test.com' });

      expect(newsletterRepository.update).toHaveBeenCalledWith('sub-1', { active: false });
      expect(result.active).toBe(false);
    });

    it('should throw NotFound if email not found', async () => {
      newsletterRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.unsubscribe({ email: 'nope@test.com' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkStatus', () => {
    it('should return true if subscribed and active', async () => {
      newsletterRepository.findByEmail.mockResolvedValue(mockSubscriber);

      const result = await service.checkStatus('test@test.com');

      expect(result).toBe(true);
    });

    it('should return false if not subscribed', async () => {
      newsletterRepository.findByEmail.mockResolvedValue(null);

      const result = await service.checkStatus('nope@test.com');

      expect(result).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return all subscribers', async () => {
      newsletterRepository.findAll.mockResolvedValue([mockSubscriber]);

      const result = await service.findAll({ skip: 0, take: 10 });

      expect(newsletterRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });
});
