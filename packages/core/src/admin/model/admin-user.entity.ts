import { Entity } from '../../shared/entity';

/**
 * Properties for AdminUser entity
 */
export interface AdminUserProps {
  id: string;
  email: string;
  hashedPassword: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * AdminUser entity represents admin panel users
 *
 * Simple entity for admin authentication and authorization.
 * No complex business logic, just basic CRUD.
 *
 * @example
 * ```typescript
 * const admin = new AdminUser({
 *   id: 'admin-123',
 *   email: 'admin@example.com',
 *   hashedPassword: 'hash',
 *   name: 'Admin User',
 *   role: 'admin',
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 * });
 *
 * admin.isSuperAdmin(); // depends on role
 * ```
 */
export class AdminUser extends Entity<AdminUserProps> {
  constructor(props: AdminUserProps, mode: 'valid' | 'draft' = 'valid') {
    super(props, mode);
    if (mode === 'valid') {
      this.validate();
    }
  }

  private validate(): void {
    if (!this.props.email || this.props.email.trim() === '') {
      throw new Error('AdminUser must have a valid email');
    }
    if (!this.props.hashedPassword || this.props.hashedPassword.trim() === '') {
      throw new Error('AdminUser must have a hashedPassword');
    }
    if (!this.props.name || this.props.name.trim() === '') {
      throw new Error('AdminUser must have a name');
    }
  }

  // ===== Getters =====
  get email(): string {
    return this.props.email;
  }

  get hashedPassword(): string {
    return this.props.hashedPassword;
  }

  get name(): string {
    return this.props.name;
  }

  get role(): string {
    return this.props.role;
  }

  // ===== Business Methods =====

  /**
   * Check if user is super admin
   */
  isSuperAdmin(): boolean {
    return this.props.role === 'superadmin';
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    return this.props.role === role;
  }
}
