import { Injectable, Inject } from '@nestjs/common';
import type { UserRepository } from '@ordo-todo/core';
import { UserByEmail, ChangeUserName } from '@ordo-todo/core';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async getMe(email: string) {
    const userByEmailUseCase = new UserByEmail(this.userRepository);
    const user = await userByEmailUseCase.execute(email);
    return user?.props;
  }

  async updateProfile(email: string, updateProfileDto: UpdateProfileDto) {
    const userByEmailUseCase = new UserByEmail(this.userRepository);
    const user = await userByEmailUseCase.execute(email);

    if (!user) {
      throw new Error('User not found');
    }

    const changeUserNameUseCase = new ChangeUserName(this.userRepository);
    await changeUserNameUseCase.execute(updateProfileDto.name, user);

    return { success: true };
  }
}
