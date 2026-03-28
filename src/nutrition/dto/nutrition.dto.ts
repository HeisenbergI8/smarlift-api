import {
  IsOptional,
  IsInt,
  IsString,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateNutritionRecDto {
  @IsInt()
  @Min(0)
  dailyCaloriesKcal: number;

  @IsInt()
  @Min(0)
  proteinG: number;

  @IsInt()
  @Min(0)
  carbohydratesG: number;

  @IsInt()
  @Min(0)
  fatsG: number;

  @IsDateString()
  effectiveFrom: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class LogDailyNutritionDto {
  @IsDateString()
  logDate: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalCaloriesKcal?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  proteinG?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  carbohydratesG?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  fatsG?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
