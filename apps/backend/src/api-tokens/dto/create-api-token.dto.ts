import {
  ArrayNotEmpty,
  IsArray,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateApiTokenDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  scopes: string[];
}
