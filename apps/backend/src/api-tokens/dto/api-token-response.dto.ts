import { ApiProperty } from '@nestjs/swagger';

export class ApiTokenResponseDto {
  @ApiProperty({ example: 'clx123abc' })
  id: string;

  @ApiProperty({ example: 'CI deploy' })
  name: string;

  @ApiProperty({
    example: 'a1b2c3d4',
    description: 'Last 8 characters of the token, for identification only',
  })
  tokenPrefix: string;

  @ApiProperty({ example: ['read', 'tasks:write'] })
  scopes: string[];

  @ApiProperty()
  createdAt: Date;
}

export class CreatedApiTokenResponseDto extends ApiTokenResponseDto {
  @ApiProperty({
    example: 'ordo_pat_...',
    description:
      'Full token secret. Shown only once at creation; it is never stored in clear text.',
  })
  token: string;
}
