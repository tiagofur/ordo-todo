import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ApiTokensService } from './api-tokens.service';
import { PrismaService } from '../database/prisma.service';

describe('ApiTokensService', () => {
  let service: ApiTokensService;

  const mockPrismaService = {
    apiToken: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiTokensService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ApiTokensService>(ApiTokensService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a token, return the secret once, and store only a hash', async () => {
      const userId = 'user-123';
      const dto = { name: 'CI deploy', scopes: ['read', 'tasks:write'] };
      mockPrismaService.apiToken.create.mockImplementation(
        async ({ data }: any) => ({
          id: 'token-1',
          userId,
          name: data.name,
          tokenHash: data.tokenHash,
          tokenPrefix: data.tokenPrefix,
          scopes: data.scopes,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      const result = await service.create(userId, dto);

      expect(result.token).toMatch(/^ordo_pat_/);
      expect(result.tokenPrefix).toBe(result.token.slice(-8));
      expect(result.name).toBe('CI deploy');
      expect(result.scopes).toEqual(['read', 'tasks:write']);

      const stored = mockPrismaService.apiToken.create.mock.calls[0][0].data;
      expect(stored.tokenHash).not.toBe(result.token);
      expect(stored.tokenHash).not.toContain('ordo_pat_');
      await expect(
        bcrypt.compare(result.token, stored.tokenHash),
      ).resolves.toBe(true);
    });

    it('should reject unknown scopes', async () => {
      await expect(
        service.create('user-123', { name: 'bad', scopes: ['admin:root'] }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.apiToken.create).not.toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('should return user tokens without hash or secret', async () => {
      const userId = 'user-123';
      mockPrismaService.apiToken.findMany.mockResolvedValue([
        {
          id: 'token-1',
          name: 'CI deploy',
          tokenPrefix: 'abcd1234',
          scopes: ['read'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const result = await service.list(userId);

      expect(mockPrismaService.apiToken.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId } }),
      );
      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty('tokenHash');
      expect(result[0]).not.toHaveProperty('token');
    });
  });

  describe('revoke', () => {
    it('should delete an owned token', async () => {
      mockPrismaService.apiToken.deleteMany.mockResolvedValue({ count: 1 });

      await service.revoke('user-123', 'token-1');

      expect(mockPrismaService.apiToken.deleteMany).toHaveBeenCalledWith({
        where: { id: 'token-1', userId: 'user-123' },
      });
    });

    it('should throw NotFound when the token does not exist or belongs to another user', async () => {
      mockPrismaService.apiToken.deleteMany.mockResolvedValue({ count: 0 });

      await expect(service.revoke('user-123', 'token-9')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('validateToken', () => {
    it('should return userId, tokenId and scopes for a valid token', async () => {
      const rawToken = 'ordo_pat_validtokensecret0000001';
      const tokenHash = await bcrypt.hash(rawToken, 10);
      mockPrismaService.apiToken.findMany.mockResolvedValue([
        {
          id: 'token-1',
          userId: 'user-123',
          tokenHash,
          scopes: ['read'],
        },
      ]);

      const result = await service.validateToken(rawToken);

      expect(mockPrismaService.apiToken.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tokenPrefix: rawToken.slice(-8) },
        }),
      );
      expect(result).toEqual({
        userId: 'user-123',
        tokenId: 'token-1',
        scopes: ['read'],
      });
    });

    it('should return null for malformed, unknown, or mismatched tokens', async () => {
      mockPrismaService.apiToken.findMany.mockResolvedValue([]);

      await expect(service.validateToken('not-a-pat')).resolves.toBeNull();
      await expect(
        service.validateToken('ordo_pat_unknown00000000002'),
      ).resolves.toBeNull();

      const otherHash = await bcrypt.hash('ordo_pat_other0000000000003', 10);
      mockPrismaService.apiToken.findMany.mockResolvedValue([
        { id: 'token-2', userId: 'user-9', tokenHash: otherHash, scopes: [] },
      ]);
      await expect(
        service.validateToken('ordo_pat_forged000000000004'),
      ).resolves.toBeNull();
    });
  });
});
