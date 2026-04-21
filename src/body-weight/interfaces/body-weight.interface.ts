import { BodyWeightLog_source } from '@prisma/client';

export interface BodyWeightLogResponse {
  id: number;
  userId: number;
  logDate: Date;
  weightKg: number;
  source: BodyWeightLog_source;
  createdAt: Date;
}

export interface WeeklyAverageResponse {
  weekStart: Date;
  avgWeightKg: number;
  entryCount: number;
}

export interface PaginatedBodyWeightLogsResponse {
  data: BodyWeightLogResponse[];
  total: number;
  page: number;
  limit: number;
}
