import {
  ProgressionSetting_frequency,
  ProgressionSetting_trainingGoal,
  ProgressionHistory_adjustmentType,
  ProgressionHistory_source,
} from '@prisma/client';

export interface ExerciseSummary {
  id: number;
  name: string;
  description: string | null;
}

export interface ProgressionSettingResponse {
  id: number;
  userId: number;
  isEnabled: boolean;
  progressionFrequency: ProgressionSetting_frequency;
  trainingGoal: ProgressionSetting_trainingGoal;
  weightIncrementKg: number;
  maxRepsBeforeIncrease: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgressionHistoryResponse {
  id: number;
  userId: number;
  exerciseId: number;
  adjustmentType: ProgressionHistory_adjustmentType;
  previousValue: number;
  newValue: number;
  reason: string | null;
  source: ProgressionHistory_source;
  createdAt: Date;
  exercise: ExerciseSummary;
}

export interface PaginatedProgressionHistoryResponse {
  data: ProgressionHistoryResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface ProgressionEvaluationDisabledResponse {
  message: string;
  adjustments: [];
}

export interface ProgressionEvaluationResponse {
  message: string;
  adjustments: ProgressionHistoryResponse[];
}
