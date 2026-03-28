import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { MuscleGroup_bodyRegion } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  FindMuscleGroupsQueryDto,
  CreateMuscleGroupDto,
  UpdateMuscleGroupDto,
} from './dto';

@Injectable()
export class MuscleGroupService {
  private readonly logger = new Logger(MuscleGroupService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: FindMuscleGroupsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = query.bodyRegion
      ? { bodyRegion: query.bodyRegion as unknown as MuscleGroup_bodyRegion }
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

  async create(dto: CreateMuscleGroupDto) {
    try {
      return await this.prisma.muscleGroup.create({
        data: {
          name: dto.name,
          bodyRegion: dto.bodyRegion as unknown as MuscleGroup_bodyRegion,
        },
      });
    } catch (e: unknown) {
      if ((e as { code?: string }).code === 'P2002') {
        throw new ConflictException(
          `Muscle group "${dto.name}" already exists`,
        );
      }
      throw e;
    }
  }

  async update(id: number, dto: UpdateMuscleGroupDto) {
    const existing = await this.prisma.muscleGroup.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) {
      throw new NotFoundException('Muscle group not found');
    }

    try {
      return await this.prisma.muscleGroup.update({
        where: { id: BigInt(id) },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.bodyRegion !== undefined && {
            bodyRegion: dto.bodyRegion as unknown as MuscleGroup_bodyRegion,
          }),
        },
      });
    } catch (e: unknown) {
      if ((e as { code?: string }).code === 'P2002') {
        throw new ConflictException(
          `Muscle group "${dto.name}" already exists`,
        );
      }
      throw e;
    }
  }

  async remove(id: number): Promise<void> {
    const existing = await this.prisma.muscleGroup.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) {
      throw new NotFoundException('Muscle group not found');
    }

    await this.prisma.muscleGroup.delete({ where: { id: BigInt(id) } });
  }
}
