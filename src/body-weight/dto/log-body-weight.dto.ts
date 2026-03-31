import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
} from 'class-validator';

export enum BodyWeightSource {
  MANUAL = 'manual',
  SMART_SCALE = 'smart_scale',
  COACH = 'coach',
}

export class LogBodyWeightDto {
  @IsDateString()
  logDate: string;

  @IsNumber()
  @Min(1)
  weightKg: number;

  @IsOptional()
  @IsEnum(BodyWeightSource)
  source?: BodyWeightSource;
}
