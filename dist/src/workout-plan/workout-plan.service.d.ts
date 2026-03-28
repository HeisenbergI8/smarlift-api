import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutPlanDto, UpdateWorkoutPlanDto } from './dto';
export declare class WorkoutPlanService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(userId: number, dto: CreateWorkoutPlanDto): Promise<{
        days: ({
            exercises: ({
                exercise: {
                    id: bigint;
                    name: string;
                    description: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    category: import("@prisma/client").$Enums.Exercise_category;
                    difficulty: import("@prisma/client").$Enums.Exercise_difficulty;
                    isBodyweight: boolean;
                };
            } & {
                id: bigint;
                createdAt: Date;
                updatedAt: Date;
                sortOrder: number;
                targetSets: number;
                targetRepsMin: number;
                targetRepsMax: number;
                targetWeightKg: import("@prisma/client-runtime-utils").Decimal | null;
                targetRpe: import("@prisma/client-runtime-utils").Decimal | null;
                restSeconds: number;
                notes: string | null;
                exerciseId: bigint;
                workoutPlanDayId: bigint;
            })[];
        } & {
            id: bigint;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            dayNumber: number;
            isRestDay: boolean;
            workoutPlanId: bigint;
        })[];
    } & {
        id: bigint;
        name: string;
        description: string | null;
        trainingGoal: import("@prisma/client").$Enums.WorkoutPlan_trainingGoal;
        daysPerWeek: number;
        durationWeeks: number | null;
        isActive: boolean;
        source: import("@prisma/client").$Enums.WorkoutPlan_source;
        startedAt: Date | null;
        endedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: bigint;
        createdBy: bigint | null;
    }>;
    findAllByUser(userId: number): Promise<({
        days: ({
            exercises: ({
                exercise: {
                    id: bigint;
                    name: string;
                    description: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    category: import("@prisma/client").$Enums.Exercise_category;
                    difficulty: import("@prisma/client").$Enums.Exercise_difficulty;
                    isBodyweight: boolean;
                };
            } & {
                id: bigint;
                createdAt: Date;
                updatedAt: Date;
                sortOrder: number;
                targetSets: number;
                targetRepsMin: number;
                targetRepsMax: number;
                targetWeightKg: import("@prisma/client-runtime-utils").Decimal | null;
                targetRpe: import("@prisma/client-runtime-utils").Decimal | null;
                restSeconds: number;
                notes: string | null;
                exerciseId: bigint;
                workoutPlanDayId: bigint;
            })[];
        } & {
            id: bigint;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            dayNumber: number;
            isRestDay: boolean;
            workoutPlanId: bigint;
        })[];
    } & {
        id: bigint;
        name: string;
        description: string | null;
        trainingGoal: import("@prisma/client").$Enums.WorkoutPlan_trainingGoal;
        daysPerWeek: number;
        durationWeeks: number | null;
        isActive: boolean;
        source: import("@prisma/client").$Enums.WorkoutPlan_source;
        startedAt: Date | null;
        endedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: bigint;
        createdBy: bigint | null;
    })[]>;
    findOne(userId: number, planId: number): Promise<{
        days: ({
            exercises: ({
                exercise: {
                    id: bigint;
                    name: string;
                    description: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    category: import("@prisma/client").$Enums.Exercise_category;
                    difficulty: import("@prisma/client").$Enums.Exercise_difficulty;
                    isBodyweight: boolean;
                };
            } & {
                id: bigint;
                createdAt: Date;
                updatedAt: Date;
                sortOrder: number;
                targetSets: number;
                targetRepsMin: number;
                targetRepsMax: number;
                targetWeightKg: import("@prisma/client-runtime-utils").Decimal | null;
                targetRpe: import("@prisma/client-runtime-utils").Decimal | null;
                restSeconds: number;
                notes: string | null;
                exerciseId: bigint;
                workoutPlanDayId: bigint;
            })[];
        } & {
            id: bigint;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            dayNumber: number;
            isRestDay: boolean;
            workoutPlanId: bigint;
        })[];
    } & {
        id: bigint;
        name: string;
        description: string | null;
        trainingGoal: import("@prisma/client").$Enums.WorkoutPlan_trainingGoal;
        daysPerWeek: number;
        durationWeeks: number | null;
        isActive: boolean;
        source: import("@prisma/client").$Enums.WorkoutPlan_source;
        startedAt: Date | null;
        endedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: bigint;
        createdBy: bigint | null;
    }>;
    getActivePlan(userId: number): Promise<{
        days: ({
            exercises: ({
                exercise: {
                    id: bigint;
                    name: string;
                    description: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    category: import("@prisma/client").$Enums.Exercise_category;
                    difficulty: import("@prisma/client").$Enums.Exercise_difficulty;
                    isBodyweight: boolean;
                };
            } & {
                id: bigint;
                createdAt: Date;
                updatedAt: Date;
                sortOrder: number;
                targetSets: number;
                targetRepsMin: number;
                targetRepsMax: number;
                targetWeightKg: import("@prisma/client-runtime-utils").Decimal | null;
                targetRpe: import("@prisma/client-runtime-utils").Decimal | null;
                restSeconds: number;
                notes: string | null;
                exerciseId: bigint;
                workoutPlanDayId: bigint;
            })[];
        } & {
            id: bigint;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            dayNumber: number;
            isRestDay: boolean;
            workoutPlanId: bigint;
        })[];
    } & {
        id: bigint;
        name: string;
        description: string | null;
        trainingGoal: import("@prisma/client").$Enums.WorkoutPlan_trainingGoal;
        daysPerWeek: number;
        durationWeeks: number | null;
        isActive: boolean;
        source: import("@prisma/client").$Enums.WorkoutPlan_source;
        startedAt: Date | null;
        endedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: bigint;
        createdBy: bigint | null;
    }>;
    update(userId: number, planId: number, dto: UpdateWorkoutPlanDto): Promise<{
        days: ({
            exercises: ({
                exercise: {
                    id: bigint;
                    name: string;
                    description: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    category: import("@prisma/client").$Enums.Exercise_category;
                    difficulty: import("@prisma/client").$Enums.Exercise_difficulty;
                    isBodyweight: boolean;
                };
            } & {
                id: bigint;
                createdAt: Date;
                updatedAt: Date;
                sortOrder: number;
                targetSets: number;
                targetRepsMin: number;
                targetRepsMax: number;
                targetWeightKg: import("@prisma/client-runtime-utils").Decimal | null;
                targetRpe: import("@prisma/client-runtime-utils").Decimal | null;
                restSeconds: number;
                notes: string | null;
                exerciseId: bigint;
                workoutPlanDayId: bigint;
            })[];
        } & {
            id: bigint;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            dayNumber: number;
            isRestDay: boolean;
            workoutPlanId: bigint;
        })[];
    } & {
        id: bigint;
        name: string;
        description: string | null;
        trainingGoal: import("@prisma/client").$Enums.WorkoutPlan_trainingGoal;
        daysPerWeek: number;
        durationWeeks: number | null;
        isActive: boolean;
        source: import("@prisma/client").$Enums.WorkoutPlan_source;
        startedAt: Date | null;
        endedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: bigint;
        createdBy: bigint | null;
    }>;
    remove(userId: number, planId: number): Promise<void>;
    activate(userId: number, planId: number): Promise<{
        days: ({
            exercises: ({
                exercise: {
                    id: bigint;
                    name: string;
                    description: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    category: import("@prisma/client").$Enums.Exercise_category;
                    difficulty: import("@prisma/client").$Enums.Exercise_difficulty;
                    isBodyweight: boolean;
                };
            } & {
                id: bigint;
                createdAt: Date;
                updatedAt: Date;
                sortOrder: number;
                targetSets: number;
                targetRepsMin: number;
                targetRepsMax: number;
                targetWeightKg: import("@prisma/client-runtime-utils").Decimal | null;
                targetRpe: import("@prisma/client-runtime-utils").Decimal | null;
                restSeconds: number;
                notes: string | null;
                exerciseId: bigint;
                workoutPlanDayId: bigint;
            })[];
        } & {
            id: bigint;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            dayNumber: number;
            isRestDay: boolean;
            workoutPlanId: bigint;
        })[];
    } & {
        id: bigint;
        name: string;
        description: string | null;
        trainingGoal: import("@prisma/client").$Enums.WorkoutPlan_trainingGoal;
        daysPerWeek: number;
        durationWeeks: number | null;
        isActive: boolean;
        source: import("@prisma/client").$Enums.WorkoutPlan_source;
        startedAt: Date | null;
        endedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: bigint;
        createdBy: bigint | null;
    }>;
}
