import { Account } from '../model/account.entity';

export interface AccountInput {
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}

export interface AccountRepository {
  create(input: AccountInput): Promise<Account>;
  findById(id: string): Promise<Account | null>;
  findByUserId(userId: string): Promise<Account[]>;
  findByProvider(provider: string): Promise<Account[]>;
  update(id: string, input: Partial<AccountInput>): Promise<Account>;
  delete(id: string): Promise<void>;
}
