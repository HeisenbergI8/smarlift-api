export * from './find-exercises-query.dto';

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  IsInt,
  MaxLength,
} from 'class-validator';
import {
  ExerciseCategory,
  ExerciseDifficulty,
} from './find-exercises-query.dto';

export class CreateExerciseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ExerciseCategory)
  category?: ExerciseCategory;

  @IsOptional()
  @IsEnum(ExerciseDifficulty)
  difficulty?: ExerciseDifficulty;

  @IsOptional()
  @IsBoolean()
  isBodyweight?: boolean;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  muscleGroupIds?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  equipmentIds?: number[];
}

export class UpdateExerciseDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ExerciseCategory)
  category?: ExerciseCategory;

  @IsOptional()
  @IsEnum(ExerciseDifficulty)
  difficulty?: ExerciseDifficulty;

  @IsOptional()
  @IsBoolean()
  isBodyweight?: boolean;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  muscleGroupIds?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  equipmentIds?: number[];
}
