import { User } from "../model/user.entity";
import { UseCase, LoggedUser } from "../../shared/use-case";
import UserRepository from "../provider/user.repository";
import { PersonName } from "../../shared";

export default class ChangeUserName implements UseCase<string, void> {
  constructor(private readonly repo: UserRepository) {}

  async execute(newName: string, loggedUser?: LoggedUser): Promise<void> {
    if (!loggedUser) {
      throw new Error("User is required");
    }

    const validName = PersonName.create(newName).value;

    const existingUser = await this.repo.findByEmail(loggedUser.email);
    if (!existingUser) {
      throw new Error("Usuário não encontrado");
    }

    await this.repo.updateProps(existingUser, { name: validName });
  }
}
