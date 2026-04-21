import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GetKpiSnapshotsQueryDto } from './dto';
import {
  ActivePlanSummary,
  DashboardOverviewResponse,
  KpiSnapshotListResponse,
  KpiSnapshotResponse,
  NutritionAdherenceResponse,
  NutritionRecommendationResponse,
  StrengthProgressResponse,
  WeeklyConsistencyItem,
  WeightTrendResponse,
  WorkoutConsistencyResponse,
} from './interfaces';
import { getMonday } from '../common/utils/date.utils';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  private mapKpiSnapshot(raw: {
    id: bigint;
    userId: bigint;
    snapshotDate: Date;
    bodyWeightKg: Prisma.Decimal | null;
    totalSessionsWeek: number | null;
    plannedSessionsWeek: number | null;
    consistencyScore: Prisma.Decimal | null;
    strengthIndex: Prisma.Decimal | null;
    weeklyStreak: number;
    createdAt: Date;
  }): KpiSnapshotResponse {
    return {
      id: Number(raw.id),
      userId: Number(raw.userId),
      snapshotDate: raw.snapshotDate,
      bodyWeightKg:
        raw.bodyWeightKg !== null
          ? parseFloat(raw.bodyWeightKg.toString())
          : null,
      totalSessionsWeek: raw.totalSessionsWeek,
      plannedSessionsWeek: raw.plannedSessionsWeek,
      consistencyScore:
        raw.consistencyScore !== null
          ? parseFloat(raw.consistencyScore.toString())
          : null,
      strengthIndex:
        raw.strengthIndex !== null
          ? parseFloat(raw.strengthIndex.toString())
          : null,
      weeklyStreak: raw.weeklyStreak,
      createdAt: raw.createdAt,
    };
  }

  private mapNutritionRecommendation(raw: {
    id: bigint;
    userId: bigint;
    source: NutritionRecommendationResponse['source'];
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
  }): NutritionRecommendationResponse {
    return {
      id: Number(raw.id),
      userId: Number(raw.userId),
      source: raw.source,
      dailyCaloriesKcal: raw.dailyCaloriesKcal,
      proteinG: raw.proteinG,
      carbohydratesG: raw.carbohydratesG,
      fatsG: raw.fatsG,
      isActive: raw.isActive,
      effectiveFrom: raw.effectiveFrom,
      effectiveTo: raw.effectiveTo,
      notes: raw.notes,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  async getOverview(userId: number): Promise<DashboardOverviewResponse> {
    const [
      latestWeight,
      latestSnapshot,
      activeRecommendation,
      activePlan,
      unreadNotifications,
      activeEgoAlerts,
    ] = await Promise.all([
      this.prisma.bodyWeightLog.findFirst({
        where: { userId: BigInt(userId) },
        orderBy: { logDate: 'desc' },
      }),
      this.prisma.kpiSnapshot.findFirst({
        where: { userId: BigInt(userId) },
        orderBy: { snapshotDate: 'desc' },
      }),
      this.prisma.nutritionRecommendation.findFirst({
        where: { userId: BigInt(userId), isActive: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workoutPlan.findFirst({
        where: { userId: BigInt(userId), isActive: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({
        where: { userId: BigInt(userId), isRead: false },
      }),
      this.prisma.egoLiftAlert.count({
        where: { userId: BigInt(userId), isDismissed: false },
      }),
    ]);

    return {
      latestWeight: latestWeight
        ? {
            weightKg: Number(latestWeight.weightKg),
            logDate: latestWeight.logDate,
          }
        : null,
      latestSnapshot: latestSnapshot
        ? this.mapKpiSnapshot(latestSnapshot)
        : null,
      activeRecommendation: activeRecommendation
        ? this.mapNutritionRecommendation(activeRecommendation)
        : null,
      activePlan: activePlan
        ? {
            id: Number(activePlan.id),
            name: activePlan.name,
            daysPerWeek: activePlan.daysPerWeek,
          }
        : null,
      unreadNotifications,
      activeEgoAlerts,
    };
  }

  async getStrengthProgress(userId: number): Promise<StrengthProgressResponse> {
    const records = await this.prisma.personalRecord.findMany({
      where: { userId: BigInt(userId), recordType: 'max_weight' },
      include: { exercise: true },
      orderBy: { value: 'desc' },
    });

    return {
      records: records.map((r) => ({
        exerciseId: Number(r.exerciseId),
        exerciseName: r.exercise.name,
        currentMaxWeightKg: Number(r.value),
        achievedAt: r.achievedAt,
      })),
    };
  }

  async getWeightTrend(
    userId: number,
    period: 'week' | 'month' | '3months' = 'month',
  ): Promise<WeightTrendResponse> {
    const daysMap: Record<string, number> = {
      week: 7,
      month: 30,
      '3months': 90,
    };
    const days = daysMap[period] ?? 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const entries = await this.prisma.bodyWeightLog.findMany({
      where: {
        userId: BigInt(userId),
        logDate: { gte: startDate },
      },
      orderBy: { logDate: 'asc' },
    });

    if (entries.length === 0) {
      return {
        entries: [],
        startWeight: null,
        endWeight: null,
        changeKg: 0,
        changePct: 0,
      };
    }

    const startWeight = Number(entries[0].weightKg);
    const endWeight = Number(entries[entries.length - 1].weightKg);
    const changeKg = parseFloat((endWeight - startWeight).toFixed(1));
    const changePct =
      startWeight > 0
        ? parseFloat(((changeKg / startWeight) * 100).toFixed(1))
        : 0;

    return {
      entries: entries.map((e) => ({
        logDate: e.logDate,
        weightKg: Number(e.weightKg),
      })),
      startWeight,
      endWeight,
      changeKg,
      changePct,
    };
  }

  async getWorkoutConsistency(
    userId: number,
    weeks: number = 8,
  ): Promise<WorkoutConsistencyResponse> {
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);

    const [sessions, activePlan] = await Promise.all([
      this.prisma.workoutSession.findMany({
        where: {
          userId: BigInt(userId),
          status: 'completed',
          startedAt: { gte: startDate },
        },
        orderBy: { startedAt: 'asc' },
        select: { startedAt: true },
      }),
      this.prisma.workoutPlan.findFirst({
        where: { userId: BigInt(userId), isActive: true },
        orderBy: { createdAt: 'desc' },
        select: { daysPerWeek: true },
      }),
    ]);

    const planned = activePlan?.daysPerWeek ?? 3;
    const weeklyData = this.buildWeeklyConsistency(
      sessions.map((s) => s.startedAt),
      weeks,
      planned,
      now,
    );

    const totalCompleted = weeklyData.reduce((s, w) => s + w.completed, 0);
    const totalPlanned = weeklyData.reduce((s, w) => s + w.planned, 0);
    const overallConsistencyPct =
      totalPlanned > 0
        ? parseFloat(
            (Math.min(totalCompleted / totalPlanned, 1) * 100).toFixed(1),
          )
        : 0;

    let currentStreak = 0;
    for (let i = weeklyData.length - 1; i >= 0; i--) {
      if (weeklyData[i].completed >= weeklyData[i].planned) {
        currentStreak++;
      } else {
        break;
      }
    }

    return { weeks: weeklyData, overallConsistencyPct, currentStreak };
  }

  private buildWeeklyConsistency(
    sessionDates: Date[],
    weeks: number,
    planned: number,
    now: Date,
  ): WeeklyConsistencyItem[] {
    const result: WeeklyConsistencyItem[] = [];

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = getMonday(
        new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000),
      );
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

      const completed = sessionDates.filter(
        (d) => d >= weekStart && d < weekEnd,
      ).length;

      const consistencyPct =
        planned > 0
          ? parseFloat((Math.min(completed / planned, 1) * 100).toFixed(1))
          : 0;

      result.push({ weekStart, planned, completed, consistencyPct });
    }

    return result;
  }

  async getNutritionAdherence(
    userId: number,
    days: number = 30,
  ): Promise<NutritionAdherenceResponse> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [logs, activeRec] = await Promise.all([
      this.prisma.dailyNutritionLog.findMany({
        where: {
          userId: BigInt(userId),
          logDate: { gte: startDate },
        },
        orderBy: { logDate: 'asc' },
      }),
      this.prisma.nutritionRecommendation.findFirst({
        where: { userId: BigInt(userId), isActive: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const targetCalories = activeRec?.dailyCaloriesKcal ?? 0;

    const entries = logs
      .filter((log) => log.totalCaloriesKcal !== null)
      .map((log) => {
        const logged = log.totalCaloriesKcal!;
        const adherencePct =
          targetCalories > 0
            ? parseFloat(((logged / targetCalories) * 100).toFixed(1))
            : 0;
        return {
          date: log.logDate,
          loggedCaloriesKcal: logged,
          targetCaloriesKcal: targetCalories,
          adherencePct,
        };
      });

    const avgAdherencePct =
      entries.length > 0
        ? parseFloat(
            (
              entries.reduce((sum, e) => sum + e.adherencePct, 0) /
              entries.length
            ).toFixed(1),
          )
        : 0;

    return { entries, avgAdherencePct };
  }

  async getKpiSnapshots(
    userId: number,
    query: GetKpiSnapshotsQueryDto,
  ): Promise<KpiSnapshotListResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: { userId: bigint; snapshotDate?: { gte?: Date; lte?: Date } } =
      {
        userId: BigInt(userId),
      };

    if (query.startDate || query.endDate) {
      where.snapshotDate = {};
      if (query.startDate) {
        where.snapshotDate.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.snapshotDate.lte = new Date(query.endDate);
      }
    }

    const [rawData, total] = await Promise.all([
      this.prisma.kpiSnapshot.findMany({
        where,
        orderBy: { snapshotDate: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.kpiSnapshot.count({ where }),
    ]);

    return {
      data: rawData.map((s) => this.mapKpiSnapshot(s)),
      total,
      page,
      limit,
    };
  }

  async createKpiSnapshot(userId: number): Promise<KpiSnapshotResponse> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = getMonday(today);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      latestWeight,
      sessionsThisWeek,
      activePlan,
      personalRecords,
      previousSnapshot,
    ] = await Promise.all([
      this.prisma.bodyWeightLog.findFirst({
        where: { userId: BigInt(userId) },
        orderBy: { logDate: 'desc' },
      }),
      this.prisma.workoutSession.count({
        where: {
          userId: BigInt(userId),
          status: 'completed',
          startedAt: { gte: weekStart, lt: weekEnd },
        },
      }),
      this.prisma.workoutPlan.findFirst({
        where: { userId: BigInt(userId), isActive: true },
        orderBy: { createdAt: 'desc' },
        select: { daysPerWeek: true },
      }),
      this.prisma.personalRecord.findMany({
        where: { userId: BigInt(userId), recordType: 'max_weight' },
        select: { value: true },
      }),
      this.prisma.kpiSnapshot.findFirst({
        where: { userId: BigInt(userId) },
        orderBy: { snapshotDate: 'desc' },
        select: { weeklyStreak: true },
      }),
    ]);

    const plannedSessions = activePlan?.daysPerWeek ?? 3;
    const consistencyScore = parseFloat(
      (Math.min(sessionsThisWeek / plannedSessions, 1) * 100).toFixed(2),
    );
    const strengthIndex = parseFloat(
      personalRecords.reduce((sum, pr) => sum + Number(pr.value), 0).toFixed(2),
    );

    const prevStreak = previousSnapshot?.weeklyStreak ?? 0;
    const weeklyStreak =
      sessionsThisWeek >= plannedSessions ? prevStreak + 1 : 0;

    const raw = await this.prisma.kpiSnapshot.upsert({
      where: {
        userId_snapshotDate: {
          userId: BigInt(userId),
          snapshotDate: today,
        },
      },
      update: {
        bodyWeightKg: latestWeight ? latestWeight.weightKg : null,
        totalSessionsWeek: sessionsThisWeek,
        plannedSessionsWeek: plannedSessions,
        consistencyScore,
        strengthIndex,
        weeklyStreak,
      },
      create: {
        userId: BigInt(userId),
        snapshotDate: today,
        bodyWeightKg: latestWeight ? latestWeight.weightKg : null,
        totalSessionsWeek: sessionsThisWeek,
        plannedSessionsWeek: plannedSessions,
        consistencyScore,
        strengthIndex,
        weeklyStreak,
      },
    });
    return this.mapKpiSnapshot(raw);
  }
}
