import { IsEnum, IsString, IsOptional } from 'class-validator';

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
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  referenceId?: number;
}

export class UpdateNotificationPrefsDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  isEnabled: boolean;
}
