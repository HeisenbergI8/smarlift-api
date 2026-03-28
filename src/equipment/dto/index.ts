export * from './sync-equipment.dto';
export * from './find-equipment-query.dto';

import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateEquipmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

export class UpdateEquipmentDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
