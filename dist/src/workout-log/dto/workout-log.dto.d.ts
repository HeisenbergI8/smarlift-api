export declare class LogSetDto {
    exerciseId: number;
    setNumber: number;
    reps: number;
    weightKg?: number;
    rpe?: number;
    isWarmup?: boolean;
    notes?: string;
}
export declare class StartSessionDto {
    workoutPlanDayId?: number;
    notes?: string;
}
export declare class CompleteSessionDto {
    notes?: string;
}
