import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Account, AccountRepository, AccountInput } from '@ordo-todo/core';

@Injectable()
export class PrismaAccountRepository implements AccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: AccountInput): Promise<Account> {
    const data = await this.prisma.account.create({
      data: {
        userId: input.userId,
        type: input.type,
        provider: input.provider,
        providerAccountId: input.providerAccountId,
        refresh_token: input.refresh_token,
        access_token: input.access_token,
        expires_at: input.expires_at,
        token_type: input.token_type,
        scope: input.scope,
        id_token: input.id_token,
        session_state: input.session_state,
      },
    });

    return this.toDomain(data);
  }

  async findById(id: string): Promise<Account | null> {
    const data = await this.prisma.account.findUnique({
      where: { id },
    });

    return data ? this.toDomain(data) : null;
  }

  async findByUserId(userId: string): Promise<Account[]> {
    const accounts = await this.prisma.account.findMany({
      where: { userId },
    });

    return accounts.map((a) => this.toDomain(a));
  }

  async findByProvider(provider: string): Promise<Account[]> {
    const accounts = await this.prisma.account.findMany({
      where: { provider },
    });

    return accounts.map((a) => this.toDomain(a));
  }

  async update(id: string, input: Partial<AccountInput>): Promise<Account> {
    const data = await this.prisma.account.update({
      where: { id },
      data: {
        access_token: input.access_token,
        refresh_token: input.refresh_token,
        expires_at: input.expires_at,
        token_type: input.token_type,
        scope: input.scope,
        id_token: input.id_token,
        session_state: input.session_state,
      },
    });

    return this.toDomain(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.account.delete({
      where: { id },
    });
  }

  private toDomain(prismaAccount: any): Account {
    return new Account({
      id: prismaAccount.id,
      userId: prismaAccount.userId,
      type: prismaAccount.type,
      provider: prismaAccount.provider,
      providerAccountId: prismaAccount.providerAccountId,
      refresh_token: prismaAccount.refresh_token,
      access_token: prismaAccount.access_token,
      expires_at: prismaAccount.expires_at,
      token_type: prismaAccount.token_type,
      scope: prismaAccount.scope,
      id_token: prismaAccount.id_token,
      session_state: prismaAccount.session_state,
    });
  }
}
