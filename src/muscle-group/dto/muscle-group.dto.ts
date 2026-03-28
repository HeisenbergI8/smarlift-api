import {
  IsOptional,
  IsEnum,
  IsString,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export enum BodyRegion {
  UPPER_BODY = 'upper_body',
  LOWER_BODY = 'lower_body',
  CORE = 'core',
  FULL_BODY = 'full_body',
}

export class FindMuscleGroupsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(BodyRegion)
  bodyRegion?: BodyRegion;
}

export class CreateMuscleGroupDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsEnum(BodyRegion)
  bodyRegion: BodyRegion;
}

export class UpdateMuscleGroupDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEnum(BodyRegion)
  bodyRegion?: BodyRegion;
}
