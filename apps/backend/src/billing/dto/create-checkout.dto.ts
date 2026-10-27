import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class CreateCheckoutDto {
  @ApiProperty({
    enum: ['pro', 'team'],
    description:
      'Plan a suscribir (Free no se compra; Enterprise se contrata aparte).',
  })
  @IsIn(['pro', 'team'])
  planId!: 'pro' | 'team';

  @ApiProperty({
    enum: ['month', 'year'],
    description: 'Ciclo de facturación (anual = -25%).',
  })
  @IsIn(['month', 'year'])
  interval!: 'month' | 'year';

  @ApiPropertyOptional({
    description: 'Asientos (solo Team; mínimo 2, máximo 999, por defecto 2).',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999)
  seats?: number;
}
