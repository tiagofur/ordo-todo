import { User, UserProps } from "../model/user.entity";

/**
 * Properties required to create a new user (including OAuth users)
 */
export interface CreateUserProps {
  name: string;
  email: string;
  username: string;
  image?: string | null;
  provider?: string;
  providerId?: string;
}

export default interface UserRepository {
  save(user: User): Promise<void>;
  updateProps(user: User, props: Partial<UserProps>): Promise<void>;
  findByEmail(email: string, withPassword?: boolean): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByProvider(provider: string, providerId: string): Promise<User | null>;
  linkOAuthAccount(
    userId: string,
    provider: string,
    providerId: string,
  ): Promise<User>;
  create(props: CreateUserProps): Promise<User>;
}
