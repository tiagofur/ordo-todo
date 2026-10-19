import {
  ArrayNotEmpty,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterOAuthClientDto {
  @IsString()
  @MinLength(1)
  client_name: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  redirect_uris: string[];

  @IsString()
  @IsOptional()
  scope?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  client_uri?: string;
}
