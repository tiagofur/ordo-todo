import { UserIntegration } from '../model/user-integration.entity';
import { IntegrationProvider } from '@prisma/client';

export interface UserIntegrationInput {
  userId: string;
  provider: IntegrationProvider;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string;
  providerUserId?: string;
  providerEmail?: string;
  settings?: Record<string, unknown>;
}

export interface UserIntegrationRepository {
  create(input: UserIntegrationInput): Promise<UserIntegration>;
  findById(id: string): Promise<UserIntegration | null>;
  findByUserAndProvider(
    userId: string,
    provider: IntegrationProvider
  ): Promise<UserIntegration | null>;
  findByUser(userId: string): Promise<UserIntegration[]>;
  update(id: string, input: Partial<UserIntegrationInput>): Promise<UserIntegration>;
  updateLastSync(id: string): Promise<UserIntegration>;
  deactivate(id: string): Promise<void>;
  delete(id: string): Promise<void>;
  findActive(): Promise<UserIntegration[]>;
  findExpiringSoon(): Promise<UserIntegration[]>;
}
