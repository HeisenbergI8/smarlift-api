import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateNutritionRecDto,
  LogDailyNutritionDto,
  GetDailyLogsQueryDto,
} from './dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { NutritionRecommendationResponse } from './interfaces';
import { getMonday } from '../common/utils/date.utils';

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

const TRAINING_DAYS_FLOOR_MULTIPLIERS: Record<number, number> = {
  0: 1.2,
  1: 1.2,
  2: 1.375,
  3: 1.375,
  4: 1.55,
  5: 1.55,
  6: 1.725,
  7: 1.725,
};

const MIN_DAILY_CALORIES = 1200;

@Injectable()
export class NutritionService {
  private readonly logger = new Logger(NutritionService.name);

  constructor(private readonly prisma: PrismaService) {}

  private mapRecommendation(raw: {
    id: bigint;
    userId: bigint;
    createdBy: bigint | null;
    source: import('@prisma/client').NutritionRecommendation_source;
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
      createdBy: raw.createdBy !== null ? Number(raw.createdBy) : null,
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

  async getActiveRecommendation(
    userId: number,
  ): Promise<NutritionRecommendationResponse> {
    const recommendation = await this.prisma.nutritionRecommendation.findFirst({
      where: { userId: BigInt(userId), isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    if (!recommendation) {
      throw new NotFoundException('No active nutrition recommendation found');
    }
    return this.mapRecommendation(recommendation);
  }

  async createRecommendation(
    userId: number,
    dto: CreateNutritionRecDto,
  ): Promise<NutritionRecommendationResponse> {
    return this.prisma.$transaction(async (tx) => {
      await tx.nutritionRecommendation.updateMany({
        where: { userId: BigInt(userId), isActive: true },
        data: {
          isActive: false,
          effectiveTo: new Date(),
        },
      });

      const rec = await tx.nutritionRecommendation.create({
        data: {
          userId: BigInt(userId),
          dailyCaloriesKcal: dto.dailyCaloriesKcal,
          proteinG: dto.proteinG,
          carbohydratesG: dto.carbohydratesG,
          fatsG: dto.fatsG,
          effectiveFrom: new Date(dto.effectiveFrom),
          effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
          notes: dto.notes,
          source: 'coach',
          isActive: true,
        },
      });
      return this.mapRecommendation(rec);
    });
  }

  async generateSmartRecommendation(
    userId: number,
  ): Promise<NutritionRecommendationResponse> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId: BigInt(userId) },
    });

    this.validateProfileForTdee(profile);

    const weightKg = Number(profile!.weightKg);
    const heightCm = Number(profile!.heightCm);
    const age = profile!.age!;
    const gender = profile!.gender;
    const activityLevel = profile!.activityLevel!;
    const fitnessGoal = profile!.fitnessGoal!;
    const trainingDays = profile!.trainingDaysPerWeek;

    const bmr = this.calculateBmr(weightKg, heightCm, age, gender);
    const activityMultiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.2;
    const trainingFloor = TRAINING_DAYS_FLOOR_MULTIPLIERS[trainingDays] ?? 1.2;
    const tdee = bmr * Math.max(activityMultiplier, trainingFloor);
    const adjustedCalories = Math.max(
      MIN_DAILY_CALORIES,
      Math.round(this.applyGoalAdjustment(tdee, fitnessGoal)),
    );
    const macros = this.calculateMacros(adjustedCalories, weightKg);

    this.logger.log(
      `Generated TDEE for user ${userId}: BMR=${bmr.toFixed(0)}, TDEE=${tdee.toFixed(0)}, adjusted=${adjustedCalories}`,
    );

    return this.createRecommendationFromGeneration(userId, {
      dailyCaloriesKcal: adjustedCalories,
      ...macros,
    });
  }

  private validateProfileForTdee(
    profile: Awaited<ReturnType<typeof this.prisma.userProfile.findUnique>>,
  ): void {
    if (
      !profile ||
      profile.heightCm === null ||
      profile.weightKg === null ||
      profile.age === null ||
      !profile.activityLevel ||
      !profile.fitnessGoal
    ) {
      throw new BadRequestException('Complete your profile first');
    }
  }

  private calculateBmr(
    weightKg: number,
    heightCm: number,
    age: number,
    gender: string | null,
  ): number {
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;

    if (gender === 'male') {
      return base + 5;
    }
    if (gender === 'female') {
      return base - 161;
    }
    // other/unknown: average of male and female
    return base + (5 + -161) / 2;
  }

  private applyGoalAdjustment(tdee: number, fitnessGoal: string): number {
    if (fitnessGoal === 'lose_weight') {
      // Cap deficit at the smaller of 500 kcal or 20% of TDEE to prevent
      // overly aggressive cuts for people with low activity / low TDEE.
      const safeDeficit = Math.min(500, Math.round(tdee * 0.2));
      return tdee - safeDeficit;
    }
    if (fitnessGoal === 'gain_muscle') {
      return tdee + 300;
    }
    return tdee;
  }

  private calculateMacros(
    adjustedCalories: number,
    weightKg: number,
  ): { proteinG: number; carbohydratesG: number; fatsG: number } {
    const maxProteinCalories = adjustedCalories * 0.35;
    const proteinG = Math.round(
      Math.min(weightKg * 2.0, maxProteinCalories / 4),
    );
    const fatsG = Math.round((adjustedCalories * 0.25) / 9);
    const carbohydratesG = Math.max(
      0,
      Math.round((adjustedCalories - proteinG * 4 - fatsG * 9) / 4),
    );

    return { proteinG, fatsG, carbohydratesG };
  }

  private async createRecommendationFromGeneration(
    userId: number,
    data: {
      dailyCaloriesKcal: number;
      proteinG: number;
      carbohydratesG: number;
      fatsG: number;
    },
  ): Promise<NutritionRecommendationResponse> {
    return this.prisma.$transaction(async (tx) => {
      await tx.nutritionRecommendation.updateMany({
        where: { userId: BigInt(userId), isActive: true },
        data: {
          isActive: false,
          effectiveTo: new Date(),
        },
      });

      const rec = await tx.nutritionRecommendation.create({
        data: {
          userId: BigInt(userId),
          dailyCaloriesKcal: data.dailyCaloriesKcal,
          proteinG: data.proteinG,
          carbohydratesG: data.carbohydratesG,
          fatsG: data.fatsG,
          source: 'system',
          effectiveFrom: new Date(),
          isActive: true,
        },
      });
      return this.mapRecommendation(rec);
    });
  }

  async logDailyNutrition(userId: number, dto: LogDailyNutritionDto) {
    const logDate = new Date(dto.logDate);

    return this.prisma.dailyNutritionLog.upsert({
      where: {
        userId_logDate: { userId: BigInt(userId), logDate },
      },
      update: {
        totalCaloriesKcal: dto.totalCaloriesKcal,
        proteinG: dto.proteinG,
        carbohydratesG: dto.carbohydratesG,
        fatsG: dto.fatsG,
        notes: dto.notes,
      },
      create: {
        userId: BigInt(userId),
        logDate,
        totalCaloriesKcal: dto.totalCaloriesKcal,
        proteinG: dto.proteinG,
        carbohydratesG: dto.carbohydratesG,
        fatsG: dto.fatsG,
        notes: dto.notes,
      },
    });
  }

  async getDailyLogs(userId: number, query: GetDailyLogsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.DailyNutritionLogWhereInput = {
      userId: BigInt(userId),
    };

    if (query.startDate || query.endDate) {
      where.logDate = {};
      if (query.startDate) {
        where.logDate.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.logDate.lte = new Date(query.endDate);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.dailyNutritionLog.findMany({
        where,
        orderBy: { logDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.dailyNutritionLog.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getAdjustmentHistory(userId: number, query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.NutritionAdjustmentWhereInput = {
      userId: BigInt(userId),
    };

    const [data, total] = await Promise.all([
      this.prisma.nutritionAdjustment.findMany({
        where,
        include: { nutritionRecommendation: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.nutritionAdjustment.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async detectPlateauAndAdjust(userId: number) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId: BigInt(userId) },
    });
    if (!profile || !profile.fitnessGoal) {
      throw new BadRequestException(
        'Complete your profile with a fitness goal first',
      );
    }

    const weeklyAverages = await this.getRecentWeeklyAverages(userId);
    if (weeklyAverages.length < 3) {
      return { plateauDetected: false, reason: 'Insufficient data' };
    }

    const last3 = weeklyAverages.slice(-3);
    const oldest = last3[0].avgWeightKg;
    const newest = last3[2].avgWeightKg;
    const weightChange = Math.abs(newest - oldest);

    if (weightChange >= 0.5) {
      return { plateauDetected: false };
    }

    const fitnessGoal = profile.fitnessGoal;
    if (fitnessGoal === 'maintain') {
      return {
        plateauDetected: true,
        reason: 'Maintain goal — no adjustment needed',
      };
    }

    const activeRec = await this.prisma.nutritionRecommendation.findFirst({
      where: { userId: BigInt(userId), isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    if (!activeRec) {
      throw new NotFoundException('No active nutrition recommendation found');
    }

    const newMacros = this.calculatePlateauAdjustment(
      activeRec.dailyCaloriesKcal,
      fitnessGoal,
      newest,
    );

    const { newRecommendation, adjustment } =
      await this.createPlateauAdjustmentRecords(
        userId,
        activeRec,
        newMacros,
        newest,
      );

    this.logger.log(
      `Plateau detected for user ${userId}: weight change ${weightChange.toFixed(2)} kg over 3 weeks. Calories adjusted ${activeRec.dailyCaloriesKcal} → ${newMacros.dailyCaloriesKcal}`,
    );

    return {
      plateauDetected: true,
      adjustment,
      newRecommendation,
    };
  }

  private calculatePlateauAdjustment(
    currentCalories: number,
    fitnessGoal: string,
    latestWeight: number,
  ): {
    dailyCaloriesKcal: number;
    proteinG: number;
    carbohydratesG: number;
    fatsG: number;
  } {
    const calorieAdjustment = fitnessGoal === 'lose_weight' ? -100 : 100;
    const dailyCaloriesKcal = Math.max(
      MIN_DAILY_CALORIES,
      currentCalories + calorieAdjustment,
    );

    const proteinG = Math.round(
      Math.min(latestWeight * 2.0, (dailyCaloriesKcal * 0.35) / 4),
    );
    const fatsG = Math.round((dailyCaloriesKcal * 0.25) / 9);
    const carbohydratesG = Math.max(
      0,
      Math.round((dailyCaloriesKcal - proteinG * 4 - fatsG * 9) / 4),
    );

    return { dailyCaloriesKcal, proteinG, carbohydratesG, fatsG };
  }

  private async createPlateauAdjustmentRecords(
    userId: number,
    activeRec: {
      dailyCaloriesKcal: number;
      proteinG: number;
      carbohydratesG: number;
      fatsG: number;
    },
    newMacros: {
      dailyCaloriesKcal: number;
      proteinG: number;
      carbohydratesG: number;
      fatsG: number;
    },
    latestWeight: number,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.nutritionRecommendation.updateMany({
        where: { userId: BigInt(userId), isActive: true },
        data: { isActive: false, effectiveTo: new Date() },
      });

      const newRecommendation = await tx.nutritionRecommendation.create({
        data: {
          userId: BigInt(userId),
          dailyCaloriesKcal: newMacros.dailyCaloriesKcal,
          proteinG: newMacros.proteinG,
          carbohydratesG: newMacros.carbohydratesG,
          fatsG: newMacros.fatsG,
          source: 'system',
          effectiveFrom: new Date(),
          isActive: true,
        },
      });

      const adjustment = await tx.nutritionAdjustment.create({
        data: {
          userId: BigInt(userId),
          nutritionRecommendationId: newRecommendation.id,
          triggerReason: 'plateau_detected',
          previousCaloriesKcal: activeRec.dailyCaloriesKcal,
          newCaloriesKcal: newMacros.dailyCaloriesKcal,
          previousProteinG: activeRec.proteinG,
          newProteinG: newMacros.proteinG,
          previousCarbohydratesG: activeRec.carbohydratesG,
          newCarbohydratesG: newMacros.carbohydratesG,
          previousFatsG: activeRec.fatsG,
          newFatsG: newMacros.fatsG,
          weeklyAvgWeightKg: latestWeight,
          notes: 'Body weight plateau detected over 3 weeks',
          source: 'system',
        },
      });

      return { newRecommendation, adjustment };
    });
  }

  private async getRecentWeeklyAverages(
    userId: number,
  ): Promise<{ weekStart: Date; avgWeightKg: number }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 21);

    const logs = await this.prisma.bodyWeightLog.findMany({
      where: {
        userId: BigInt(userId),
        logDate: { gte: startDate },
      },
      orderBy: { logDate: 'asc' },
    });

    const weekMap = new Map<
      string,
      { weekStart: Date; totalWeight: number; count: number }
    >();

    for (const log of logs) {
      const weekStart = getMonday(new Date(log.logDate));
      const key = weekStart.toISOString().slice(0, 10);

      const existing = weekMap.get(key) ?? {
        weekStart,
        totalWeight: 0,
        count: 0,
      };
      existing.totalWeight += Number(log.weightKg);
      existing.count += 1;
      weekMap.set(key, existing);
    }

    return Array.from(weekMap.values())
      .map((w) => ({
        weekStart: w.weekStart,
        avgWeightKg: parseFloat((w.totalWeight / w.count).toFixed(1)),
      }))
      .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
  }
}
