import { PrismaService } from '../prisma/prisma.service';
import { StartSessionDto, LogSetDto, CompleteSessionDto } from './dto';
export declare class WorkoutLogService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
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
    getSessionHistory(userId: number, page: number, limit: number): Promise<{
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
    getSessionById(userId: number, sessionId: number): Promise<{
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
