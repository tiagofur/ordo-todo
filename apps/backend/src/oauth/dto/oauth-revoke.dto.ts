import { IsOptional, IsString } from 'class-validator';

export class OAuthRevokeDto {
  @IsString()
  token: string;

  @IsString()
  @IsOptional()
  client_id?: string;
}
