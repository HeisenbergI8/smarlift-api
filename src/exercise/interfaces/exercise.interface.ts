import {
  Exercise_category,
  Exercise_difficulty,
  ExerciseMuscle_role,
  MuscleGroup_bodyRegion,
} from '@prisma/client';

export interface MuscleGroupSummary {
  id: number;
  name: string;
  bodyRegion: MuscleGroup_bodyRegion;
  createdAt: Date;
}

export interface EquipmentSummary {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
}

export interface ExerciseMuscleResponse {
  id: number;
  exerciseId: number;
  muscleGroupId: number;
  role: ExerciseMuscle_role;
  muscleGroup: MuscleGroupSummary;
}

export interface ExerciseEquipmentResponse {
  id: number;
  exerciseId: number;
  equipmentId: number;
  equipment: EquipmentSummary;
}

export interface ExerciseResponse {
  id: number;
  name: string;
  description: string | null;
  category: Exercise_category;
  difficulty: Exercise_difficulty;
  isBodyweight: boolean;
  createdAt: Date;
  updatedAt: Date;
  exerciseMuscles: ExerciseMuscleResponse[];
  exerciseEquipment: ExerciseEquipmentResponse[];
}

export interface PaginatedExerciseResponse {
  data: ExerciseResponse[];
  total: number;
  page: number;
  limit: number;
}
