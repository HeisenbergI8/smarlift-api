import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Prisma, Exercise_category, Exercise_difficulty } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  FindExercisesQueryDto,
  CreateExerciseDto,
  UpdateExerciseDto,
} from './dto';

@Injectable()
export class ExerciseService {
  private readonly logger = new Logger(ExerciseService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: FindExercisesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ExerciseWhereInput = {};

    if (query.search) {
      where.name = { contains: query.search };
    }
    if (query.category) {
      where.category = query.category as unknown as Exercise_category;
    }
    if (query.difficulty) {
      where.difficulty = query.difficulty as unknown as Exercise_difficulty;
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

  async findOne(id: number) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id: BigInt(id) },
      include: {
        exerciseMuscles: { include: { muscleGroup: true } },
        exerciseEquipment: { include: { equipment: true } },
      },
    });
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }
    return exercise;
  }

  async create(dto: CreateExerciseDto) {
    try {
      return await this.prisma.exercise.create({
        data: {
          name: dto.name,
          description: dto.description,
          category: dto.category as unknown as Exercise_category,
          difficulty: dto.difficulty as unknown as Exercise_difficulty,
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
    } catch (e: unknown) {
      if ((e as { code?: string }).code === 'P2002') {
        throw new ConflictException(`Exercise "${dto.name}" already exists`);
      }
      throw e;
    }
  }

  async update(id: number, dto: UpdateExerciseDto) {
    const existing = await this.prisma.exercise.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) {
      throw new NotFoundException('Exercise not found');
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
              category: dto.category as unknown as Exercise_category,
            }),
            ...(dto.difficulty !== undefined && {
              difficulty: dto.difficulty as unknown as Exercise_difficulty,
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
    } catch (e: unknown) {
      if ((e as { code?: string }).code === 'P2002') {
        throw new ConflictException(`Exercise "${dto.name}" already exists`);
      }
      throw e;
    }
  }

  async remove(id: number): Promise<void> {
    const existing = await this.prisma.exercise.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) {
      throw new NotFoundException('Exercise not found');
    }
    await this.prisma.exercise.delete({ where: { id: BigInt(id) } });
  }
}
