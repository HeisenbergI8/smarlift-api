import { MuscleGroup_bodyRegion } from '@prisma/client';

export interface MuscleGroupResponse {
  id: number;
  name: string;
  bodyRegion: MuscleGroup_bodyRegion;
  createdAt: Date;
}

export interface PaginatedMuscleGroupResponse {
  data: MuscleGroupResponse[];
  total: number;
  page: number;
  limit: number;
}
