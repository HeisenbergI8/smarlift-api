import {
  IsInt,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export enum PriorityLevel {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
}

export class UpsertMusclePriorityDto {
  @IsInt()
  muscleGroupId: number;

  @IsOptional()
  @IsEnum(PriorityLevel)
  priorityLevel?: PriorityLevel;

  @IsOptional()
  @IsBoolean()
  hasImbalance?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
