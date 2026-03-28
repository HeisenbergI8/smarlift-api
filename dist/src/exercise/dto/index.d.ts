export * from './find-exercises-query.dto';
import { ExerciseCategory, ExerciseDifficulty } from './find-exercises-query.dto';
export declare class CreateExerciseDto {
    name: string;
    description?: string;
    category?: ExerciseCategory;
    difficulty?: ExerciseDifficulty;
    isBodyweight?: boolean;
    muscleGroupIds?: number[];
    equipmentIds?: number[];
}
export declare class UpdateExerciseDto {
    name?: string;
    description?: string;
    category?: ExerciseCategory;
    difficulty?: ExerciseDifficulty;
    isBodyweight?: boolean;
    muscleGroupIds?: number[];
    equipmentIds?: number[];
}
