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
var ExerciseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ExerciseService = ExerciseService_1 = class ExerciseService {
    prisma;
    logger = new common_1.Logger(ExerciseService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.search) {
            where.name = { contains: query.search };
        }
        if (query.category) {
            where.category = query.category;
        }
        if (query.difficulty) {
            where.difficulty = query.difficulty;
        }
        if (query.muscleGroupId) {
            where.exerciseMuscles = {
                some: { muscleGroupId: BigInt(Number(query.muscleGroupId)) },
            };
        }
        if (query.equipmentId) {
            where.exerciseEquipment = {
                some: { equipmentId: BigInt(Number(query.equipmentId)) },
            };
        }
        const [data, total] = await Promise.all([
            this.prisma.exercise.findMany({
                where,
                skip,
                take: limit,
                include: {
                    exerciseMuscles: { include: { muscleGroup: true } },
                    exerciseEquipment: { include: { equipment: true } },
                },
                orderBy: { name: 'asc' },
            }),
            this.prisma.exercise.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async findOne(id) {
        const exercise = await this.prisma.exercise.findUnique({
            where: { id: BigInt(id) },
            include: {
                exerciseMuscles: { include: { muscleGroup: true } },
                exerciseEquipment: { include: { equipment: true } },
            },
        });
        if (!exercise) {
            throw new common_1.NotFoundException('Exercise not found');
        }
        return exercise;
    }
    async create(dto) {
        try {
            return await this.prisma.exercise.create({
                data: {
                    name: dto.name,
                    description: dto.description,
                    category: dto.category,
                    difficulty: dto.difficulty,
                    isBodyweight: dto.isBodyweight ?? false,
                    exerciseMuscles: dto.muscleGroupIds?.length
                        ? {
                            create: dto.muscleGroupIds.map((muscleGroupId) => ({
                                muscleGroupId: BigInt(muscleGroupId),
                            })),
                        }
                        : undefined,
                    exerciseEquipment: dto.equipmentIds?.length
                        ? {
                            create: dto.equipmentIds.map((equipmentId) => ({
                                equipmentId: BigInt(equipmentId),
                            })),
                        }
                        : undefined,
                },
                include: {
                    exerciseMuscles: { include: { muscleGroup: true } },
                    exerciseEquipment: { include: { equipment: true } },
                },
            });
        }
        catch (e) {
            if (e.code === 'P2002') {
                throw new common_1.ConflictException(`Exercise "${dto.name}" already exists`);
            }
            throw e;
        }
    }
    async update(id, dto) {
        const existing = await this.prisma.exercise.findUnique({
            where: { id: BigInt(id) },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Exercise not found');
        }
        try {
            return await this.prisma.$transaction(async (tx) => {
                if (dto.muscleGroupIds !== undefined) {
                    await tx.exerciseMuscle.deleteMany({
                        where: { exerciseId: BigInt(id) },
                    });
                }
                if (dto.equipmentIds !== undefined) {
                    await tx.exerciseEquipment.deleteMany({
                        where: { exerciseId: BigInt(id) },
                    });
                }
                return tx.exercise.update({
                    where: { id: BigInt(id) },
                    data: {
                        ...(dto.name !== undefined && { name: dto.name }),
                        ...(dto.description !== undefined && {
                            description: dto.description,
                        }),
                        ...(dto.category !== undefined && {
                            category: dto.category,
                        }),
                        ...(dto.difficulty !== undefined && {
                            difficulty: dto.difficulty,
                        }),
                        ...(dto.isBodyweight !== undefined && {
                            isBodyweight: dto.isBodyweight,
                        }),
                        ...(dto.muscleGroupIds?.length && {
                            exerciseMuscles: {
                                create: dto.muscleGroupIds.map((muscleGroupId) => ({
                                    muscleGroupId: BigInt(muscleGroupId),
                                })),
                            },
                        }),
                        ...(dto.equipmentIds?.length && {
                            exerciseEquipment: {
                                create: dto.equipmentIds.map((equipmentId) => ({
                                    equipmentId: BigInt(equipmentId),
                                })),
                            },
                        }),
                    },
                    include: {
                        exerciseMuscles: { include: { muscleGroup: true } },
                        exerciseEquipment: { include: { equipment: true } },
                    },
                });
            });
        }
        catch (e) {
            if (e.code === 'P2002') {
                throw new common_1.ConflictException(`Exercise "${dto.name}" already exists`);
            }
            throw e;
        }
    }
    async remove(id) {
        const existing = await this.prisma.exercise.findUnique({
            where: { id: BigInt(id) },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Exercise not found');
        }
        await this.prisma.exercise.delete({ where: { id: BigInt(id) } });
    }
};
exports.ExerciseService = ExerciseService;
exports.ExerciseService = ExerciseService = ExerciseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExerciseService);
//# sourceMappingURL=exercise.service.js.map