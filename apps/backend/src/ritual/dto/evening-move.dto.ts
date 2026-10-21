import { IsDateString, IsEnum, IsString, ValidateIf } from 'class-validator';

// ODD 006 S2 (T2): one pending task's destination in the evening ritual.
// `date` is required only when the destination is a specific date.
export enum EveningMoveDestination {
  TOMORROW = 'tomorrow',
  DATE = 'date',
  ARCHIVED = 'archived',
}

export enum EveningMoveReason {
  OVERRAN = 'overran',
  URGENT = 'urgent',
  NO_ENERGY = 'no-energy',
  OTHER = 'other',
}

export class EveningMoveDto {
  @IsString()
  taskId: string;

  @IsEnum(EveningMoveDestination)
  destination: EveningMoveDestination;

  @ValidateIf((o: EveningMoveDto) => o.destination === 'date')
  @IsDateString({ strict: true })
  date?: string;

  @IsEnum(EveningMoveReason)
  reason: EveningMoveReason;
}
