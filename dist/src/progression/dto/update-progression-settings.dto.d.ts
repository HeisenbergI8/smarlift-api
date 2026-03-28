export declare enum ProgressionFrequency {
    WEEKLY = "weekly",
    BIWEEKLY = "biweekly",
    MONTHLY = "monthly"
}
export declare enum ProgressionTrainingGoal {
    STRENGTH = "strength",
    HYPERTROPHY = "hypertrophy",
    ENDURANCE = "endurance"
}
export declare class UpdateProgressionSettingsDto {
    isEnabled?: boolean;
    progressionFrequency?: ProgressionFrequency;
    trainingGoal?: ProgressionTrainingGoal;
    weightIncrementKg?: number;
    maxRepsBeforeIncrease?: number;
}
