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
import { ExerciseResponse, PaginatedExerciseResponse } from './interfaces';

@Injectable()
export class ExerciseService {
  private readonly logger = new Logger(ExerciseService.name);

  constructor(private readonly prisma: PrismaService) {}

  private mapExercise(raw: {
    id: bigint;
    name: string;
    description: string | null;
    category: Exercise_category;
    difficulty: Exercise_difficulty;
    isBodyweight: boolean;
    createdAt: Date;
    updatedAt: Date;
    exerciseMuscles: {
      id: bigint;
      exerciseId: bigint;
      muscleGroupId: bigint;
      role: import('@prisma/client').ExerciseMuscle_role;
      muscleGroup: {
        id: bigint;
        name: string;
        bodyRegion: import('@prisma/client').MuscleGroup_bodyRegion;
        createdAt: Date;
      };
    }[];
    exerciseEquipment: {
      id: bigint;
      exerciseId: bigint;
      equipmentId: bigint;
      equipment: {
        id: bigint;
        name: string;
        description: string | null;
        createdAt: Date;
      };
    }[];
  }): ExerciseResponse {
    return {
      id: Number(raw.id),
      name: raw.name,
      description: raw.description,
      category: raw.category,
      difficulty: raw.difficulty,
      isBodyweight: raw.isBodyweight,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      exerciseMuscles: raw.exerciseMuscles.map((m) => ({
        id: Number(m.id),
        exerciseId: Number(m.exerciseId),
        muscleGroupId: Number(m.muscleGroupId),
        role: m.role,
        muscleGroup: {
          id: Number(m.muscleGroup.id),
          name: m.muscleGroup.name,
          bodyRegion: m.muscleGroup.bodyRegion,
          createdAt: m.muscleGroup.createdAt,
        },
      })),
      exerciseEquipment: raw.exerciseEquipment.map((e) => ({
        id: Number(e.id),
        exerciseId: Number(e.exerciseId),
        equipmentId: Number(e.equipmentId),
        equipment: {
          id: Number(e.equipment.id),
          name: e.equipment.name,
          description: e.equipment.description,
          createdAt: e.equipment.createdAt,
        },
      })),
    };
  }

  async findAll(
    query: FindExercisesQueryDto,
  ): Promise<PaginatedExerciseResponse> {
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

    const [raw, total] = await Promise.all([
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

    return { data: raw.map((e) => this.mapExercise(e)), total, page, limit };
  }

  async findOne(id: number): Promise<ExerciseResponse> {
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
    return this.mapExercise(exercise);
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
