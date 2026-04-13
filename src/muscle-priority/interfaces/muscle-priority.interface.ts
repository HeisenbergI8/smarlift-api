import {
  MuscleGroup_bodyRegion,
  UserMusclePriority_level,
} from '@prisma/client';

export interface MuscleGroupSummary {
  id: number;
  name: string;
  bodyRegion: MuscleGroup_bodyRegion;
  createdAt: Date;
}

export interface MusclePriorityResponse {
  id: number;
  userId: number;
  muscleGroupId: number;
  priorityLevel: UserMusclePriority_level;
  hasImbalance: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  muscleGroup: MuscleGroupSummary;
}

export interface PaginatedMusclePriorityResponse {
  data: MusclePriorityResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface DeleteMusclePriorityResponse {
  message: string;
}
