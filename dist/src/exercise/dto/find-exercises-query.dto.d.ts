import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare enum ExerciseCategory {
    COMPOUND = "compound",
    ISOLATION = "isolation",
    CARDIO = "cardio",
    FLEXIBILITY = "flexibility"
}
export declare enum ExerciseDifficulty {
    BEGINNER = "beginner",
    INTERMEDIATE = "intermediate",
    ADVANCED = "advanced"
}
export declare class FindExercisesQueryDto extends PaginationQueryDto {
    search?: string;
    category?: ExerciseCategory;
    difficulty?: ExerciseDifficulty;
    muscleGroupId?: number;
    equipmentId?: number;
}
