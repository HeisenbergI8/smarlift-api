export declare enum NotificationType {
    WORKOUT_REMINDER = "workout_reminder",
    MISSED_SESSION = "missed_session",
    NUTRITION_REMINDER = "nutrition_reminder",
    EGO_LIFT_WARNING = "ego_lift_warning",
    PROGRESSION_UPDATE = "progression_update",
    MILESTONE = "milestone",
    GENERAL = "general"
}
export declare class CreateNotificationDto {
    type: NotificationType;
    title: string;
    message: string;
    referenceType?: string;
    referenceId?: number;
}
export declare class UpdateNotificationPrefsDto {
    type: NotificationType;
    isEnabled: boolean;
}
