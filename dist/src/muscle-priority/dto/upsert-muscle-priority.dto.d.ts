export declare enum PriorityLevel {
    LOW = "low",
    NORMAL = "normal",
    HIGH = "high"
}
export declare class UpsertMusclePriorityDto {
    muscleGroupId: number;
    priorityLevel?: PriorityLevel;
    hasImbalance?: boolean;
    notes?: string;
}
