import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsBoolean,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Match } from '../../common';

export enum AccountType {
  USER = 'user',
  COACH = 'coach',
}

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @Match('password')
  confirmPassword!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsOptional()
  @IsBoolean()
  isCoachMode?: boolean;

  @IsOptional()
  @IsEnum(AccountType)
  accountType?: AccountType;
}
