import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { TokenBlacklistService } from './token-blacklist.service';
import { RedisService } from '../cache/redis.service';
import { ConfigService } from '@nestjs/config';

describe('TokenBlacklistService', () => {
  let service: TokenBlacklistService;
  let jwtService: JwtService;
  let redisService: RedisService;

  // Mock token for testing
  const mockToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTksImp0aSI6InRva2VuLTEyMyJ0.test';

  beforeEach(async () => {
    const mockRedisService = {
      set: jest.fn(),
      exists: jest.fn(),
      delPattern: jest.fn(),
      healthCheck: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenBlacklistService,
        JwtService,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TokenBlacklistService>(TokenBlacklistService);
    jwtService = module.get<JwtService>(JwtService);
    redisService = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('blacklist', () => {
    it('should blacklist a valid token with expiration', async () => {
      // Mock JWT decode to return a valid payload with future expiration
      jest.spyOn(jwtService, 'decode').mockReturnValue({
        sub: 'user-123',
        jti: 'token-123',
        exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
      });

      await service.blacklist(mockToken);

      // Verify Redis set was called with correct parameters
      expect(redisService.set).toHaveBeenCalledWith(
        'blacklist:token:token-123',
        true,
        expect.any(Number), // TTL should be around 3600 seconds
      );
    });

    it('should not blacklist an already expired token', async () => {
      // Mock JWT decode to return an expired token
      jest.spyOn(jwtService, 'decode').mockReturnValue({
        sub: 'user-123',
        jti: 'token-123',
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
      });

      await service.blacklist(mockToken);

      // Verify Redis set was NOT called
      expect(redisService.set).not.toHaveBeenCalled();
    });

    it('should handle invalid token format gracefully', async () => {
      // Mock JWT decode to return null (invalid token)
      jest.spyOn(jwtService, 'decode').mockReturnValue(null);

      await expect(service.blacklist('invalid-token')).resolves.not.toThrow();

      // Verify Redis set was NOT called
      expect(redisService.set).not.toHaveBeenCalled();
    });

    it('should handle tokens without JTI', async () => {
      // Mock JWT decode to return payload without JTI
      jest.spyOn(jwtService, 'decode').mockReturnValue({
        sub: 'user-123',
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      await service.blacklist(mockToken);

      // Verify Redis set was called with full token as key
      expect(redisService.set).toHaveBeenCalledWith(
        'blacklist:token:' + mockToken,
        true,
        expect.any(Number),
      );
    });
  });

  describe('isBlacklisted', () => {
    it('should return true for a blacklisted token', async () => {
      // Mock JWT decode
      jest.spyOn(jwtService, 'decode').mockReturnValue({
        sub: 'user-123',
        jti: 'token-123',
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      // Mock Redis exists to return true
      jest.spyOn(redisService, 'exists').mockResolvedValue(true);

      const result = await service.isBlacklisted(mockToken);

      expect(result).toBe(true);
      expect(redisService.exists).toHaveBeenCalledWith(
        'blacklist:token:token-123',
      );
    });

    it('should return false for a non-blacklisted token', async () => {
      // Mock JWT decode
      jest.spyOn(jwtService, 'decode').mockReturnValue({
        sub: 'user-123',
        jti: 'token-123',
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      // Mock Redis exists to return false
      jest.spyOn(redisService, 'exists').mockResolvedValue(false);

      const result = await service.isBlacklisted(mockToken);

      expect(result).toBe(false);
    });

    it('should return false for invalid token format', async () => {
      // Mock JWT decode to return null
      jest.spyOn(jwtService, 'decode').mockReturnValue(null);

      const result = await service.isBlacklisted('invalid-token');

      expect(result).toBe(false);
      expect(redisService.exists).not.toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should delete all blacklisted tokens', async () => {
      jest.spyOn(redisService, 'delPattern').mockResolvedValue(undefined);

      await service.cleanup();

      expect(redisService.delPattern).toHaveBeenCalledWith('blacklist:token:*');
    });
  });

  describe('getBlacklistSize', () => {
    it('should return -1 (unknown in Redis mode)', async () => {
      const size = await service.getBlacklistSize();

      expect(size).toBe(-1);
    });
  });

  describe('getHealthStatus', () => {
    it('should return healthy status when Redis is connected', async () => {
      jest.spyOn(redisService, 'healthCheck').mockResolvedValue({
        status: 'connected',
        latency: 5,
      });

      const status = await service.getHealthStatus();

      expect(status).toEqual({
        redis: true,
        message: 'Redis connected (latency: 5ms)',
      });
    });

    it('should return disconnected status when Redis is not connected', async () => {
      jest.spyOn(redisService, 'healthCheck').mockResolvedValue({
        status: 'disconnected',
      });

      const status = await service.getHealthStatus();

      expect(status).toEqual({
        redis: false,
        message: 'Redis disconnected',
      });
    });

    it('should handle health check errors gracefully', async () => {
      jest
        .spyOn(redisService, 'healthCheck')
        .mockRejectedValue(new Error('Redis error'));

      const status = await service.getHealthStatus();

      expect(status).toEqual({
        redis: false,
        message: 'Failed to check Redis health',
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete blacklist workflow', async () => {
      // Mock JWT decode
      jest.spyOn(jwtService, 'decode').mockReturnValue({
        sub: 'user-123',
        jti: 'token-123',
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      // Mock Redis operations
      jest.spyOn(redisService, 'set').mockResolvedValue(undefined);
      jest.spyOn(redisService, 'exists').mockResolvedValue(true);

      // Blacklist the token
      await service.blacklist(mockToken);

      // Check if it's blacklisted
      const isBlacklisted = await service.isBlacklisted(mockToken);

      expect(isBlacklisted).toBe(true);
      expect(redisService.set).toHaveBeenCalled();
      expect(redisService.exists).toHaveBeenCalled();
    });

    it('should handle token expiration correctly', async () => {
      // Mock JWT decode with token expiring very soon (10 seconds)
      const shortLivedExp = Math.floor(Date.now() / 1000) + 10;
      jest.spyOn(jwtService, 'decode').mockReturnValue({
        sub: 'user-123',
        jti: 'token-123',
        exp: shortLivedExp,
      });

      await service.blacklist(mockToken);

      // Verify TTL is approximately 10 seconds (allowing for test execution time)
      const setCall = (redisService.set as jest.Mock).mock.calls[0];
      const ttl = setCall[2];

      expect(ttl).toBeGreaterThan(5); // At least 5 seconds
      expect(ttl).toBeLessThanOrEqual(15); // At most 15 seconds
    });
  });
});
