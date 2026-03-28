import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  SyncEquipmentDto,
  FindEquipmentQueryDto,
  CreateEquipmentDto,
  UpdateEquipmentDto,
} from './dto';

@Injectable()
export class EquipmentService {
  private readonly logger = new Logger(EquipmentService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: FindEquipmentQueryDto) {
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

  async getUserEquipment(userId: number, query: FindEquipmentQueryDto) {
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

  async syncUserEquipment(userId: number, dto: SyncEquipmentDto) {
    const found = await this.prisma.equipment.findMany({
      where: { id: { in: dto.equipmentIds.map((id) => BigInt(id)) } },
      select: { id: true },
    });

    if (found.length !== dto.equipmentIds.length) {
      const foundIds = new Set(found.map((e) => Number(e.id)));
      const invalidIds = dto.equipmentIds.filter((id) => !foundIds.has(id));
      throw new BadRequestException(
        `Invalid equipment IDs: ${invalidIds.join(', ')}`,
      );
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

  async create(dto: CreateEquipmentDto) {
    try {
      return await this.prisma.equipment.create({ data: dto });
    } catch (e: unknown) {
      if ((e as { code?: string }).code === 'P2002') {
        throw new ConflictException(`Equipment "${dto.name}" already exists`);
      }
      throw e;
    }
  }

  async update(id: number, dto: UpdateEquipmentDto) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: BigInt(id) },
    });
    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }

    try {
      return await this.prisma.equipment.update({
        where: { id: BigInt(id) },
        data: dto,
      });
    } catch (e: unknown) {
      if ((e as { code?: string }).code === 'P2002') {
        throw new ConflictException(`Equipment "${dto.name}" already exists`);
      }
      throw e;
    }
  }

  async remove(id: number) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: BigInt(id) },
    });
    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }

    await this.prisma.equipment.delete({ where: { id: BigInt(id) } });
  }
}
