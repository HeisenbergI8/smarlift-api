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
var WorkoutLogService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutLogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const SESSION_SETS_INCLUDE = {
    sets: {
        orderBy: { setNumber: 'asc' },
        include: { exercise: true },
    },
};
let WorkoutLogService = WorkoutLogService_1 = class WorkoutLogService {
    prisma;
    logger = new common_1.Logger(WorkoutLogService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async startSession(userId, dto) {
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
    async logSet(userId, sessionId, dto) {
        const session = await this.prisma.workoutSession.findUnique({
            where: { id: BigInt(sessionId) },
        });
        if (!session || session.userId !== BigInt(userId)) {
            throw new common_1.NotFoundException('Session not found');
        }
        if (session.status !== 'in_progress') {
            throw new common_1.BadRequestException('Cannot log sets to a session that is not in progress');
        }
        return this.prisma.workoutSet.create({
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
    }
    async completeSession(userId, sessionId, dto) {
        const session = await this.prisma.workoutSession.findUnique({
            where: { id: BigInt(sessionId) },
        });
        if (!session || session.userId !== BigInt(userId)) {
            throw new common_1.NotFoundException('Session not found');
        }
        const completedAt = new Date();
        const durationMinutes = Math.round((completedAt.getTime() - session.startedAt.getTime()) / 60_000);
        return this.prisma.workoutSession.update({
            where: { id: BigInt(sessionId) },
            data: {
                status: 'completed',
                completedAt,
                durationMinutes,
                ...(dto.notes !== undefined && { notes: dto.notes }),
            },
            include: SESSION_SETS_INCLUDE,
        });
    }
    async getSessionHistory(userId, page, limit) {
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
    async getSessionById(userId, sessionId) {
        const session = await this.prisma.workoutSession.findUnique({
            where: { id: BigInt(sessionId) },
            include: SESSION_SETS_INCLUDE,
        });
        if (!session || session.userId !== BigInt(userId)) {
            throw new common_1.NotFoundException('Session not found');
        }
        return session;
    }
    async deleteSession(userId, sessionId) {
        const session = await this.prisma.workoutSession.findUnique({
            where: { id: BigInt(sessionId) },
        });
        if (!session || session.userId !== BigInt(userId)) {
            throw new common_1.NotFoundException('Session not found');
        }
        await this.prisma.workoutSession.delete({
            where: { id: BigInt(sessionId) },
        });
    }
};
exports.WorkoutLogService = WorkoutLogService;
exports.WorkoutLogService = WorkoutLogService = WorkoutLogService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkoutLogService);
//# sourceMappingURL=workout-log.service.js.map