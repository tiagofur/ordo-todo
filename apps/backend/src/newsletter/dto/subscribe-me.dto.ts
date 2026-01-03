import { IsEmail, IsOptional } from 'class-validator';

export class SubscribeMeDto {
  @IsOptional()
  @IsEmail()
  email?: string;
}
