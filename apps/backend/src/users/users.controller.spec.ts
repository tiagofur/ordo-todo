import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  };

  beforeEach(async () => {
    const mockUsersService = {
      getMe: jest.fn(),
      getFullProfile: jest.fn(),
      updateProfile: jest.fn(),
      updatePreferences: jest.fn(),
      getIntegrations: jest.fn(),
      exportData: jest.fn(),
      deleteAccount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(
      UsersService,
    ) as jest.Mocked<UsersService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMe', () => {
    it('should return current user', async () => {
      const mockUserData = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };
      usersService.getMe.mockResolvedValue(mockUserData as any);

      const result = await controller.getMe(mockUser);

      expect(usersService.getMe).toHaveBeenCalledWith(mockUser.email);
      expect(result).toEqual(mockUserData);
    });
  });

  describe('getProfile', () => {
    it('should return full user profile', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        preferences: { theme: 'dark' },
        subscription: null,
      };
      usersService.getFullProfile.mockResolvedValue(mockProfile as any);

      const result = await controller.getProfile(mockUser);

      expect(usersService.getFullProfile).toHaveBeenCalledWith(mockUser.email);
      expect(result).toEqual(mockProfile);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updateData = { name: 'Updated Name', avatar: 'new-avatar.png' };
      const updatedUser = { ...mockUser, ...updateData };
      usersService.updateProfile.mockResolvedValue(updatedUser as any);

      const result = await controller.updateProfile(
        mockUser,
        updateData as any,
      );

      expect(usersService.updateProfile).toHaveBeenCalledWith(
        mockUser.email,
        updateData,
      );
      expect(result).toEqual(updatedUser);
    });
  });

  describe('getPreferences', () => {
    it('should return user preferences', async () => {
      const mockProfile = {
        preferences: {
          theme: 'dark',
          language: 'es',
          notifications: true,
          defaultWorkDuration: 25,
        },
      };
      usersService.getFullProfile.mockResolvedValue(mockProfile as any);

      const result = await controller.getPreferences(mockUser);

      expect(usersService.getFullProfile).toHaveBeenCalledWith(mockUser.email);
      expect(result).toEqual(mockProfile.preferences);
    });
  });

  describe('updatePreferences', () => {
    it('should update user preferences', async () => {
      const preferencesData = {
        theme: 'light',
        defaultWorkDuration: 30,
      };
      const updatedPreferences = { ...preferencesData, language: 'es' };
      usersService.updatePreferences.mockResolvedValue(
        updatedPreferences as any,
      );

      const result = await controller.updatePreferences(
        mockUser,
        preferencesData as any,
      );

      expect(usersService.updatePreferences).toHaveBeenCalledWith(
        mockUser.email,
        preferencesData,
      );
      expect(result).toEqual(updatedPreferences);
    });
  });

  describe('getIntegrations', () => {
    it('should return user integrations', async () => {
      const mockIntegrations = [
        { id: 'int-1', provider: 'google', connected: true },
      ];
      usersService.getIntegrations.mockResolvedValue(mockIntegrations as any);

      const result = await controller.getIntegrations(mockUser);

      expect(usersService.getIntegrations).toHaveBeenCalledWith(mockUser.email);
      expect(result).toEqual(mockIntegrations);
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      usersService.deleteAccount.mockResolvedValue({ success: true } as any);

      const result = await controller.deleteAccount(mockUser);

      expect(usersService.deleteAccount).toHaveBeenCalledWith(mockUser.email);
    });
  });
});
