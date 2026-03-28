import { WorkoutLogService } from './workout-log.service';
import { StartSessionDto, LogSetDto, CompleteSessionDto } from './dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
export declare class WorkoutLogController {
    private readonly workoutLogService;
    constructor(workoutLogService: WorkoutLogService);
    startSession(userId: number, dto: StartSessionDto): Promise<{
        sets: ({
            exercise: {
                name: string;
                description: string | null;
                id: bigint;
                createdAt: Date;
                updatedAt: Date;
                category: import("@prisma/client").$Enums.Exercise_category;
                difficulty: import("@prisma/client").$Enums.Exercise_difficulty;
                isBodyweight: boolean;
            };
        } & {
            id: bigint;
            notes: string | null;
            exerciseId: bigint;
            workoutSessionId: bigint;
            setNumber: number;
            reps: number;
            weightKg: import("@prisma/client-runtime-utils").Decimal | null;
            rpe: import("@prisma/client-runtime-utils").Decimal | null;
            isWarmup: boolean;
            performedAt: Date;
        })[];
    } & {
        startedAt: Date;
        id: bigint;
        createdAt: Date;
        updatedAt: Date;
        userId: bigint;
        notes: string | null;
        workoutPlanDayId: bigint | null;
        status: import("@prisma/client").$Enums.WorkoutSession_status;
        completedAt: Date | null;
        durationMinutes: number | null;
    }>;
    getHistory(userId: number, query: PaginationQueryDto): Promise<{
        data: ({
            sets: ({
                exercise: {
                    name: string;
                    description: string | null;
                    id: bigint;
                    createdAt: Date;
                    updatedAt: Date;
                    category: import("@prisma/client").$Enums.Exercise_category;
                    difficulty: import("@prisma/client").$Enums.Exercise_difficulty;
                    isBodyweight: boolean;
                };
            } & {
                id: bigint;
                notes: string | null;
                exerciseId: bigint;
                workoutSessionId: bigint;
                setNumber: number;
                reps: number;
                weightKg: import("@prisma/client-runtime-utils").Decimal | null;
                rpe: import("@prisma/client-runtime-utils").Decimal | null;
                isWarmup: boolean;
                performedAt: Date;
            })[];
        } & {
            startedAt: Date;
            id: bigint;
            createdAt: Date;
            updatedAt: Date;
            userId: bigint;
            notes: string | null;
            workoutPlanDayId: bigint | null;
            status: import("@prisma/client").$Enums.WorkoutSession_status;
            completedAt: Date | null;
            durationMinutes: number | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    getSession(userId: number, sessionId: number): Promise<{
        sets: ({
            exercise: {
                name: string;
                description: string | null;
                id: bigint;
                createdAt: Date;
                updatedAt: Date;
                category: import("@prisma/client").$Enums.Exercise_category;
                difficulty: import("@prisma/client").$Enums.Exercise_difficulty;
                isBodyweight: boolean;
            };
        } & {
            id: bigint;
            notes: string | null;
            exerciseId: bigint;
            workoutSessionId: bigint;
            setNumber: number;
            reps: number;
            weightKg: import("@prisma/client-runtime-utils").Decimal | null;
            rpe: import("@prisma/client-runtime-utils").Decimal | null;
            isWarmup: boolean;
            performedAt: Date;
        })[];
    } & {
        startedAt: Date;
        id: bigint;
        createdAt: Date;
        updatedAt: Date;
        userId: bigint;
        notes: string | null;
        workoutPlanDayId: bigint | null;
        status: import("@prisma/client").$Enums.WorkoutSession_status;
        completedAt: Date | null;
        durationMinutes: number | null;
    }>;
    logSet(userId: number, sessionId: number, dto: LogSetDto): Promise<{
        exercise: {
            name: string;
            description: string | null;
            id: bigint;
            createdAt: Date;
            updatedAt: Date;
            category: import("@prisma/client").$Enums.Exercise_category;
            difficulty: import("@prisma/client").$Enums.Exercise_difficulty;
            isBodyweight: boolean;
        };
    } & {
        id: bigint;
        notes: string | null;
        exerciseId: bigint;
        workoutSessionId: bigint;
        setNumber: number;
        reps: number;
        weightKg: import("@prisma/client-runtime-utils").Decimal | null;
        rpe: import("@prisma/client-runtime-utils").Decimal | null;
        isWarmup: boolean;
        performedAt: Date;
    }>;
    completeSession(userId: number, sessionId: number, dto: CompleteSessionDto): Promise<{
        sets: ({
            exercise: {
                name: string;
                description: string | null;
                id: bigint;
                createdAt: Date;
                updatedAt: Date;
                category: import("@prisma/client").$Enums.Exercise_category;
                difficulty: import("@prisma/client").$Enums.Exercise_difficulty;
                isBodyweight: boolean;
            };
        } & {
            id: bigint;
            notes: string | null;
            exerciseId: bigint;
            workoutSessionId: bigint;
            setNumber: number;
            reps: number;
            weightKg: import("@prisma/client-runtime-utils").Decimal | null;
            rpe: import("@prisma/client-runtime-utils").Decimal | null;
            isWarmup: boolean;
            performedAt: Date;
        })[];
    } & {
        startedAt: Date;
        id: bigint;
        createdAt: Date;
        updatedAt: Date;
        userId: bigint;
        notes: string | null;
        workoutPlanDayId: bigint | null;
        status: import("@prisma/client").$Enums.WorkoutSession_status;
        completedAt: Date | null;
        durationMinutes: number | null;
    }>;
    deleteSession(userId: number, sessionId: number): Promise<void>;
}
