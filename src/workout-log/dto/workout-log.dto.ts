import {
  IsOptional,
  IsInt,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsBoolean,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export enum SessionStatusFilter {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

export class SessionQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(SessionStatusFilter)
  status?: SessionStatusFilter;
}

export class LogSetDto {
  @IsInt()
  exerciseId!: number;

  @IsInt()
  @Min(1)
  setNumber!: number;

  @IsInt()
  @Min(0)
  reps!: number;

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

export class SkipSessionDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
