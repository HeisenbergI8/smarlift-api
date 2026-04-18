import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PersonalRecordService } from '../personal-record/personal-record.service';
import { EgoLiftService } from '../ego-lift/ego-lift.service';
import { MilestoneService } from '../milestone/milestone.service';
import {
  StartSessionDto,
  LogSetDto,
  CompleteSessionDto,
  SkipSessionDto,
  SessionStatusFilter,
} from './dto';
import {
  WorkoutSessionResponse,
  WorkoutSetResponse,
  PaginatedSessionsResponse,
} from './interfaces';

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

  private mapSet(raw: {
    id: bigint;
    workoutSessionId: bigint;
    exerciseId: bigint;
    setNumber: number;
    reps: number;
    weightKg: import('@prisma/client').Prisma.Decimal | null;
    rpe: import('@prisma/client').Prisma.Decimal | null;
    isWarmup: boolean;
    notes: string | null;
    performedAt: Date;
    exercise: {
      id: bigint;
      name: string;
      description: string | null;
      category: import('@prisma/client').Exercise_category;
      difficulty: import('@prisma/client').Exercise_difficulty;
      isBodyweight: boolean;
    };
  }): WorkoutSetResponse {
    return {
      id: Number(raw.id),
      workoutSessionId: Number(raw.workoutSessionId),
      exerciseId: Number(raw.exerciseId),
      setNumber: raw.setNumber,
      reps: raw.reps,
      weightKg:
        raw.weightKg !== null ? parseFloat(raw.weightKg.toString()) : null,
      rpe: raw.rpe !== null ? parseFloat(raw.rpe.toString()) : null,
      isWarmup: raw.isWarmup,
      notes: raw.notes,
      performedAt: raw.performedAt,
      exercise: {
        id: Number(raw.exercise.id),
        name: raw.exercise.name,
        description: raw.exercise.description,
        category: raw.exercise.category,
        difficulty: raw.exercise.difficulty,
        isBodyweight: raw.exercise.isBodyweight,
      },
    };
  }

  private mapSession(raw: {
    id: bigint;
    userId: bigint;
    workoutPlanDayId: bigint | null;
    status: import('@prisma/client').WorkoutSession_status;
    startedAt: Date;
    completedAt: Date | null;
    durationMinutes: number | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    sets: {
      id: bigint;
      workoutSessionId: bigint;
      exerciseId: bigint;
      setNumber: number;
      reps: number;
      weightKg: import('@prisma/client').Prisma.Decimal | null;
      rpe: import('@prisma/client').Prisma.Decimal | null;
      isWarmup: boolean;
      notes: string | null;
      performedAt: Date;
      exercise: {
        id: bigint;
        name: string;
        description: string | null;
        category: import('@prisma/client').Exercise_category;
        difficulty: import('@prisma/client').Exercise_difficulty;
        isBodyweight: boolean;
      };
    }[];
  }): WorkoutSessionResponse {
    return {
      id: Number(raw.id),
      userId: Number(raw.userId),
      workoutPlanDayId:
        raw.workoutPlanDayId !== null ? Number(raw.workoutPlanDayId) : null,
      status: raw.status,
      startedAt: raw.startedAt,
      completedAt: raw.completedAt,
      durationMinutes: raw.durationMinutes,
      notes: raw.notes,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      sets: raw.sets.map((s) => this.mapSet(s)),
    };
  }

  async startSession(
    userId: number,
    dto: StartSessionDto,
  ): Promise<WorkoutSessionResponse> {
    const existing = await this.prisma.workoutSession.findFirst({
      where: { userId: BigInt(userId), status: 'in_progress' },
    });
    if (existing) {
      throw new ConflictException(
        'You already have a session in progress. Complete or skip it before starting a new one.',
      );
    }

    const raw = await this.prisma.workoutSession.create({
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
    return this.mapSession(raw);
  }

  async logSet(
    userId: number,
    sessionId: number,
    dto: LogSetDto,
  ): Promise<WorkoutSetResponse> {
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

    return this.mapSet(newSet);
  }

  async completeSession(
    userId: number,
    sessionId: number,
    dto: CompleteSessionDto,
  ): Promise<WorkoutSessionResponse> {
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

    return this.mapSession(updated);
  }

  async getSessionHistory(
    userId: number,
    page: number,
    limit: number,
    status?: SessionStatusFilter,
  ): Promise<PaginatedSessionsResponse> {
    const skip = (page - 1) * limit;
    const where = {
      userId: BigInt(userId),
      ...(status ? { status } : {}),
    };

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

    return { data: data.map((s) => this.mapSession(s)), total, page, limit };
  }

  async getSessionById(
    userId: number,
    sessionId: number,
  ): Promise<WorkoutSessionResponse> {
    const session = await this.prisma.workoutSession.findUnique({
      where: { id: BigInt(sessionId) },
      include: SESSION_SETS_INCLUDE,
    });
    if (!session || session.userId !== BigInt(userId)) {
      throw new NotFoundException('Session not found');
    }
    return this.mapSession(session);
  }

  async skipSession(
    userId: number,
    sessionId: number,
    dto: SkipSessionDto,
  ): Promise<WorkoutSessionResponse> {
    const session = await this.prisma.workoutSession.findUnique({
      where: { id: BigInt(sessionId) },
    });
    if (!session || session.userId !== BigInt(userId)) {
      throw new NotFoundException('Session not found');
    }
    if (session.status !== 'in_progress') {
      throw new BadRequestException('Only in-progress sessions can be skipped');
    }

    const updated = await this.prisma.workoutSession.update({
      where: { id: BigInt(sessionId) },
      data: {
        status: 'skipped',
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: SESSION_SETS_INCLUDE,
    });

    return this.mapSession(updated);
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
