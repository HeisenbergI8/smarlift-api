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
var MuscleGroupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuscleGroupService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MuscleGroupService = MuscleGroupService_1 = class MuscleGroupService {
    prisma;
    logger = new common_1.Logger(MuscleGroupService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;
        const where = query.bodyRegion
            ? { bodyRegion: query.bodyRegion }
            : {};
        const [data, total] = await Promise.all([
            this.prisma.muscleGroup.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
            }),
            this.prisma.muscleGroup.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async create(dto) {
        try {
            return await this.prisma.muscleGroup.create({
                data: {
                    name: dto.name,
                    bodyRegion: dto.bodyRegion,
                },
            });
        }
        catch (e) {
            if (e.code === 'P2002') {
                throw new common_1.ConflictException(`Muscle group "${dto.name}" already exists`);
            }
            throw e;
        }
    }
    async update(id, dto) {
        const existing = await this.prisma.muscleGroup.findUnique({
            where: { id: BigInt(id) },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Muscle group not found');
        }
        try {
            return await this.prisma.muscleGroup.update({
                where: { id: BigInt(id) },
                data: {
                    ...(dto.name !== undefined && { name: dto.name }),
                    ...(dto.bodyRegion !== undefined && {
                        bodyRegion: dto.bodyRegion,
                    }),
                },
            });
        }
        catch (e) {
            if (e.code === 'P2002') {
                throw new common_1.ConflictException(`Muscle group "${dto.name}" already exists`);
            }
            throw e;
        }
    }
    async remove(id) {
        const existing = await this.prisma.muscleGroup.findUnique({
            where: { id: BigInt(id) },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Muscle group not found');
        }
        await this.prisma.muscleGroup.delete({ where: { id: BigInt(id) } });
    }
};
exports.MuscleGroupService = MuscleGroupService;
exports.MuscleGroupService = MuscleGroupService = MuscleGroupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MuscleGroupService);
//# sourceMappingURL=muscle-group.service.js.map