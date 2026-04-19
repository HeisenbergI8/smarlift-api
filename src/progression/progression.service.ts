import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import {
  Prisma,
  ProgressionSetting_frequency,
  Notification_type,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { UpdateProgressionSettingsDto } from './dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  ExerciseSummary,
  PaginatedProgressionHistoryResponse,
  ProgressionEvaluationResponse,
  ProgressionHistoryResponse,
  ProgressionSettingResponse,
} from './interfaces';

const FREQUENCY_SESSION_MAP: Record<ProgressionSetting_frequency, number> = {
  weekly: 1,
  biweekly: 2,
  monthly: 4,
};

const DELOAD_THRESHOLD_RATIO = 0.5;
const DELOAD_REDUCTION_RATIO = 0.9;

@Injectable()
export class ProgressionService {
  private readonly logger = new Logger(ProgressionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async getSettings(userId: number): Promise<ProgressionSettingResponse> {
    const settings = await this.prisma.progressionSetting.findUnique({
      where: { userId: BigInt(userId) },
    });
    if (!settings) {
      throw new NotFoundException('Progression settings not found');
    }
    return this.mapSetting(settings);
  }

  async upsertSettings(
    userId: number,
    dto: UpdateProgressionSettingsDto,
  ): Promise<ProgressionSettingResponse> {
    const data = {
      ...(dto.isEnabled !== undefined && { isEnabled: dto.isEnabled }),
      ...(dto.progressionFrequency !== undefined && {
        progressionFrequency: dto.progressionFrequency,
      }),
      ...(dto.trainingGoal !== undefined && {
        trainingGoal: dto.trainingGoal,
      }),
      ...(dto.weightIncrementKg !== undefined && {
        weightIncrementKg: dto.weightIncrementKg,
      }),
      ...(dto.maxRepsBeforeIncrease !== undefined && {
        maxRepsBeforeIncrease: dto.maxRepsBeforeIncrease,
      }),
    };

    const result = await this.prisma.progressionSetting.upsert({
      where: { userId: BigInt(userId) },
      update: data,
      create: { userId: BigInt(userId), ...data },
    });
    return this.mapSetting(result);
  }

  async getHistory(
    userId: number,
    query: PaginationQueryDto,
  ): Promise<PaginatedProgressionHistoryResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ProgressionHistoryWhereInput = {
      userId: BigInt(userId),
    };

    const [data, total] = await Promise.all([
      this.prisma.progressionHistory.findMany({
        where,
        include: { exercise: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.progressionHistory.count({ where }),
    ]);

    return { data: data.map((h) => this.mapHistory(h)), total, page, limit };
  }

  async getHistoryByExercise(
    userId: number,
    exerciseId: number,
    query: PaginationQueryDto,
  ): Promise<PaginatedProgressionHistoryResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ProgressionHistoryWhereInput = {
      userId: BigInt(userId),
      exerciseId: BigInt(exerciseId),
    };

    const [data, total] = await Promise.all([
      this.prisma.progressionHistory.findMany({
        where,
        include: { exercise: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.progressionHistory.count({ where }),
    ]);

    return { data: data.map((h) => this.mapHistory(h)), total, page, limit };
  }

  async evaluateProgression(
    userId: number,
  ): Promise<ProgressionEvaluationResponse> {
    const settings = await this.getValidatedSettings(userId);

    if (!settings.isEnabled) {
      return { message: 'Progression tracking is disabled', adjustments: [] };
    }

    const sessionCount =
      FREQUENCY_SESSION_MAP[settings.progressionFrequency] ?? 1;

    const recentSessions = await this.fetchRecentSessions(userId, sessionCount);

    if (recentSessions.length === 0) {
      return { message: 'No completed sessions found', adjustments: [] };
    }

    const setsByExercise = this.groupSetsByExercise(recentSessions);

    return this.computeAndSaveAdjustments(userId, setsByExercise, settings);
  }

  private async getValidatedSettings(userId: number) {
    const settings = await this.prisma.progressionSetting.findUnique({
      where: { userId: BigInt(userId) },
    });
    if (!settings) {
      throw new NotFoundException('Progression settings not found');
    }
    return settings;
  }

  private async fetchRecentSessions(userId: number, sessionCount: number) {
    return this.prisma.workoutSession.findMany({
      where: {
        userId: BigInt(userId),
        status: 'completed',
      },
      orderBy: { completedAt: 'desc' },
      take: sessionCount,
      include: {
        sets: {
          where: { isWarmup: false },
          orderBy: { setNumber: 'asc' },
        },
      },
    });
  }

  private groupSetsByExercise(
    sessions: Awaited<ReturnType<typeof this.fetchRecentSessions>>,
  ): Map<bigint, { reps: number; weightKg: Prisma.Decimal | null }[]> {
    const grouped = new Map<
      bigint,
      { reps: number; weightKg: Prisma.Decimal | null }[]
    >();

    for (const session of sessions) {
      for (const set of session.sets) {
        const existing = grouped.get(set.exerciseId) ?? [];
        existing.push({ reps: set.reps, weightKg: set.weightKg });
        grouped.set(set.exerciseId, existing);
      }
    }

    return grouped;
  }

  private async computeAndSaveAdjustments(
    userId: number,
    setsByExercise: Map<
      bigint,
      { reps: number; weightKg: Prisma.Decimal | null }[]
    >,
    settings: Awaited<ReturnType<typeof this.getValidatedSettings>>,
  ) {
    const pendingAdjustments: {
      exerciseId: bigint;
      type: 'weight_increase' | 'deload';
      previousValue: number;
      newValue: number;
      reason: string;
    }[] = [];

    for (const [exerciseId, sets] of setsByExercise) {
      const avgReps = sets.reduce((sum, s) => sum + s.reps, 0) / sets.length;
      const currentWeight = await this.resolveCurrentWeight(
        userId,
        exerciseId,
        sets,
      );

      if (currentWeight === null) {
        continue;
      }

      const adjustment = this.determineAdjustment(
        avgReps,
        currentWeight,
        settings,
      );

      if (adjustment) {
        pendingAdjustments.push({
          exerciseId,
          type: adjustment.type,
          previousValue: currentWeight,
          newValue: adjustment.newValue,
          reason: adjustment.reason,
        });
      }
    }

    if (pendingAdjustments.length === 0) {
      return { message: 'No adjustments needed', adjustments: [] };
    }

    const adjustments = await this.prisma.$transaction(
      pendingAdjustments.map((adj) =>
        this.prisma.progressionHistory.create({
          data: {
            userId: BigInt(userId),
            exerciseId: adj.exerciseId,
            adjustmentType: adj.type,
            previousValue: adj.previousValue,
            newValue: adj.newValue,
            reason: adj.reason,
            source: 'system',
          },
          include: { exercise: true },
        }),
      ),
    );

    for (const adj of adjustments) {
      try {
        await this.notificationService.createNotification(
          userId,
          Notification_type.progression_update,
          'Progression Update',
          `${adj.exercise.name}: ${adj.adjustmentType === 'weight_increase' ? 'Weight increased' : 'Deload applied'} from ${Number(adj.previousValue)}kg to ${Number(adj.newValue)}kg`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send progression notification: user=${userId} exercise=${adj.exercise.name}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    return {
      message: 'Evaluation complete',
      adjustments: adjustments.map((h) => this.mapHistory(h)),
    };
  }

  private async resolveCurrentWeight(
    userId: number,
    exerciseId: bigint,
    sets: { reps: number; weightKg: Prisma.Decimal | null }[],
  ): Promise<number | null> {
    const activePlan = await this.prisma.workoutPlan.findFirst({
      where: { userId: BigInt(userId), isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        days: {
          include: {
            exercises: {
              where: { exerciseId },
            },
          },
        },
      },
    });

    const planExercise = activePlan?.days
      .flatMap((d) => d.exercises)
      .find((e) => e.exerciseId === exerciseId);

    if (planExercise?.targetWeightKg) {
      return Number(planExercise.targetWeightKg);
    }

    const lastSetWithWeight = sets.find((s) => s.weightKg !== null);
    return lastSetWithWeight ? Number(lastSetWithWeight.weightKg) : null;
  }

  private determineAdjustment(
    avgReps: number,
    currentWeight: number,
    settings: Awaited<ReturnType<typeof this.getValidatedSettings>>,
  ): {
    type: 'weight_increase' | 'deload';
    newValue: number;
    reason: string;
  } | null {
    const maxReps = settings.maxRepsBeforeIncrease;
    const increment = Number(settings.weightIncrementKg);

    if (avgReps > maxReps) {
      return {
        type: 'weight_increase',
        newValue: currentWeight + increment,
        reason: `Avg reps (${avgReps.toFixed(1)}) exceeded threshold (${maxReps})`,
      };
    }

    if (avgReps < maxReps * DELOAD_THRESHOLD_RATIO) {
      return {
        type: 'deload',
        newValue: parseFloat(
          (currentWeight * DELOAD_REDUCTION_RATIO).toFixed(2),
        ),
        reason: `Avg reps (${avgReps.toFixed(1)}) below deload threshold (${(maxReps * DELOAD_THRESHOLD_RATIO).toFixed(1)})`,
      };
    }

    return null;
  }

  private mapSetting(raw: {
    id: bigint;
    userId: bigint;
    isEnabled: boolean;
    progressionFrequency: import('@prisma/client').ProgressionSetting_frequency;
    trainingGoal: import('@prisma/client').ProgressionSetting_trainingGoal;
    weightIncrementKg: Prisma.Decimal;
    maxRepsBeforeIncrease: number;
    createdAt: Date;
    updatedAt: Date;
  }): ProgressionSettingResponse {
    return {
      id: Number(raw.id),
      userId: Number(raw.userId),
      isEnabled: raw.isEnabled,
      progressionFrequency: raw.progressionFrequency,
      trainingGoal: raw.trainingGoal,
      weightIncrementKg: parseFloat(raw.weightIncrementKg.toString()),
      maxRepsBeforeIncrease: raw.maxRepsBeforeIncrease,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  private mapHistory(raw: {
    id: bigint;
    userId: bigint;
    exerciseId: bigint;
    adjustmentType: import('@prisma/client').ProgressionHistory_adjustmentType;
    previousValue: Prisma.Decimal;
    newValue: Prisma.Decimal;
    reason: string | null;
    source: import('@prisma/client').ProgressionHistory_source;
    createdAt: Date;
    exercise: { id: bigint; name: string; description: string | null };
  }): ProgressionHistoryResponse {
    return {
      id: Number(raw.id),
      userId: Number(raw.userId),
      exerciseId: Number(raw.exerciseId),
      adjustmentType: raw.adjustmentType,
      previousValue: parseFloat(raw.previousValue.toString()),
      newValue: parseFloat(raw.newValue.toString()),
      reason: raw.reason,
      source: raw.source,
      createdAt: raw.createdAt,
      exercise: this.mapExerciseSummary(raw.exercise),
    };
  }

  private mapExerciseSummary(raw: {
    id: bigint;
    name: string;
    description: string | null;
  }): ExerciseSummary {
    return {
      id: Number(raw.id),
      name: raw.name,
      description: raw.description,
    };
  }
}
