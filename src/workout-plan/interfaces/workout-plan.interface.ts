import {
  Exercise_category,
  Exercise_difficulty,
  WorkoutPlan_source,
  WorkoutPlan_trainingGoal,
} from '@prisma/client';

export interface ExerciseSummary {
  id: number;
  name: string;
  description: string | null;
  category: Exercise_category;
  difficulty: Exercise_difficulty;
  isBodyweight: boolean;
}

export interface WorkoutPlanExerciseResponse {
  id: number;
  workoutPlanDayId: number;
  exerciseId: number;
  sortOrder: number;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetWeightKg: number | null;
  targetRpe: number | null;
  restSeconds: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  exercise: ExerciseSummary;
}

export interface WorkoutPlanDayResponse {
  id: number;
  workoutPlanId: number;
  dayNumber: number;
  name: string | null;
  isRestDay: boolean;
  createdAt: Date;
  updatedAt: Date;
  exercises: WorkoutPlanExerciseResponse[];
}

export interface WorkoutPlanResponse {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  trainingGoal: WorkoutPlan_trainingGoal;
  daysPerWeek: number;
  durationWeeks: number | null;
  isActive: boolean;
  source: WorkoutPlan_source;
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  days: WorkoutPlanDayResponse[];
}
