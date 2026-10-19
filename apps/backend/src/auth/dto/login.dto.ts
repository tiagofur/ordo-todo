import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  /**
   * Email address OR username. The field keeps the name `email` so existing
   * clients (web, mobile, desktop) remain backward compatible.
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
