import { ExerciseService } from './exercise.service';
import { FindExercisesQueryDto, CreateExerciseDto, UpdateExerciseDto } from './dto';
export declare class ExerciseController {
    private readonly exerciseService;
    constructor(exerciseService: ExerciseService);
    findAll(query: FindExercisesQueryDto): Promise<{
        data: ({
            exerciseMuscles: ({
                muscleGroup: {
                    name: string;
                    id: bigint;
                    createdAt: Date;
                    bodyRegion: import("@prisma/client").$Enums.MuscleGroup_bodyRegion;
                };
            } & {
                id: bigint;
                exerciseId: bigint;
                muscleGroupId: bigint;
                role: import("@prisma/client").$Enums.ExerciseMuscle_role;
            })[];
            exerciseEquipment: ({
                equipment: {
                    name: string;
                    description: string | null;
                    id: bigint;
                    createdAt: Date;
                };
            } & {
                id: bigint;
                exerciseId: bigint;
                equipmentId: bigint;
            })[];
        } & {
            name: string;
            description: string | null;
            category: import("@prisma/client").$Enums.Exercise_category;
            difficulty: import("@prisma/client").$Enums.Exercise_difficulty;
            isBodyweight: boolean;
            id: bigint;
            createdAt: Date;
            updatedAt: Date;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: number): Promise<{
        exerciseMuscles: ({
            muscleGroup: {
                name: string;
                id: bigint;
                createdAt: Date;
                bodyRegion: import("@prisma/client").$Enums.MuscleGroup_bodyRegion;
            };
        } & {
            id: bigint;
            exerciseId: bigint;
            muscleGroupId: bigint;
            role: import("@prisma/client").$Enums.ExerciseMuscle_role;
        })[];
        exerciseEquipment: ({
            equipment: {
                name: string;
                description: string | null;
                id: bigint;
                createdAt: Date;
            };
        } & {
            id: bigint;
            exerciseId: bigint;
            equipmentId: bigint;
        })[];
    } & {
        name: string;
        description: string | null;
        category: import("@prisma/client").$Enums.Exercise_category;
        difficulty: import("@prisma/client").$Enums.Exercise_difficulty;
        isBodyweight: boolean;
        id: bigint;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateExerciseDto): Promise<{
        exerciseMuscles: ({
            muscleGroup: {
                name: string;
                id: bigint;
                createdAt: Date;
                bodyRegion: import("@prisma/client").$Enums.MuscleGroup_bodyRegion;
            };
        } & {
            id: bigint;
            exerciseId: bigint;
            muscleGroupId: bigint;
            role: import("@prisma/client").$Enums.ExerciseMuscle_role;
        })[];
        exerciseEquipment: ({
            equipment: {
                name: string;
                description: string | null;
                id: bigint;
                createdAt: Date;
            };
        } & {
            id: bigint;
            exerciseId: bigint;
            equipmentId: bigint;
        })[];
    } & {
        name: string;
        description: string | null;
        category: import("@prisma/client").$Enums.Exercise_category;
        difficulty: import("@prisma/client").$Enums.Exercise_difficulty;
        isBodyweight: boolean;
        id: bigint;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, dto: UpdateExerciseDto): Promise<{
        exerciseMuscles: ({
            muscleGroup: {
                name: string;
                id: bigint;
                createdAt: Date;
                bodyRegion: import("@prisma/client").$Enums.MuscleGroup_bodyRegion;
            };
        } & {
            id: bigint;
            exerciseId: bigint;
            muscleGroupId: bigint;
            role: import("@prisma/client").$Enums.ExerciseMuscle_role;
        })[];
        exerciseEquipment: ({
            equipment: {
                name: string;
                description: string | null;
                id: bigint;
                createdAt: Date;
            };
        } & {
            id: bigint;
            exerciseId: bigint;
            equipmentId: bigint;
        })[];
    } & {
        name: string;
        description: string | null;
        category: import("@prisma/client").$Enums.Exercise_category;
        difficulty: import("@prisma/client").$Enums.Exercise_difficulty;
        isBodyweight: boolean;
        id: bigint;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<void>;
}
