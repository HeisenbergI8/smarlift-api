import {
  NutritionRecommendation_source,
  NutritionAdjustment_trigger,
  NutritionAdjustment_source,
} from '@prisma/client';

export interface NutritionRecommendationResponse {
  id: number;
  userId: number;
  createdBy: number | null;
  source: NutritionRecommendation_source;
  dailyCaloriesKcal: number;
  proteinG: number;
  carbohydratesG: number;
  fatsG: number;
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyNutritionLogResponse {
  id: number;
  userId: number;
  logDate: Date;
  totalCaloriesKcal: number | null;
  proteinG: number | null;
  carbohydratesG: number | null;
  fatsG: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NutritionAdjustmentResponse {
  id: number;
  userId: number;
  nutritionRecommendationId: number;
  triggerReason: NutritionAdjustment_trigger;
  previousCaloriesKcal: number;
  newCaloriesKcal: number;
  previousProteinG: number | null;
  newProteinG: number | null;
  previousCarbohydratesG: number | null;
  newCarbohydratesG: number | null;
  previousFatsG: number | null;
  newFatsG: number | null;
  weeklyAvgWeightKg: number | null;
  notes: string | null;
  source: NutritionAdjustment_source;
  createdAt: Date;
  nutritionRecommendation: NutritionRecommendationResponse;
}

export interface PaginatedDailyLogsResponse {
  data: DailyNutritionLogResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedAdjustmentsResponse {
  data: NutritionAdjustmentResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface PlateauDetectionResponse {
  plateauDetected: boolean;
  reason?: string;
  newRecommendation?: NutritionRecommendationResponse;
  adjustment?: NutritionAdjustmentResponse;
}
