import { Injectable, Logger } from '@nestjs/common';
import { Milestone, Notification_type, UserMilestone } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import {
  MilestoneResponse,
  UserMilestoneResponse,
} from './interfaces/milestone.interface';

interface MilestoneCriteria {
  targetValue?: number;
  unit?: string;
}

@Injectable()
export class MilestoneService {
  private readonly logger = new Logger(MilestoneService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async getAllMilestones(): Promise<MilestoneResponse[]> {
    const records = await this.prisma.milestone.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    return records.map((m) => this.mapMilestone(m));
  }

  async getUserMilestones(userId: number): Promise<UserMilestoneResponse[]> {
    const records = await this.prisma.userMilestone.findMany({
      where: { userId: BigInt(userId) },
      include: { milestone: true },
      orderBy: { achievedAt: 'desc' },
    });
    return records.map((um) => this.mapUserMilestone(um));
  }

  async checkAndAwardMilestones(userId: number): Promise<MilestoneResponse[]> {
    const [allMilestones, earnedMilestones] = await Promise.all([
      this.prisma.milestone.findMany({ orderBy: { id: 'asc' } }),
      this.prisma.userMilestone.findMany({
        where: { userId: BigInt(userId) },
        select: { milestoneId: true },
      }),
    ]);

    const earnedIds = new Set(earnedMilestones.map((m) => m.milestoneId));
    const unearnedMilestones = allMilestones.filter(
      (m) => !earnedIds.has(m.id),
    );

    if (unearnedMilestones.length === 0) {
      return [];
    }

    const stats = await this.fetchUserStats(userId);
    const newlyAwarded: Milestone[] = [];

    for (const milestone of unearnedMilestones) {
      const criteria = this.parseCriteria(milestone.criteriaJson);
      if (!criteria.targetValue) {
        continue;
      }

      const qualified = this.evaluateMilestone(
        milestone.category,
        criteria.targetValue,
        stats,
      );

      if (qualified) {
        newlyAwarded.push(milestone);
      }
    }

    if (newlyAwarded.length > 0) {
      await this.prisma.$transaction(
        newlyAwarded.map((m) =>
          this.prisma.userMilestone.create({
            data: {
              userId: BigInt(userId),
              milestoneId: m.id,
              achievedAt: new Date(),
            },
          }),
        ),
      );

      this.logger.log(
        `Awarded ${newlyAwarded.length} milestone(s) to user ${userId}: ${newlyAwarded.map((m) => m.name).join(', ')}`,
      );

      for (const m of newlyAwarded) {
        try {
          await this.notificationService.createNotification(
            userId,
            Notification_type.milestone,
            'Milestone Achieved!',
            `You earned the "${m.name}" milestone!`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to send milestone notification: user=${userId} milestone=${m.name}`,
            error instanceof Error ? error.stack : undefined,
          );
        }
      }
    }

    return newlyAwarded.map((m) => this.mapMilestone(m));
  }

  private mapMilestone(raw: Milestone): MilestoneResponse {
    return {
      id: Number(raw.id),
      name: raw.name,
      description: raw.description ?? null,
      category: raw.category,
      iconUrl: raw.iconUrl ?? null,
      createdAt: raw.createdAt,
    };
  }

  private mapUserMilestone(
    raw: UserMilestone & { milestone: Milestone },
  ): UserMilestoneResponse {
    return {
      id: Number(raw.id),
      userId: Number(raw.userId),
      milestoneId: Number(raw.milestoneId),
      achievedAt: raw.achievedAt,
      milestone: this.mapMilestone(raw.milestone),
    };
  }

  private parseCriteria(criteriaJson: unknown): MilestoneCriteria {
    if (
      criteriaJson &&
      typeof criteriaJson === 'object' &&
      !Array.isArray(criteriaJson)
    ) {
      const obj = criteriaJson as Record<string, unknown>;
      return {
        targetValue:
          typeof obj.targetValue === 'number' ? obj.targetValue : undefined,
        unit: typeof obj.unit === 'string' ? obj.unit : undefined,
      };
    }
    return {};
  }

  private evaluateMilestone(
    category: string,
    targetValue: number,
    stats: UserStats,
  ): boolean {
    switch (category) {
      case 'strength':
        return stats.maxPrValue >= targetValue;
      case 'consistency':
        return stats.completedSessions >= targetValue;
      case 'weight':
        return stats.weightChangeMagnitude >= targetValue;
      case 'nutrition':
        return stats.nutritionLogCount >= targetValue;
      case 'general':
        return false;
      default:
        return false;
    }
  }

  private async fetchUserStats(userId: number): Promise<UserStats> {
    const [
      personalRecords,
      completedSessions,
      firstWeight,
      latestWeight,
      nutritionLogCount,
    ] = await Promise.all([
      this.prisma.personalRecord.findMany({
        where: { userId: BigInt(userId), recordType: 'max_weight' },
        select: { value: true },
      }),
      this.prisma.workoutSession.count({
        where: { userId: BigInt(userId), status: 'completed' },
      }),
      this.prisma.bodyWeightLog.findFirst({
        where: { userId: BigInt(userId) },
        orderBy: { logDate: 'asc' },
        select: { weightKg: true },
      }),
      this.prisma.bodyWeightLog.findFirst({
        where: { userId: BigInt(userId) },
        orderBy: { logDate: 'desc' },
        select: { weightKg: true },
      }),
      this.prisma.dailyNutritionLog.count({
        where: { userId: BigInt(userId) },
      }),
    ]);

    const maxPrValue = personalRecords.reduce(
      (max, pr) => Math.max(max, Number(pr.value)),
      0,
    );

    const weightChangeMagnitude =
      firstWeight && latestWeight
        ? Math.abs(Number(firstWeight.weightKg) - Number(latestWeight.weightKg))
        : 0;

    return {
      maxPrValue,
      completedSessions,
      weightChangeMagnitude,
      nutritionLogCount,
    };
  }
}

interface UserStats {
  maxPrValue: number;
  completedSessions: number;
  weightChangeMagnitude: number;
  nutritionLogCount: number;
}
