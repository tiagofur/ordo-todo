/**
 * User-related types and DTOs
 */

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileDto {
  name?: string;
  image?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}
