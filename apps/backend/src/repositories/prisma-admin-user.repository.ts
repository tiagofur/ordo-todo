import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  AdminUser,
  AdminUserRepository,
  AdminUserInput,
} from '@ordo-todo/core';

@Injectable()
export class PrismaAdminUserRepository implements AdminUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: AdminUserInput): Promise<AdminUser> {
    const data = await this.prisma.adminUser.create({
      data: {
        email: input.email,
        hashedPassword: input.hashedPassword,
        name: input.name,
        role: input.role || 'admin',
      },
    });

    return this.toDomain(data);
  }

  async findById(id: string): Promise<AdminUser | null> {
    const data = await this.prisma.adminUser.findUnique({
      where: { id },
    });

    return data ? this.toDomain(data) : null;
  }

  async findByEmail(email: string): Promise<AdminUser | null> {
    const data = await this.prisma.adminUser.findUnique({
      where: { email },
    });

    return data ? this.toDomain(data) : null;
  }

  async update(id: string, input: Partial<AdminUserInput>): Promise<AdminUser> {
    const data = await this.prisma.adminUser.update({
      where: { id },
      data: {
        email: input.email,
        hashedPassword: input.hashedPassword,
        name: input.name,
        role: input.role,
      },
    });

    return this.toDomain(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.adminUser.delete({
      where: { id },
    });
  }

  async findAll(): Promise<AdminUser[]> {
    const admins = await this.prisma.adminUser.findMany();

    return admins.map((a) => this.toDomain(a));
  }

  private toDomain(prismaAdmin: any): AdminUser {
    return new AdminUser({
      id: prismaAdmin.id,
      email: prismaAdmin.email,
      hashedPassword: prismaAdmin.hashedPassword,
      name: prismaAdmin.name,
      role: prismaAdmin.role,
      createdAt: prismaAdmin.createdAt,
      updatedAt: prismaAdmin.updatedAt,
    });
  }
}
