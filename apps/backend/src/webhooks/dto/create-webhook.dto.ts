import {
  ArrayNotEmpty,
  IsArray,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateWebhookDto {
  @IsUrl({ require_protocol: true, protocols: ['https'] })
  @MaxLength(2000)
  url: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  events: string[];
}
