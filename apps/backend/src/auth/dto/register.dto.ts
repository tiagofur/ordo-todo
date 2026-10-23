import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @Matches(/^[a-z0-9_-]+$/, {
    message:
      'Username can only contain lowercase letters, numbers, hyphens, and underscores',
  })
  username: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100, { message: 'Password must be less than 100 characters' })
  @Matches(/^(?=.*[a-z])/, {
    message: 'Password must contain at least one lowercase letter',
  })
  @Matches(/^(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/^(?=.*\d)/, {
    message: 'Password must contain at least one number',
  })
  @Matches(/^(?=.*[\W_])/, {
    message: 'Password must contain at least one special character',
  })
  password: string;

  @IsString()
  @MinLength(1, { message: 'Name is required' })
  @MaxLength(100, { message: 'Name must be less than 100 characters' })
  name: string;

  // ODD 019: required by the service while REGISTRATION_MODE=invite-only
  // (kept optional in the DTO so the error stays machine-readable).
  @IsOptional()
  @IsString()
  @MaxLength(32, { message: 'Invite code must be less than 32 characters' })
  inviteCode?: string;
}
