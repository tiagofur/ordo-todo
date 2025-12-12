import {
  IsEmail,
  IsString,
  IsOptional,
  IsArray,
  IsObject,
} from 'class-validator';

export class SendEmailDto {
  @IsEmail()
  to: string;

  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  cc?: string[];

  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  bcc?: string[];

  @IsString()
  subject: string;

  @IsString()
  text?: string;

  @IsString()
  @IsOptional()
  html?: string;

  @IsObject()
  @IsOptional()
  template?: {
    name: string;
    data: Record<string, any>;
  };

  @IsObject()
  @IsOptional()
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}
