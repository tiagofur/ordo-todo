import { User } from "../model/user.entity";
import CryptoProvider from "../provider/crypto.provider";
import { UseCase } from "../../shared/use-case";
import UserRepository from "../provider/user.repository";

import { UserAlreadyExistsError, DomainError } from "../../shared/errors";

type Input = {
  name: string;
  username: string;
  email: string;
  password: string;
};

export default class RegisterUser implements UseCase<Input, void> {
  constructor(
    private readonly repo: UserRepository,
    private readonly crypto: CryptoProvider,
  ) {}

  async execute(user: Input): Promise<void> {
    const existingUser = await this.repo.findByEmail(user.email);

    if (existingUser) {
      throw new UserAlreadyExistsError("Usuário já existe");
    }

    // Check if username is already taken
    const existingUsername = await this.repo.findByUsername(user.username);
    if (existingUsername) {
      throw new UserAlreadyExistsError("Nome de usuário já está em uso");
    }

    if (!user.password) {
      throw new DomainError("Senha é obrigatória", "INVALID_PASSWORD");
    }

    if (!user.username || user.username.length < 3) {
      throw new DomainError(
        "Nome de usuário deve ter pelo menos 3 caracteres",
        "INVALID_USERNAME",
      );
    }

    if (user.name?.length < 3) {
      throw new DomainError(
        "Nome deve ter pelo menos 3 caracteres",
        "INVALID_NAME",
      );
    }

    const hashedPassword = await this.crypto.encrypt(user.password!);
    const newUser = new User({
      name: user.name,
      username: user.username,
      email: user.email,
      password: hashedPassword,
    });
    await this.repo.save(newUser);
  }
}
