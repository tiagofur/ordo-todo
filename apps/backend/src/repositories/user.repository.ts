import { Injectable } from '@nestjs/common';
import { User as PrismaUser } from '@prisma/client';
import { User, UserRepository, CreateUserProps } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Converts Prisma User model to Domain User entity
   *
   * Uses 'draft' mode to skip validation since Prisma data is already validated.
   * The password field is handled separately to avoid bcrypt hash validation errors.
   *
   * @param prismaUser - Prisma User model with hashedPassword field
   * @returns Domain User entity
   */
  private toDomain(prismaUser: PrismaUser & { hashedPassword?: string }): User {
    // Extract the password from hashedPassword field
    const password = prismaUser.hashedPassword ?? undefined;

    // Create User entity without password first (in draft mode)
    const user = new User(
      {
        id: prismaUser.id,
        name: prismaUser.name,
        username: prismaUser.username,
        email: prismaUser.email,
        image: prismaUser.image,
        createdAt: prismaUser.createdAt,
        updatedAt: prismaUser.updatedAt,
      },
      'draft', // Skip validation since data comes from database
    );

    // Set password separately if it exists
    if (password) {
      Object.defineProperty(user, 'password', {
        value: password,
        writable: false,
        enumerable: true,
        configurable: false,
      });
    }

    return user;
  }

  async save(user: User): Promise<void> {
    const data = {
      id: user.id,
      name: user.name,
      username: user.props.username,
      email: user.email,
      hashedPassword: user.password,
      updatedAt: (user.props as any).updatedAt,
    };

    await this.prisma.user.upsert({
      where: { id: user.id },
      create: data,
      update: data,
    });
  }

  async updateProps(user: User, props: Partial<any>): Promise<void> {
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: props.name,
        email: props.email,
        hashedPassword: props.password,
        updatedAt: new Date(),
      },
    });
  }

  // Define the select fields needed for domain conversion
  private readonly userSelectFields = {
    id: true,
    email: true,
    username: true,
    name: true,
    image: true,
    hashedPassword: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  async findByEmail(
    email: string,
    withPassword?: boolean,
  ): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: this.userSelectFields,
    });
    if (!user) return null;

    const domainUser = this.toDomain(user as any);
    if (!withPassword) {
      return domainUser.withoutPassword();
    }
    return domainUser;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: this.userSelectFields,
    });
    if (!user) return null;
    return this.toDomain(user as any);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelectFields,
    });
    if (!user) return null;
    return this.toDomain(user as any);
  }

  async findByProvider(
    provider: string,
    providerId: string,
  ): Promise<User | null> {
    const account = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId: providerId,
        },
      },
      include: {
        user: {
          select: this.userSelectFields,
        },
      },
    });

    if (!account || !account.user) return null;
    return this.toDomain(account.user as any);
  }

  async linkOAuthAccount(
    userId: string,
    provider: string,
    providerId: string,
  ): Promise<User> {
    await this.prisma.account.create({
      data: {
        userId,
        provider,
        providerAccountId: providerId,
        type: 'oauth',
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: this.userSelectFields,
    });

    if (!user) throw new Error('User not found');
    return this.toDomain(user as any);
  }

  async create(props: CreateUserProps): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: props.email,
        username: props.username,
        name: props.name,
        image: props.image,
        hashedPassword: undefined,
      },
      select: this.userSelectFields,
    });

    if (props.provider && props.providerId) {
      await this.prisma.account.create({
        data: {
          userId: user.id,
          provider: props.provider,
          providerAccountId: props.providerId,
          type: 'oauth',
        },
      });
    }

    return this.toDomain(user as any);
  }
}
