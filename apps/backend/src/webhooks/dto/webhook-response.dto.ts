import { ApiProperty } from '@nestjs/swagger';

export class WebhookResponseDto {
  @ApiProperty({ example: 'clx123abc' })
  id: string;

  @ApiProperty({ example: 'https://receiver.test/hooks/ordo' })
  url: string;

  @ApiProperty({ example: ['task.created', 'task.completed'] })
  events: string[];

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;
}

export class CreatedWebhookResponseDto extends WebhookResponseDto {
  @ApiProperty({
    example: 'ordo_whsec_...',
    description:
      'Signing secret. Shown only once at creation; stored encrypted, never in clear text.',
  })
  secret: string;
}

export class WebhookDeliveryResponseDto {
  @ApiProperty({ example: 'clx456def' })
  id: string;

  @ApiProperty({ example: 'task.created' })
  event: string;

  @ApiProperty({ example: 'delivered' })
  status: string;

  @ApiProperty({ example: 1 })
  attempts: number;

  @ApiProperty({ required: false, nullable: true })
  lastError: string | null;

  @ApiProperty()
  createdAt: Date;
}
