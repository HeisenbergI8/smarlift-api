import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertMusclePriorityDto } from './dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  DeleteMusclePriorityResponse,
  MusclePriorityResponse,
  PaginatedMusclePriorityResponse,
} from './interfaces';

@Injectable()
export class MusclePriorityService {
  private readonly logger = new Logger(MusclePriorityService.name);

  constructor(private readonly prisma: PrismaService) {}

  private mapPriority(raw: {
    id: bigint;
    userId: bigint;
    muscleGroupId: bigint;
    priorityLevel: import('@prisma/client').UserMusclePriority_level;
    hasImbalance: boolean;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    muscleGroup: {
      id: bigint;
      name: string;
      bodyRegion: import('@prisma/client').MuscleGroup_bodyRegion;
      createdAt: Date;
    };
  }): MusclePriorityResponse {
    return {
      id: Number(raw.id),
      userId: Number(raw.userId),
      muscleGroupId: Number(raw.muscleGroupId),
      priorityLevel: raw.priorityLevel,
      hasImbalance: raw.hasImbalance,
      notes: raw.notes,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      muscleGroup: {
        id: Number(raw.muscleGroup.id),
        name: raw.muscleGroup.name,
        bodyRegion: raw.muscleGroup.bodyRegion,
        createdAt: raw.muscleGroup.createdAt,
      },
    };
  }

  async getUserPriorities(
    userId: number,
    query: PaginationQueryDto,
  ): Promise<PaginatedMusclePriorityResponse> {
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

    return { data: data.map((r) => this.mapPriority(r)), total, page, limit };
  }

  async upsertPriority(
    userId: number,
    dto: UpsertMusclePriorityDto,
  ): Promise<MusclePriorityResponse> {
    const muscleGroup = await this.prisma.muscleGroup.findUnique({
      where: { id: BigInt(dto.muscleGroupId) },
    });
    if (!muscleGroup) {
      throw new NotFoundException('Muscle group not found');
    }

    const { muscleGroupId, ...rest } = dto;
    const bigUserId = BigInt(userId);
    const bigMuscleGroupId = BigInt(muscleGroupId);

    const raw = await this.prisma.userMusclePriority.upsert({
      where: {
        userId_muscleGroupId: {
          userId: bigUserId,
          muscleGroupId: bigMuscleGroupId,
        },
      },
      update: rest as unknown as Prisma.UserMusclePriorityUpdateInput,
      create: {
        userId: bigUserId,
        muscleGroupId: bigMuscleGroupId,
        ...rest,
      } as unknown as Prisma.UserMusclePriorityUncheckedCreateInput,
      include: { muscleGroup: true },
    });
    return this.mapPriority(raw);
  }

  async deletePriority(
    userId: number,
    muscleGroupId: number,
  ): Promise<DeleteMusclePriorityResponse> {
    const priority = await this.prisma.userMusclePriority.findUnique({
      where: {
        userId_muscleGroupId: {
          userId: BigInt(userId),
          muscleGroupId: BigInt(muscleGroupId),
        },
      },
    });
    if (!priority) {
      throw new NotFoundException('Muscle priority not found');
    }

    await this.prisma.userMusclePriority.delete({
      where: {
        userId_muscleGroupId: {
          userId: BigInt(userId),
          muscleGroupId: BigInt(muscleGroupId),
        },
      },
    });
    return { message: 'Muscle priority removed' };
  }
}
