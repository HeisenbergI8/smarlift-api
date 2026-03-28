import {
  IsOptional,
  IsInt,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LogSetDto {
  @IsInt()
  exerciseId: number;

  @IsInt()
  @Min(1)
  setNumber: number;

  @IsInt()
  @Min(0)
  reps: number;

  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  rpe?: number;

  @IsOptional()
  @IsBoolean()
  isWarmup?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class StartSessionDto {
  @IsOptional()
  @IsInt()
  workoutPlanDayId?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CompleteSessionDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
