import { PrismaService } from '@ordo-todo/db';
import { JwtService } from '@nestjs/jwt';
import { createTestUser } from './test-data.factory';

/**
 * Generates a JWT token for a test user
 *
 * @param prisma - PrismaService instance
 * @param jwtService - JwtService instance
 * @param userId - Optional user ID (creates new user if not provided)
 * @returns Auth token and user data
 */
export async function generateAuthToken(
  prisma: PrismaService,
  jwtService: JwtService,
  userId?: string,
) {
  let user;

  if (userId) {
    user = await prisma.user.findUnique({ where: { id: userId } });
  } else {
    user = await createTestUser(prisma);
  }

  if (!user) {
    throw new Error('User not found');
  }

  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
  };

  const token = jwtService.sign(payload);

  return {
    token,
    user,
  };
}

/**
 * Creates authorization headers for requests
 *
 * @param token - JWT token
 * @returns Headers object with Authorization
 */
export function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}
