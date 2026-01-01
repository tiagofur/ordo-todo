import { User, UserProps } from "../model/user.entity";

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
  create(props: Partial<UserProps>): Promise<User>;
}
