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
var EquipmentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EquipmentService = EquipmentService_1 = class EquipmentService {
    prisma;
    logger = new common_1.Logger(EquipmentService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.equipment.findMany({
                skip,
                take: limit,
                orderBy: { name: 'asc' },
            }),
            this.prisma.equipment.count(),
        ]);
        return { data, total, page, limit };
    }
    async getUserEquipment(userId, query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;
        const bigUserId = BigInt(userId);
        const [data, total] = await Promise.all([
            this.prisma.userEquipment.findMany({
                where: { userId: bigUserId },
                include: { equipment: true },
                skip,
                take: limit,
                orderBy: { equipment: { name: 'asc' } },
            }),
            this.prisma.userEquipment.count({ where: { userId: bigUserId } }),
        ]);
        return { data, total, page, limit };
    }
    async syncUserEquipment(userId, dto) {
        const found = await this.prisma.equipment.findMany({
            where: { id: { in: dto.equipmentIds.map((id) => BigInt(id)) } },
            select: { id: true },
        });
        if (found.length !== dto.equipmentIds.length) {
            const foundIds = new Set(found.map((e) => Number(e.id)));
            const invalidIds = dto.equipmentIds.filter((id) => !foundIds.has(id));
            throw new common_1.BadRequestException(`Invalid equipment IDs: ${invalidIds.join(', ')}`);
        }
        const bigUserId = BigInt(userId);
        await this.prisma.$transaction([
            this.prisma.userEquipment.deleteMany({ where: { userId: bigUserId } }),
            this.prisma.userEquipment.createMany({
                data: dto.equipmentIds.map((equipmentId) => ({
                    userId: bigUserId,
                    equipmentId: BigInt(equipmentId),
                })),
            }),
        ]);
        return this.getUserEquipment(userId, { page: 1, limit: 100 });
    }
    async create(dto) {
        try {
            return await this.prisma.equipment.create({ data: dto });
        }
        catch (e) {
            if (e.code === 'P2002') {
                throw new common_1.ConflictException(`Equipment "${dto.name}" already exists`);
            }
            throw e;
        }
    }
    async update(id, dto) {
        const equipment = await this.prisma.equipment.findUnique({
            where: { id: BigInt(id) },
        });
        if (!equipment) {
            throw new common_1.NotFoundException('Equipment not found');
        }
        try {
            return await this.prisma.equipment.update({
                where: { id: BigInt(id) },
                data: dto,
            });
        }
        catch (e) {
            if (e.code === 'P2002') {
                throw new common_1.ConflictException(`Equipment "${dto.name}" already exists`);
            }
            throw e;
        }
    }
    async remove(id) {
        const equipment = await this.prisma.equipment.findUnique({
            where: { id: BigInt(id) },
        });
        if (!equipment) {
            throw new common_1.NotFoundException('Equipment not found');
        }
        await this.prisma.equipment.delete({ where: { id: BigInt(id) } });
    }
};
exports.EquipmentService = EquipmentService;
exports.EquipmentService = EquipmentService = EquipmentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EquipmentService);
//# sourceMappingURL=equipment.service.js.map