import { Injectable } from '@nestjs/common';
import { User as PrismaUser } from '@prisma/client';
import { User, UserRepository } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaUser: PrismaUser): User {
    return new User({
      id: prismaUser.id,
      name: prismaUser.name ?? undefined,
      email: prismaUser.email,
      password: (prismaUser as any).hashedPassword ?? undefined,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }

  async save(user: User): Promise<void> {
    const data = {
      id: user.id,
      name: user.name,
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

  async findByEmail(
    email: string,
    withPassword?: boolean,
  ): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const domainUser = this.toDomain(user);
    if (!withPassword) {
      return domainUser.withoutPassword();
    }
    return domainUser;
  }
}
