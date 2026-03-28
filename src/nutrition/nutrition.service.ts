import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNutritionRecDto, LogDailyNutritionDto } from './dto';

@Injectable()
export class NutritionService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveRecommendation(userId: number) {
    // TODO: Find active nutrition recommendation for user
    // TODO: Return recommendation or null
  }

  async createRecommendation(userId: number, dto: CreateNutritionRecDto) {
    // TODO: Deactivate previous active recommendation
    // TODO: Create new recommendation with source = 'system'
    // TODO: Return created recommendation
  }

  async generateSmartRecommendation(userId: number) {
    // TODO: Fetch user profile (height, weight, age, activity level, goal)
    // TODO: Calculate TDEE and macro split based on goal
    // TODO: Create and return nutrition recommendation
  }

  async logDailyNutrition(userId: number, dto: LogDailyNutritionDto) {
    // TODO: Upsert daily nutrition log by userId + logDate
    // TODO: Return created/updated log
  }

  async getDailyLogs(userId: number, startDate: string, endDate: string) {
    // TODO: Return daily nutrition logs within date range
    // TODO: Order by logDate desc
  }

  async getAdjustmentHistory(userId: number) {
    // TODO: Return nutrition adjustments for user
    // TODO: Include recommendation details
    // TODO: Order by createdAt desc
  }

  async detectPlateauAndAdjust(userId: number) {
    // TODO: Fetch recent body weight logs (last 2-4 weeks)
    // TODO: Calculate weekly averages
    // TODO: Detect plateau (weight stagnation)
    // TODO: If plateau detected, calculate new calorie/macro targets
    // TODO: Create nutrition_adjustment record
    // TODO: Update active recommendation
    // TODO: Return adjustment or null
  }
}
