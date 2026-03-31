import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Notification_type } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

interface CurrentSetInput {
  id: bigint;
  exerciseId: bigint;
  workoutSessionId: bigint;
  reps: number;
  weightKg: { toNumber(): number } | null;
}

type TrainingGoal = 'strength' | 'hypertrophy' | 'endurance';

interface ThresholdRule {
  weightIncreaseMin: number;
  repDropMin: number;
}

const THRESHOLD_RULES: Record<TrainingGoal, ThresholdRule> = {
  strength: { weightIncreaseMin: 10, repDropMin: 20 },
  hypertrophy: { weightIncreaseMin: 15, repDropMin: 25 },
  endurance: { weightIncreaseMin: 20, repDropMin: 30 },
};

@Injectable()
export class EgoLiftService {
  private readonly logger = new Logger(EgoLiftService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async getAlerts(userId: number, query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = { userId: BigInt(userId), isDismissed: false };

    const [data, total] = await Promise.all([
      this.prisma.egoLiftAlert.findMany({
        where,
        include: { exercise: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.egoLiftAlert.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getAlertsByExercise(
    userId: number,
    exerciseId: number,
    query: PaginationQueryDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = {
      userId: BigInt(userId),
      exerciseId: BigInt(exerciseId),
    };

    const [data, total] = await Promise.all([
      this.prisma.egoLiftAlert.findMany({
        where,
        include: { exercise: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.egoLiftAlert.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async dismissAlert(userId: number, alertId: number) {
    const alert = await this.prisma.egoLiftAlert.findUnique({
      where: { id: BigInt(alertId) },
    });
    if (!alert || alert.userId !== BigInt(userId)) {
      throw new NotFoundException('Alert not found');
    }

    return this.prisma.egoLiftAlert.update({
      where: { id: BigInt(alertId) },
      data: { isDismissed: true },
    });
  }

  async analyzeSet(
    userId: number,
    currentSet: CurrentSetInput,
    trainingGoal: string,
  ): Promise<void> {
    if (currentSet.weightKg === null) {
      return;
    }

    const previousSet = await this.prisma.workoutSet.findFirst({
      where: {
        exerciseId: currentSet.exerciseId,
        workoutSession: { userId: BigInt(userId) },
        isWarmup: false,
        NOT: { workoutSessionId: currentSet.workoutSessionId },
      },
      orderBy: { performedAt: 'desc' },
    });

    if (!previousSet || previousSet.weightKg === null) {
      return;
    }

    const currentWeight = currentSet.weightKg.toNumber();
    const previousWeight = Number(previousSet.weightKg);

    if (previousWeight <= 0) {
      return;
    }

    const weightIncreasePercent =
      ((currentWeight - previousWeight) / previousWeight) * 100;
    const repDropPercent =
      previousSet.reps > 0
        ? ((previousSet.reps - currentSet.reps) / previousSet.reps) * 100
        : 0;

    const goal = this.normalizeGoal(trainingGoal);
    const rule = THRESHOLD_RULES[goal];

    if (
      weightIncreasePercent <= rule.weightIncreaseMin ||
      repDropPercent < rule.repDropMin
    ) {
      return;
    }

    const severity = repDropPercent >= 33 ? 'critical' : 'warning';
    const message =
      `Weight increased by ${Math.round(weightIncreasePercent)}% ` +
      `while reps dropped by ${Math.round(repDropPercent)}% — ` +
      `possible ego-lift detected.`;

    await this.prisma.egoLiftAlert.create({
      data: {
        userId: BigInt(userId),
        exerciseId: currentSet.exerciseId,
        workoutSetId: currentSet.id,
        severity,
        message,
        previousWeightKg: previousWeight,
        flaggedWeightKg: currentWeight,
        previousReps: previousSet.reps,
        flaggedReps: currentSet.reps,
        trainingGoal: goal,
      },
    });

    this.logger.warn(
      `Ego-lift detected: user=${userId} exercise=${currentSet.exerciseId} severity=${severity}`,
    );

    try {
      await this.notificationService.createNotification(
        userId,
        Notification_type.ego_lift_warning,
        'Ego-Lift Warning',
        message,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send ego-lift notification: user=${userId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private normalizeGoal(goal: string): TrainingGoal {
    if (goal === 'strength' || goal === 'hypertrophy' || goal === 'endurance') {
      return goal;
    }
    return 'hypertrophy';
  }
}
