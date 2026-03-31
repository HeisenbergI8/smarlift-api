import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  ExerciseCategory,
  ExerciseDifficulty,
} from './dto/find-exercises-query.dto';

describe('ExerciseService', () => {
  let service: ExerciseService;

  const mockTx = {
    exerciseMuscle: { deleteMany: jest.fn() },
    exerciseEquipment: { deleteMany: jest.fn() },
    exercise: { update: jest.fn() },
  };

  const mockPrisma = {
    exercise: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((fn: (tx: typeof mockTx) => unknown) => fn(mockTx)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExerciseService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ExerciseService>(ExerciseService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated exercises', async () => {
      const mockExercises = [
        {
          id: BigInt(1),
          name: 'Bench Press',
          exerciseMuscles: [],
          exerciseEquipment: [],
        },
      ];
      mockPrisma.exercise.findMany.mockResolvedValue(mockExercises);
      mockPrisma.exercise.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result).toEqual({
        data: mockExercises,
        total: 1,
        page: 1,
        limit: 20,
      });
      expect(mockPrisma.exercise.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: 'asc' },
          skip: 0,
          take: 20,
        }),
      );
    });

    it('should apply search filter', async () => {
      mockPrisma.exercise.findMany.mockResolvedValue([]);
      mockPrisma.exercise.count.mockResolvedValue(0);

      await service.findAll({ search: 'bench', page: 1, limit: 20 });

      expect(mockPrisma.exercise.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: { contains: 'bench' },
          }),
        }),
      );
    });

    it('should apply category filter', async () => {
      mockPrisma.exercise.findMany.mockResolvedValue([]);
      mockPrisma.exercise.count.mockResolvedValue(0);

      await service.findAll({ category: ExerciseCategory.COMPOUND, page: 1, limit: 20 });

      expect(mockPrisma.exercise.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'compound' }),
        }),
      );
    });

    it('should apply difficulty filter', async () => {
      mockPrisma.exercise.findMany.mockResolvedValue([]);
      mockPrisma.exercise.count.mockResolvedValue(0);

      await service.findAll({
        difficulty: ExerciseDifficulty.INTERMEDIATE,
        page: 1,
        limit: 20,
      });

      expect(mockPrisma.exercise.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ difficulty: 'intermediate' }),
        }),
      );
    });

    it('should apply muscleGroupId filter', async () => {
      mockPrisma.exercise.findMany.mockResolvedValue([]);
      mockPrisma.exercise.count.mockResolvedValue(0);

      await service.findAll({ muscleGroupId: 1, page: 1, limit: 20 });

      expect(mockPrisma.exercise.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            exerciseMuscles: { some: { muscleGroupId: BigInt(1) } },
          }),
        }),
      );
    });

    it('should apply equipmentId filter', async () => {
      mockPrisma.exercise.findMany.mockResolvedValue([]);
      mockPrisma.exercise.count.mockResolvedValue(0);

      await service.findAll({ equipmentId: 3, page: 1, limit: 20 });

      expect(mockPrisma.exercise.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            exerciseEquipment: { some: { equipmentId: BigInt(3) } },
          }),
        }),
      );
    });

    it('should return empty data when no exercises match', async () => {
      mockPrisma.exercise.findMany.mockResolvedValue([]);
      mockPrisma.exercise.count.mockResolvedValue(0);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    });

    it('should use default page and limit when not provided', async () => {
      mockPrisma.exercise.findMany.mockResolvedValue([]);
      mockPrisma.exercise.count.mockResolvedValue(0);

      const result = await service.findAll({});

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    });
  });

  describe('findOne', () => {
    it('should return exercise with relations when found', async () => {
      const mockExercise = {
        id: BigInt(1),
        name: 'Bench Press',
        exerciseMuscles: [{ muscleGroup: { id: BigInt(1), name: 'Chest' } }],
        exerciseEquipment: [{ equipment: { id: BigInt(1), name: 'Barbell' } }],
      };
      mockPrisma.exercise.findUnique.mockResolvedValue(mockExercise);

      const result = await service.findOne(1);

      expect(result).toEqual(mockExercise);
      expect(mockPrisma.exercise.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        include: {
          exerciseMuscles: { include: { muscleGroup: true } },
          exerciseEquipment: { include: { equipment: true } },
        },
      });
    });

    it('should throw NotFoundException when exercise not found', async () => {
      mockPrisma.exercise.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create exercise with muscle groups and equipment', async () => {
      const mockCreated = {
        id: BigInt(1),
        name: 'Bench Press',
        category: 'compound',
        difficulty: ExerciseDifficulty.INTERMEDIATE,
        isBodyweight: false,
        exerciseMuscles: [{ muscleGroup: { id: BigInt(1), name: 'Chest' } }],
        exerciseEquipment: [{ equipment: { id: BigInt(1), name: 'Barbell' } }],
      };
      mockPrisma.exercise.create.mockResolvedValue(mockCreated);

      const result = await service.create({
        name: 'Bench Press',
        category: 'compound' as never,
        difficulty: 'intermediate' as never,
        muscleGroupIds: [1],
        equipmentIds: [1],
      });

      expect(result).toEqual(mockCreated);
      expect(mockPrisma.exercise.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Bench Press',
          isBodyweight: false,
          exerciseMuscles: {
            create: [{ muscleGroupId: BigInt(1) }],
          },
          exerciseEquipment: {
            create: [{ equipmentId: BigInt(1) }],
          },
        }),
        include: {
          exerciseMuscles: { include: { muscleGroup: true } },
          exerciseEquipment: { include: { equipment: true } },
        },
      });
    });

    it('should create exercise without muscle groups or equipment', async () => {
      const mockCreated = {
        id: BigInt(2),
        name: 'Plank',
        isBodyweight: true,
        exerciseMuscles: [],
        exerciseEquipment: [],
      };
      mockPrisma.exercise.create.mockResolvedValue(mockCreated);

      const result = await service.create({
        name: 'Plank',
        isBodyweight: true,
      });

      expect(result).toEqual(mockCreated);
    });

    it('should throw ConflictException on duplicate name', async () => {
      mockPrisma.exercise.create.mockRejectedValue({ code: 'P2002' });

      await expect(service.create({ name: 'Bench Press' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('should rethrow non-P2002 errors', async () => {
      mockPrisma.exercise.create.mockRejectedValue(
        new Error('Connection lost'),
      );

      await expect(service.create({ name: 'Bench Press' })).rejects.toThrow(
        'Connection lost',
      );
    });
  });

  describe('update', () => {
    it('should update exercise with new muscle groups in transaction', async () => {
      mockPrisma.exercise.findUnique.mockResolvedValue({
        id: BigInt(1),
        name: 'Bench Press',
      });
      const mockUpdated = {
        id: BigInt(1),
        name: 'Incline Bench Press',
        exerciseMuscles: [
          { muscleGroup: { id: BigInt(2), name: 'Upper Chest' } },
        ],
        exerciseEquipment: [],
      };
      mockTx.exerciseMuscle.deleteMany.mockResolvedValue({ count: 1 });
      mockTx.exercise.update.mockResolvedValue(mockUpdated);

      const result = await service.update(1, {
        name: 'Incline Bench Press',
        muscleGroupIds: [2],
      });

      expect(result).toEqual(mockUpdated);
      expect(mockTx.exerciseMuscle.deleteMany).toHaveBeenCalledWith({
        where: { exerciseId: BigInt(1) },
      });
    });

    it('should update exercise with new equipment in transaction', async () => {
      mockPrisma.exercise.findUnique.mockResolvedValue({
        id: BigInt(1),
        name: 'Bench Press',
      });
      mockTx.exerciseEquipment.deleteMany.mockResolvedValue({ count: 1 });
      mockTx.exercise.update.mockResolvedValue({
        id: BigInt(1),
        exerciseEquipment: [{ equipment: { id: BigInt(3), name: 'Cable' } }],
      });

      await service.update(1, { equipmentIds: [3] });

      expect(mockTx.exerciseEquipment.deleteMany).toHaveBeenCalledWith({
        where: { exerciseId: BigInt(1) },
      });
    });

    it('should throw NotFoundException when exercise not found', async () => {
      mockPrisma.exercise.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { name: 'New Name' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException on duplicate name during update', async () => {
      mockPrisma.exercise.findUnique.mockResolvedValue({
        id: BigInt(1),
        name: 'Bench Press',
      });
      mockTx.exercise.update.mockRejectedValue({ code: 'P2002' });

      await expect(service.update(1, { name: 'Squat' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should delete exercise when found', async () => {
      mockPrisma.exercise.findUnique.mockResolvedValue({
        id: BigInt(1),
        name: 'Bench Press',
      });
      mockPrisma.exercise.delete.mockResolvedValue({});

      await service.remove(1);

      expect(mockPrisma.exercise.delete).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
      });
    });

    it('should throw NotFoundException when exercise not found', async () => {
      mockPrisma.exercise.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
