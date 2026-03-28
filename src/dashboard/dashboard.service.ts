import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId: number) {
    // TODO: Aggregate current KPI data:
    //   - Current body weight (latest body_weight_log)
    //   - Workout consistency (sessions this week vs planned)
    //   - Weekly streak count
    //   - Active plan summary
    // TODO: Return overview object
  }

  async getStrengthProgress(userId: number) {
    // TODO: Fetch personal records for user
    // TODO: Calculate percentage changes vs previous records
    // TODO: Return per-exercise strength progress
  }

  async getWeightTrend(userId: number, period: string) {
    // TODO: Fetch body weight logs for the given period (weekly/monthly)
    // TODO: Return data points for chart { date, weightKg }
  }

  async getWorkoutConsistency(userId: number, weeks: number) {
    // TODO: Fetch workout sessions for the last N weeks
    // TODO: Compare completed vs planned sessions per week
    // TODO: Return consistency data { week, completed, planned, score }
  }

  async getNutritionAdherence(userId: number, days: number) {
    // TODO: Fetch daily nutrition logs and active recommendation
    // TODO: Compare actual intake vs recommended targets
    // TODO: Return { date, actualCalories, targetCalories, ... }
  }

  async getKpiSnapshots(userId: number, startDate: string, endDate: string) {
    // TODO: Return KPI snapshots within date range
    // TODO: Order by snapshotDate asc
  }

  async createKpiSnapshot(userId: number) {
    // TODO: Calculate current KPI values
    // TODO: Create kpi_snapshot record for today
    // TODO: Return created snapshot
  }
}
