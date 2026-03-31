import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PersonalRecordService } from '../personal-record/personal-record.service';
import { EgoLiftService } from '../ego-lift/ego-lift.service';
import { MilestoneService } from '../milestone/milestone.service';
import { StartSessionDto, LogSetDto, CompleteSessionDto } from './dto';

const SESSION_SETS_INCLUDE = {
  sets: {
    orderBy: { setNumber: 'asc' as const },
    include: { exercise: true },
  },
} as const;

@Injectable()
export class WorkoutLogService {
  private readonly logger = new Logger(WorkoutLogService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly personalRecordService: PersonalRecordService,
    private readonly egoLiftService: EgoLiftService,
    private readonly milestoneService: MilestoneService,
  ) {}

  async startSession(userId: number, dto: StartSessionDto) {
    return this.prisma.workoutSession.create({
      data: {
        userId: BigInt(userId),
        workoutPlanDayId: dto.workoutPlanDayId
          ? BigInt(dto.workoutPlanDayId)
          : undefined,
        notes: dto.notes,
        status: 'in_progress',
      },
      include: SESSION_SETS_INCLUDE,
    });
  }

  async logSet(userId: number, sessionId: number, dto: LogSetDto) {
    const session = await this.prisma.workoutSession.findUnique({
      where: { id: BigInt(sessionId) },
    });
    if (!session || session.userId !== BigInt(userId)) {
      throw new NotFoundException('Session not found');
    }
    if (session.status !== 'in_progress') {
      throw new BadRequestException(
        'Cannot log sets to a session that is not in progress',
      );
    }

    const newSet = await this.prisma.workoutSet.create({
      data: {
        workoutSessionId: BigInt(sessionId),
        exerciseId: BigInt(dto.exerciseId),
        setNumber: dto.setNumber,
        reps: dto.reps,
        weightKg: dto.weightKg,
        rpe: dto.rpe,
        isWarmup: dto.isWarmup ?? false,
        notes: dto.notes,
      },
      include: { exercise: true },
    });

    if (!newSet.isWarmup) {
      try {
        await this.personalRecordService.evaluateAndUpdateRecords(userId, {
          id: newSet.id,
          exerciseId: newSet.exerciseId,
          reps: newSet.reps,
          weightKg: newSet.weightKg,
          performedAt: newSet.performedAt,
        });
      } catch (error) {
        this.logger.error(
          `Failed to evaluate personal records for set ${newSet.id}`,
          error instanceof Error ? error.stack : undefined,
        );
      }

      try {
        const settings = await this.prisma.progressionSetting.findUnique({
          where: { userId: BigInt(userId) },
        });
        const trainingGoal = settings?.trainingGoal ?? 'hypertrophy';

        await this.egoLiftService.analyzeSet(
          userId,
          {
            id: newSet.id,
            exerciseId: newSet.exerciseId,
            workoutSessionId: newSet.workoutSessionId,
            reps: newSet.reps,
            weightKg: newSet.weightKg,
          },
          trainingGoal,
        );
      } catch (error) {
        this.logger.error(
          `Failed to analyze ego-lift for set ${newSet.id}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    return newSet;
  }

  async completeSession(
    userId: number,
    sessionId: number,
    dto: CompleteSessionDto,
  ) {
    const session = await this.prisma.workoutSession.findUnique({
      where: { id: BigInt(sessionId) },
    });
    if (!session || session.userId !== BigInt(userId)) {
      throw new NotFoundException('Session not found');
    }

    const completedAt = new Date();
    const durationMinutes = Math.round(
      (completedAt.getTime() - session.startedAt.getTime()) / 60_000,
    );

    const updated = await this.prisma.workoutSession.update({
      where: { id: BigInt(sessionId) },
      data: {
        status: 'completed',
        completedAt,
        durationMinutes,
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: SESSION_SETS_INCLUDE,
    });

    try {
      await this.milestoneService.checkAndAwardMilestones(userId);
    } catch (error) {
      this.logger.error(
        `Failed to check milestones for user ${userId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    return updated;
  }

  async getSessionHistory(userId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = { userId: BigInt(userId) };

    const [data, total] = await Promise.all([
      this.prisma.workoutSession.findMany({
        where,
        include: SESSION_SETS_INCLUDE,
        orderBy: { startedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.workoutSession.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getSessionById(userId: number, sessionId: number) {
    const session = await this.prisma.workoutSession.findUnique({
      where: { id: BigInt(sessionId) },
      include: SESSION_SETS_INCLUDE,
    });
    if (!session || session.userId !== BigInt(userId)) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }

  async deleteSession(userId: number, sessionId: number): Promise<void> {
    const session = await this.prisma.workoutSession.findUnique({
      where: { id: BigInt(sessionId) },
    });
    if (!session || session.userId !== BigInt(userId)) {
      throw new NotFoundException('Session not found');
    }
    await this.prisma.workoutSession.delete({
      where: { id: BigInt(sessionId) },
    });
  }
}
