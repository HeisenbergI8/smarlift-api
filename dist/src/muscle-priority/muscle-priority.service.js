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
var MusclePriorityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusclePriorityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MusclePriorityService = MusclePriorityService_1 = class MusclePriorityService {
    prisma;
    logger = new common_1.Logger(MusclePriorityService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserPriorities(userId, query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;
        const bigUserId = BigInt(userId);
        const [data, total] = await Promise.all([
            this.prisma.userMusclePriority.findMany({
                where: { userId: bigUserId },
                include: { muscleGroup: true },
                skip,
                take: limit,
                orderBy: { muscleGroup: { name: 'asc' } },
            }),
            this.prisma.userMusclePriority.count({ where: { userId: bigUserId } }),
        ]);
        return { data, total, page, limit };
    }
    async upsertPriority(userId, dto) {
        const muscleGroup = await this.prisma.muscleGroup.findUnique({
            where: { id: BigInt(dto.muscleGroupId) },
        });
        if (!muscleGroup) {
            throw new common_1.NotFoundException('Muscle group not found');
        }
        const { muscleGroupId, ...rest } = dto;
        const bigUserId = BigInt(userId);
        const bigMuscleGroupId = BigInt(muscleGroupId);
        return this.prisma.userMusclePriority.upsert({
            where: {
                userId_muscleGroupId: {
                    userId: bigUserId,
                    muscleGroupId: bigMuscleGroupId,
                },
            },
            update: rest,
            create: {
                userId: bigUserId,
                muscleGroupId: bigMuscleGroupId,
                ...rest,
            },
            include: { muscleGroup: true },
        });
    }
    async deletePriority(userId, muscleGroupId) {
        const priority = await this.prisma.userMusclePriority.findUnique({
            where: {
                userId_muscleGroupId: {
                    userId: BigInt(userId),
                    muscleGroupId: BigInt(muscleGroupId),
                },
            },
        });
        if (!priority) {
            throw new common_1.NotFoundException('Muscle priority not found');
        }
        await this.prisma.userMusclePriority.delete({
            where: {
                userId_muscleGroupId: {
                    userId: BigInt(userId),
                    muscleGroupId: BigInt(muscleGroupId),
                },
            },
        });
    }
};
exports.MusclePriorityService = MusclePriorityService;
exports.MusclePriorityService = MusclePriorityService = MusclePriorityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MusclePriorityService);
//# sourceMappingURL=muscle-priority.service.js.map