import { Test, TestingModule } from '@nestjs/testing';
import { PrismaUserRepository } from './user.repository';
import { PrismaService } from '../database/prisma.service';
import { User } from '@ordo-todo/core';

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      upsert: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    account: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaUserRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PrismaUserRepository>(PrismaUserRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should successfully save a new user', async () => {
      const user = new User({
        id: 'user-123',
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
      });

      mockPrismaService.user.upsert.mockResolvedValue({ id: 'user-123' });

      await repository.save(user);

      expect(mockPrismaService.user.upsert).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        create: {
          id: 'user-123',
          name: 'Test User',
          username: 'testuser',
          email: 'test@example.com',
          hashedPassword: 'hashedpassword',
          updatedAt: undefined,
        },
        update: {
          id: 'user-123',
          name: 'Test User',
          username: 'testuser',
          email: 'test@example.com',
          hashedPassword: 'hashedpassword',
          updatedAt: undefined,
        },
      });
    });

    it('should successfully update an existing user', async () => {
      const user = new User({
        id: 'user-123',
        name: 'Updated Name',
        username: 'testuser',
        email: 'test@example.com',
        password: 'newhashedpassword',
      });

      mockPrismaService.user.upsert.mockResolvedValue({ id: 'user-123' });

      await repository.save(user);

      expect(mockPrismaService.user.upsert).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        create: expect.any(Object),
        update: expect.objectContaining({
          name: 'Updated Name',
          hashedPassword: 'newhashedpassword',
        }),
      });
    });
  });

  describe('updateProps', () => {
    it('should successfully update user properties', async () => {
      const user = new User({
        id: 'user-123',
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
      });

      const props = {
        name: 'Updated Name',
        email: 'updated@example.com',
        password: 'newhashedpassword',
      };

      mockPrismaService.user.update.mockResolvedValue({ id: 'user-123' });

      await repository.updateProps(user, props);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          name: 'Updated Name',
          email: 'updated@example.com',
          hashedPassword: 'newhashedpassword',
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should handle partial updates', async () => {
      const user = new User({
        id: 'user-123',
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
      });

      const props = {
        name: 'Updated Name Only',
      };

      mockPrismaService.user.update.mockResolvedValue({ id: 'user-123' });

      await repository.updateProps(user, props);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          name: 'Updated Name Only',
          email: undefined,
          hashedPassword: undefined,
          updatedAt: expect.any(Date),
        },
      });
    });
  });

  describe('findByEmail', () => {
    it('should successfully find user by email without password', async () => {
      const email = 'test@example.com';

      const mockPrismaUser = {
        id: 'user-123',
        email: email,
        username: 'testuser',
        name: 'Test User',
        image: 'https://example.com/image.jpg',
        hashedPassword: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await repository.findByEmail(email);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        select: expect.any(Object),
      });
      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe(email);
      expect(result?.password).toBeUndefined(); // Password should be removed
    });

    it('should successfully find user by email with password', async () => {
      const email = 'test@example.com';

      const mockPrismaUser = {
        id: 'user-123',
        email: email,
        username: 'testuser',
        name: 'Test User',
        image: null,
        hashedPassword: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await repository.findByEmail(email, true);

      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe(email);
      expect(result?.password).toBe('hashedpassword'); // Password should be included
    });

    it('should return null when user not found by email', async () => {
      const email = 'nonexistent@example.com';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail(email);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        select: expect.any(Object),
      });
      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should successfully find user by username', async () => {
      const username = 'testuser';

      const mockPrismaUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: username,
        name: 'Test User',
        image: null,
        hashedPassword: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await repository.findByUsername(username);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username },
        select: expect.any(Object),
      });
      expect(result).toBeInstanceOf(User);
      expect(result?.props.username).toBe(username);
    });

    it('should return null when user not found by username', async () => {
      const username = 'nonexistentuser';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByUsername(username);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username },
        select: expect.any(Object),
      });
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should successfully find user by ID', async () => {
      const userId = 'user-123';

      const mockPrismaUser = {
        id: userId,
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
        image: null,
        hashedPassword: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await repository.findById(userId);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: expect.any(Object),
      });
      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe(userId);
    });

    it('should return null when user not found by ID', async () => {
      const userId = 'nonexistent-user';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findById(userId);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: expect.any(Object),
      });
      expect(result).toBeNull();
    });
  });

  describe('findByProvider', () => {
    it('should successfully find user by OAuth provider', async () => {
      const provider = 'google';
      const providerId = 'google-123';

      const mockAccount = {
        id: 'account-123',
        provider: provider,
        providerAccountId: providerId,
        user: {
          id: 'user-123',
          email: 'test@gmail.com',
          username: 'testuser',
          name: 'Test User',
          image: 'https://example.com/image.jpg',
          hashedPassword: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockPrismaService.account.findUnique.mockResolvedValue(mockAccount);

      const result = await repository.findByProvider(provider, providerId);

      expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
        where: {
          provider_providerAccountId: {
            provider: provider,
            providerAccountId: providerId,
          },
        },
        include: {
          user: {
            select: expect.any(Object),
          },
        },
      });
      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe('test@gmail.com');
    });

    it('should return null when account not found', async () => {
      const provider = 'github';
      const providerId = 'github-123';

      mockPrismaService.account.findUnique.mockResolvedValue(null);

      const result = await repository.findByProvider(provider, providerId);

      expect(mockPrismaService.account.findUnique).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when account exists but user not found', async () => {
      const provider = 'google';
      const providerId = 'google-123';

      const mockAccount = {
        id: 'account-123',
        provider: provider,
        providerAccountId: providerId,
        user: null,
      };

      mockPrismaService.account.findUnique.mockResolvedValue(mockAccount);

      const result = await repository.findByProvider(provider, providerId);

      expect(result).toBeNull();
    });
  });

  describe('linkOAuthAccount', () => {
    it('should successfully link OAuth account to user', async () => {
      const userId = 'user-123';
      const provider = 'google';
      const providerId = 'google-123';

      const mockPrismaUser = {
        id: userId,
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
        image: null,
        hashedPassword: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.account.create.mockResolvedValue({ id: 'account-123' });
      mockPrismaService.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await repository.linkOAuthAccount(
        userId,
        provider,
        providerId,
      );

      expect(mockPrismaService.account.create).toHaveBeenCalledWith({
        data: {
          userId: userId,
          provider: provider,
          providerAccountId: providerId,
          type: 'oauth',
        },
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: expect.any(Object),
      });
      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe(userId);
    });

    it('should throw error when user not found after linking', async () => {
      const userId = 'nonexistent-user';
      const provider = 'google';
      const providerId = 'google-123';

      mockPrismaService.account.create.mockResolvedValue({ id: 'account-123' });
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        repository.linkOAuthAccount(userId, provider, providerId),
      ).rejects.toThrow('User not found');
    });
  });

  describe('create', () => {
    it('should successfully create a new user', async () => {
      const props = {
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
        password: 'hashedpassword',
      };

      const mockPrismaUser = {
        id: 'user-123',
        email: props.email,
        username: props.username,
        name: props.name,
        image: null,
        hashedPassword: props.password,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.create.mockResolvedValue(mockPrismaUser);

      const result = await repository.create(props);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: props.email,
          username: props.username,
          name: props.name,
          image: undefined,
          hashedPassword: props.password,
        },
        select: expect.any(Object),
      });
      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe(props.email);
    });

    it('should successfully create user with OAuth provider', async () => {
      const props = {
        email: 'test@gmail.com',
        username: 'testuser',
        name: 'Test User',
        image: 'https://example.com/image.jpg',
        provider: 'google',
        providerId: 'google-123',
      };

      const mockPrismaUser = {
        id: 'user-123',
        email: props.email,
        username: props.username,
        name: props.name,
        image: props.image,
        hashedPassword: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.create.mockResolvedValue(mockPrismaUser);
      mockPrismaService.account.create.mockResolvedValue({ id: 'account-123' });

      const result = await repository.create(props);

      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockPrismaService.account.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          provider: props.provider,
          providerAccountId: props.providerId,
          type: 'oauth',
        },
      });
      expect(result).toBeInstanceOf(User);
    });

    it('should use avatar as image when image is not provided', async () => {
      const props = {
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
      };

      const mockPrismaUser = {
        id: 'user-123',
        email: props.email,
        username: props.username,
        name: props.name,
        image: props.avatar,
        hashedPassword: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.create.mockResolvedValue(mockPrismaUser);

      await repository.create(props);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          image: props.avatar,
        }),
        select: expect.any(Object),
      });
    });

    it('should not create OAuth account when provider not provided', async () => {
      const props = {
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
        password: 'hashedpassword',
      };

      const mockPrismaUser = {
        id: 'user-123',
        email: props.email,
        username: props.username,
        name: props.name,
        image: null,
        hashedPassword: props.password,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.create.mockResolvedValue(mockPrismaUser);

      await repository.create(props);

      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockPrismaService.account.create).not.toHaveBeenCalled();
    });
  });

  describe('toDomain', () => {
    it('should correctly convert Prisma user to Domain user', async () => {
      const mockPrismaUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
        image: 'https://example.com/image.jpg',
        hashedPassword: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await repository.findById('user-123');

      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe('user-123');
      expect(result?.email).toBe('test@example.com');
      expect(result?.name).toBe('Test User');
      expect(result?.props.username).toBe('testuser');
      expect(result?.password).toBe('hashedpassword');
    });

    it('should handle null image', async () => {
      const mockPrismaUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
        image: null,
        hashedPassword: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await repository.findById('user-123');

      expect(result).toBeInstanceOf(User);
      expect(result?.props).toHaveProperty('image', null);
    });

    it('should handle undefined password', async () => {
      const mockPrismaUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
        image: null,
        hashedPassword: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await repository.findById('user-123');

      expect(result).toBeInstanceOf(User);
      expect(result?.password).toBeUndefined();
    });
  });
});
