import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutPlanDto, UpdateWorkoutPlanDto } from './dto';

const PLAN_INCLUDE = {
  days: {
    orderBy: { dayNumber: 'asc' as const },
    include: {
      exercises: {
        orderBy: { sortOrder: 'asc' as const },
        include: { exercise: true },
      },
    },
  },
} as const;

@Injectable()
export class WorkoutPlanService {
  private readonly logger = new Logger(WorkoutPlanService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateWorkoutPlanDto) {
    return this.prisma.workoutPlan.create({
      data: {
        userId: BigInt(userId),
        createdBy: BigInt(userId),
        name: dto.name,
        description: dto.description,
        trainingGoal: dto.trainingGoal as never,
        daysPerWeek: dto.daysPerWeek,
        durationWeeks: dto.durationWeeks,
        startedAt: dto.startedAt ? new Date(dto.startedAt) : undefined,
        source: 'user',
        days: dto.days?.length
          ? {
              create: dto.days.map((day) => ({
                dayNumber: day.dayNumber,
                name: day.name,
                isRestDay: day.isRestDay ?? false,
                exercises: day.exercises?.length
                  ? {
                      create: day.exercises.map((ex) => ({
                        exerciseId: BigInt(ex.exerciseId),
                        sortOrder: ex.sortOrder ?? 1,
                        targetSets: ex.targetSets ?? 3,
                        targetRepsMin: ex.targetRepsMin ?? 8,
                        targetRepsMax: ex.targetRepsMax ?? 12,
                        targetWeightKg: ex.targetWeightKg,
                        targetRpe: ex.targetRpe,
                        restSeconds: ex.restSeconds ?? 90,
                        notes: ex.notes,
                      })),
                    }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: PLAN_INCLUDE,
    });
  }

  async findAllByUser(userId: number) {
    return this.prisma.workoutPlan.findMany({
      where: { userId: BigInt(userId) },
      include: PLAN_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: number, planId: number) {
    const plan = await this.prisma.workoutPlan.findUnique({
      where: { id: BigInt(planId) },
      include: PLAN_INCLUDE,
    });
    if (!plan || plan.userId !== BigInt(userId)) {
      throw new NotFoundException('Workout plan not found');
    }
    return plan;
  }

  async getActivePlan(userId: number) {
    const plan = await this.prisma.workoutPlan.findFirst({
      where: { userId: BigInt(userId), isActive: true },
      include: PLAN_INCLUDE,
    });
    if (!plan) {
      throw new NotFoundException('No active workout plan found');
    }
    return plan;
  }

  async update(userId: number, planId: number, dto: UpdateWorkoutPlanDto) {
    await this.findOne(userId, planId);

    return this.prisma.$transaction(async (tx) => {
      if (dto.days !== undefined) {
        const existingDays = await tx.workoutPlanDay.findMany({
          where: { workoutPlanId: BigInt(planId) },
          select: { id: true },
        });
        const dayIds = existingDays.map((d) => d.id);
        if (dayIds.length) {
          await tx.workoutPlanExercise.deleteMany({
            where: { workoutPlanDayId: { in: dayIds } },
          });
        }
        await tx.workoutPlanDay.deleteMany({
          where: { workoutPlanId: BigInt(planId) },
        });
      }

      return tx.workoutPlan.update({
        where: { id: BigInt(planId) },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.description !== undefined && {
            description: dto.description,
          }),
          ...(dto.trainingGoal !== undefined && {
            trainingGoal: dto.trainingGoal as never,
          }),
          ...(dto.daysPerWeek !== undefined && {
            daysPerWeek: dto.daysPerWeek,
          }),
          ...(dto.durationWeeks !== undefined && {
            durationWeeks: dto.durationWeeks,
          }),
          ...(dto.startedAt !== undefined && {
            startedAt: new Date(dto.startedAt),
          }),
          ...(dto.days?.length && {
            days: {
              create: dto.days.map((day) => ({
                dayNumber: day.dayNumber,
                name: day.name,
                isRestDay: day.isRestDay ?? false,
                exercises: day.exercises?.length
                  ? {
                      create: day.exercises.map((ex) => ({
                        exerciseId: BigInt(ex.exerciseId),
                        sortOrder: ex.sortOrder ?? 1,
                        targetSets: ex.targetSets ?? 3,
                        targetRepsMin: ex.targetRepsMin ?? 8,
                        targetRepsMax: ex.targetRepsMax ?? 12,
                        targetWeightKg: ex.targetWeightKg,
                        targetRpe: ex.targetRpe,
                        restSeconds: ex.restSeconds ?? 90,
                        notes: ex.notes,
                      })),
                    }
                  : undefined,
              })),
            },
          }),
        },
        include: PLAN_INCLUDE,
      });
    });
  }

  async remove(userId: number, planId: number): Promise<void> {
    await this.findOne(userId, planId);
    await this.prisma.workoutPlan.delete({ where: { id: BigInt(planId) } });
  }

  async activate(userId: number, planId: number) {
    await this.findOne(userId, planId);

    return this.prisma.$transaction(async (tx) => {
      await tx.workoutPlan.updateMany({
        where: { userId: BigInt(userId), isActive: true },
        data: { isActive: false },
      });
      return tx.workoutPlan.update({
        where: { id: BigInt(planId) },
        data: { isActive: true },
        include: PLAN_INCLUDE,
      });
    });
  }
}
