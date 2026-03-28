"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WorkoutPlanService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutPlanService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const PLAN_INCLUDE = {
    days: {
        orderBy: { dayNumber: 'asc' },
        include: {
            exercises: {
                orderBy: { sortOrder: 'asc' },
                include: { exercise: true },
            },
        },
    },
};
let WorkoutPlanService = WorkoutPlanService_1 = class WorkoutPlanService {
    prisma;
    logger = new common_1.Logger(WorkoutPlanService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        return this.prisma.workoutPlan.create({
            data: {
                userId: BigInt(userId),
                createdBy: BigInt(userId),
                name: dto.name,
                description: dto.description,
                trainingGoal: dto.trainingGoal,
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
    async findAllByUser(userId) {
        return this.prisma.workoutPlan.findMany({
            where: { userId: BigInt(userId) },
            include: PLAN_INCLUDE,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(userId, planId) {
        const plan = await this.prisma.workoutPlan.findUnique({
            where: { id: BigInt(planId) },
            include: PLAN_INCLUDE,
        });
        if (!plan || plan.userId !== BigInt(userId)) {
            throw new common_1.NotFoundException('Workout plan not found');
        }
        return plan;
    }
    async getActivePlan(userId) {
        const plan = await this.prisma.workoutPlan.findFirst({
            where: { userId: BigInt(userId), isActive: true },
            include: PLAN_INCLUDE,
        });
        if (!plan) {
            throw new common_1.NotFoundException('No active workout plan found');
        }
        return plan;
    }
    async update(userId, planId, dto) {
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
                        trainingGoal: dto.trainingGoal,
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
    async remove(userId, planId) {
        await this.findOne(userId, planId);
        await this.prisma.workoutPlan.delete({ where: { id: BigInt(planId) } });
    }
    async activate(userId, planId) {
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
};
exports.WorkoutPlanService = WorkoutPlanService;
exports.WorkoutPlanService = WorkoutPlanService = WorkoutPlanService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkoutPlanService);
//# sourceMappingURL=workout-plan.service.js.map