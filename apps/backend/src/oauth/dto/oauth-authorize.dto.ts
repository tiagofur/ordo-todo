import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class OAuthAuthorizeDto {
  @IsString()
  client_id: string;

  @IsString()
  redirect_uri: string;

  @IsString()
  @IsOptional()
  scope?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  state?: string;

  @IsString()
  @MinLength(1)
  code_challenge: string;

  @IsString()
  @IsIn(['S256'])
  code_challenge_method: string;
}
