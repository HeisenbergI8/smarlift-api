import {
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsInt,
  Min,
} from 'class-validator';

export enum ProgressionFrequency {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
}

export enum ProgressionTrainingGoal {
  STRENGTH = 'strength',
  HYPERTROPHY = 'hypertrophy',
  ENDURANCE = 'endurance',
}

export class UpdateProgressionSettingsDto {
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsEnum(ProgressionFrequency)
  progressionFrequency?: ProgressionFrequency;

  @IsOptional()
  @IsEnum(ProgressionTrainingGoal)
  trainingGoal?: ProgressionTrainingGoal;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weightIncrementKg?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxRepsBeforeIncrease?: number;
}
