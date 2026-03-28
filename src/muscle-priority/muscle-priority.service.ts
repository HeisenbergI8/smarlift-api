import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertMusclePriorityDto } from './dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class MusclePriorityService {
  private readonly logger = new Logger(MusclePriorityService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getUserPriorities(userId: number, query: PaginationQueryDto) {
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

  async upsertPriority(userId: number, dto: UpsertMusclePriorityDto) {
    const muscleGroup = await this.prisma.muscleGroup.findUnique({
      where: { id: BigInt(dto.muscleGroupId) },
    });
    if (!muscleGroup) {
      throw new NotFoundException('Muscle group not found');
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
      update: rest as unknown as Prisma.UserMusclePriorityUpdateInput,
      create: {
        userId: bigUserId,
        muscleGroupId: bigMuscleGroupId,
        ...rest,
      } as unknown as Prisma.UserMusclePriorityUncheckedCreateInput,
      include: { muscleGroup: true },
    });
  }

  async deletePriority(userId: number, muscleGroupId: number) {
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
  }
}
