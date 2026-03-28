import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

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
