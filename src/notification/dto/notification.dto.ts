import {
  IsEnum,
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsPositive,
  MaxLength,
} from 'class-validator';

export enum NotificationType {
  WORKOUT_REMINDER = 'workout_reminder',
  MISSED_SESSION = 'missed_session',
  NUTRITION_REMINDER = 'nutrition_reminder',
  EGO_LIFT_WARNING = 'ego_lift_warning',
  PROGRESSION_UPDATE = 'progression_update',
  MILESTONE = 'milestone',
  GENERAL = 'general',
}

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @MaxLength(5000)
  message: string;

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  referenceId?: number;
}

export class UpdateNotificationPrefsDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsBoolean()
  isEnabled: boolean;
}
