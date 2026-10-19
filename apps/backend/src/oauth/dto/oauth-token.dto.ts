import { IsOptional, IsString, MinLength } from 'class-validator';

export class OAuthTokenDto {
  @IsString()
  grant_type: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  redirect_uri?: string;

  @IsString()
  @IsOptional()
  client_id?: string;

  @IsString()
  @IsOptional()
  code_verifier?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  refresh_token?: string;
}
