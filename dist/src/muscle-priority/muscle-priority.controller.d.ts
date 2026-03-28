import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { MusclePriorityService } from './muscle-priority.service';
import { UpsertMusclePriorityDto } from './dto';
export declare class MusclePriorityController {
    private readonly musclePriorityService;
    constructor(musclePriorityService: MusclePriorityService);
    getUserPriorities(userId: number, query: PaginationQueryDto): Promise<{
        data: ({
            muscleGroup: {
                name: string;
                id: bigint;
                createdAt: Date;
                bodyRegion: import("@prisma/client").$Enums.MuscleGroup_bodyRegion;
            };
        } & {
            muscleGroupId: bigint;
            priorityLevel: import("@prisma/client").$Enums.UserMusclePriority_level;
            hasImbalance: boolean;
            notes: string | null;
            id: bigint;
            userId: bigint;
            createdAt: Date;
            updatedAt: Date;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    upsertPriority(userId: number, dto: UpsertMusclePriorityDto): Promise<{
        muscleGroup: {
            name: string;
            id: bigint;
            createdAt: Date;
            bodyRegion: import("@prisma/client").$Enums.MuscleGroup_bodyRegion;
        };
    } & {
        muscleGroupId: bigint;
        priorityLevel: import("@prisma/client").$Enums.UserMusclePriority_level;
        hasImbalance: boolean;
        notes: string | null;
        id: bigint;
        userId: bigint;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deletePriority(userId: number, muscleGroupId: number): Promise<void>;
}
