import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsDateString,
  Min,
  Max,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum WorkoutTrainingGoal {
  STRENGTH = 'strength',
  HYPERTROPHY = 'hypertrophy',
  ENDURANCE = 'endurance',
  GENERAL = 'general',
}

export class CreatePlanExerciseDto {
  @IsInt()
  exerciseId!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  sortOrder?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  targetSets?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  targetRepsMin?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  targetRepsMax?: number;

  @IsOptional()
  @IsNumber()
  targetWeightKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  targetRpe?: number;

  @IsOptional()
  @IsInt()
  restSeconds?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePlanDayDto {
  @IsInt()
  @Min(1)
  dayNumber!: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isRestDay?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlanExerciseDto)
  exercises?: CreatePlanExerciseDto[];
}

export class CreateWorkoutPlanDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(WorkoutTrainingGoal)
  trainingGoal?: WorkoutTrainingGoal;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  daysPerWeek?: number;

  @IsOptional()
  @IsInt()
  durationWeeks?: number;

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlanDayDto)
  days?: CreatePlanDayDto[];
}
