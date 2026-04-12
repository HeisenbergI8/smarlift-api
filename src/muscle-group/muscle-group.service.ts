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
import {
  MuscleGroupResponse,
  PaginatedMuscleGroupResponse,
} from './interfaces';

@Injectable()
export class MuscleGroupService {
  private readonly logger = new Logger(MuscleGroupService.name);

  constructor(private readonly prisma: PrismaService) {}

  private mapMuscleGroup(raw: {
    id: bigint;
    name: string;
    bodyRegion: MuscleGroup_bodyRegion;
    createdAt: Date;
  }): MuscleGroupResponse {
    return {
      id: Number(raw.id),
      name: raw.name,
      bodyRegion: raw.bodyRegion,
      createdAt: raw.createdAt,
    };
  }

  async findAll(
    query: FindMuscleGroupsQueryDto,
  ): Promise<PaginatedMuscleGroupResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = query.bodyRegion
      ? { bodyRegion: query.bodyRegion as unknown as MuscleGroup_bodyRegion }
      : {};

    const [raw, total] = await Promise.all([
      this.prisma.muscleGroup.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.muscleGroup.count({ where }),
    ]);

    return { data: raw.map((g) => this.mapMuscleGroup(g)), total, page, limit };
  }

  async create(dto: CreateMuscleGroupDto): Promise<MuscleGroupResponse> {
    try {
      const raw = await this.prisma.muscleGroup.create({
        data: {
          name: dto.name,
          bodyRegion: dto.bodyRegion as unknown as MuscleGroup_bodyRegion,
        },
      });
      return this.mapMuscleGroup(raw);
    } catch (e: unknown) {
      if ((e as { code?: string }).code === 'P2002') {
        throw new ConflictException(
          `Muscle group "${dto.name}" already exists`,
        );
      }
      throw e;
    }
  }

  async update(
    id: number,
    dto: UpdateMuscleGroupDto,
  ): Promise<MuscleGroupResponse> {
    const existing = await this.prisma.muscleGroup.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) {
      throw new NotFoundException('Muscle group not found');
    }

    try {
      const raw = await this.prisma.muscleGroup.update({
        where: { id: BigInt(id) },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.bodyRegion !== undefined && {
            bodyRegion: dto.bodyRegion as unknown as MuscleGroup_bodyRegion,
          }),
        },
      });
      return this.mapMuscleGroup(raw);
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
