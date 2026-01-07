import { AdminUser } from '../model/admin-user.entity';

export interface AdminUserInput {
  email: string;
  hashedPassword: string;
  name: string;
  role?: string;
}

export interface AdminUserRepository {
  create(input: AdminUserInput): Promise<AdminUser>;
  findById(id: string): Promise<AdminUser | null>;
  findByEmail(email: string): Promise<AdminUser | null>;
  update(id: string, input: Partial<AdminUserInput>): Promise<AdminUser>;
  delete(id: string): Promise<void>;
  findAll(): Promise<AdminUser[]>;
}
