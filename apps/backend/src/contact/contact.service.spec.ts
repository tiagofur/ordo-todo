import { Test, TestingModule } from '@nestjs/testing';
import { ContactService } from './contact.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
    contactSubmission: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
};

describe('ContactService', () => {
    let service: ContactService;
    let prisma: typeof mockPrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ContactService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<ContactService>(ContactService);
        prisma = module.get(PrismaService);
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
                name: 'John',
                email: 'john@example.com',
                subject: 'Test',
                message: 'Message',
            };

            const expectedResult = { id: '1', ...dto, read: false, createdAt: new Date() };
            prisma.contactSubmission.create.mockResolvedValue(expectedResult);

            const result = await service.create(dto);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('findOne', () => {
        it('should return a submission if found', async () => {
            const submission = { id: '1', name: 'John' };
            prisma.contactSubmission.findUnique.mockResolvedValue(submission);

            const result = await service.findOne('1');
            expect(result).toEqual(submission);
        });

        it('should throw NotFoundException if not found', async () => {
            prisma.contactSubmission.findUnique.mockResolvedValue(null);

            await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
        });
    });
});
