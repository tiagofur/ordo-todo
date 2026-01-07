import { Test, TestingModule } from '@nestjs/testing';
import { ContactService } from './contact.service';
import { NotFoundException } from '@nestjs/common';
import { ContactSubmission } from '@ordo-todo/core';
import type { IContactRepository } from '@ordo-todo/core';

describe('ContactService', () => {
  let service: ContactService;
  let contactRepository: jest.Mocked<IContactRepository>;

  const mockSubmission = new ContactSubmission({
    id: 'contact-1',
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Test Subject',
    message: 'Test message content',
    read: false,
    createdAt: new Date(),
  });

  beforeEach(async () => {
    contactRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        { provide: 'ContactRepository', useValue: contactRepository },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a contact submission', async () => {
      const dto = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'Test message',
      };

      contactRepository.create.mockResolvedValue(mockSubmission);

      const result = await service.create(dto);

      expect(contactRepository.create).toHaveBeenCalled();
      expect(result.name).toBe(mockSubmission.name);
    });
  });

  describe('findAll', () => {
    it('should return all submissions', async () => {
      contactRepository.findAll.mockResolvedValue([mockSubmission]);

      const result = await service.findAll({ skip: 0, take: 10 });

      expect(contactRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a submission if found', async () => {
      contactRepository.findById.mockResolvedValue(mockSubmission);

      const result = await service.findOne('contact-1');

      expect(result.id).toBe('contact-1');
    });

    it('should throw NotFoundException if not found', async () => {
      contactRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark a submission as read', async () => {
      contactRepository.findById.mockResolvedValue(mockSubmission);
      const readSubmission = new ContactSubmission({
        ...mockSubmission.props,
        read: true,
      });
      contactRepository.update.mockResolvedValue(readSubmission);

      const result = await service.markAsRead('contact-1');

      expect(contactRepository.update).toHaveBeenCalledWith('contact-1', {
        read: true,
      });
      expect(result.read).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete a submission', async () => {
      contactRepository.findById.mockResolvedValue(mockSubmission);
      contactRepository.delete.mockResolvedValue();

      const result = await service.delete('contact-1');

      expect(contactRepository.delete).toHaveBeenCalledWith('contact-1');
      expect(result).toEqual({ success: true });
    });
  });
});
