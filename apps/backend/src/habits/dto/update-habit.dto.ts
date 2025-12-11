import { PartialType } from '@nestjs/mapped-types';
import { CreateHabitDto } from './create-habit.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateHabitDto extends PartialType(CreateHabitDto) {
    @IsBoolean()
    @IsOptional()
    isPaused?: boolean;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
