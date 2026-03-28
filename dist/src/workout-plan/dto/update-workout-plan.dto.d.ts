import { WorkoutTrainingGoal, CreatePlanDayDto } from './create-workout-plan.dto';
export declare class UpdateWorkoutPlanDto {
    name?: string;
    description?: string;
    trainingGoal?: WorkoutTrainingGoal;
    daysPerWeek?: number;
    durationWeeks?: number;
    startedAt?: string;
    days?: CreatePlanDayDto[];
}
