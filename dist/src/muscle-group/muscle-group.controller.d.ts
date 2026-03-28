import { MuscleGroupService } from './muscle-group.service';
import { FindMuscleGroupsQueryDto, CreateMuscleGroupDto, UpdateMuscleGroupDto } from './dto';
export declare class MuscleGroupController {
    private readonly muscleGroupService;
    constructor(muscleGroupService: MuscleGroupService);
    findAll(query: FindMuscleGroupsQueryDto): Promise<{
        data: {
            bodyRegion: import("@prisma/client").$Enums.MuscleGroup_bodyRegion;
            name: string;
            id: bigint;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    create(dto: CreateMuscleGroupDto): Promise<{
        bodyRegion: import("@prisma/client").$Enums.MuscleGroup_bodyRegion;
        name: string;
        id: bigint;
        createdAt: Date;
    }>;
    update(id: number, dto: UpdateMuscleGroupDto): Promise<{
        bodyRegion: import("@prisma/client").$Enums.MuscleGroup_bodyRegion;
        name: string;
        id: bigint;
        createdAt: Date;
    }>;
    remove(id: number): Promise<void>;
}
