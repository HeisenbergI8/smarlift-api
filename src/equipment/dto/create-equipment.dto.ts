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
