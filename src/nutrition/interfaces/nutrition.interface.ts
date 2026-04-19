import { NutritionRecommendation_source } from '@prisma/client';

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
