import {
  WorkoutSession_status,
  Exercise_category,
  Exercise_difficulty,
} from '@prisma/client';

export interface ExerciseSummary {
  id: number;
  name: string;
  description: string | null;
  category: Exercise_category;
  difficulty: Exercise_difficulty;
  isBodyweight: boolean;
}

export interface WorkoutSetResponse {
  id: number;
  workoutSessionId: number;
  exerciseId: number;
  setNumber: number;
  reps: number;
  weightKg: number | null;
  rpe: number | null;
  isWarmup: boolean;
  notes: string | null;
  performedAt: Date;
  exercise: ExerciseSummary;
}

export interface WorkoutSessionResponse {
  id: number;
  userId: number;
  workoutPlanDayId: number | null;
  status: WorkoutSession_status;
  startedAt: Date;
  completedAt: Date | null;
  durationMinutes: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  sets: WorkoutSetResponse[];
}

export interface PaginatedSessionsResponse {
  data: WorkoutSessionResponse[];
  total: number;
  page: number;
  limit: number;
}
