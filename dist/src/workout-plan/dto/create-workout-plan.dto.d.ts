export declare enum WorkoutTrainingGoal {
    STRENGTH = "strength",
    HYPERTROPHY = "hypertrophy",
    ENDURANCE = "endurance",
    GENERAL = "general"
}
export declare class CreatePlanExerciseDto {
    exerciseId: number;
    sortOrder?: number;
    targetSets?: number;
    targetRepsMin?: number;
    targetRepsMax?: number;
    targetWeightKg?: number;
    targetRpe?: number;
    restSeconds?: number;
    notes?: string;
}
export declare class CreatePlanDayDto {
    dayNumber: number;
    name?: string;
    isRestDay?: boolean;
    exercises?: CreatePlanExerciseDto[];
}
export declare class CreateWorkoutPlanDto {
    name: string;
    description?: string;
    trainingGoal?: WorkoutTrainingGoal;
    daysPerWeek?: number;
    durationWeeks?: number;
    startedAt?: string;
    days?: CreatePlanDayDto[];
}
