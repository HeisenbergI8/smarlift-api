import { IsOptional, IsEnum, IsInt, IsString, Min, Max } from 'class-validator';
import { WorkoutTrainingGoal } from './create-workout-plan.dto';

export class GenerateWorkoutPlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(WorkoutTrainingGoal)
  trainingGoalOverride?: WorkoutTrainingGoal;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  daysPerWeekOverride?: number;
}
