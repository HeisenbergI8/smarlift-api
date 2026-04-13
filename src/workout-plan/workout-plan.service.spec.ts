import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WorkoutPlanService } from './workout-plan.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WorkoutPlanService', () => {
  let service: WorkoutPlanService;

  const mockTx = {
    workoutPlan: {
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    workoutPlanDay: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    workoutPlanExercise: {
      deleteMany: jest.fn(),
    },
  };

  const mockPrisma = {
    workoutPlan: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn((fn: (tx: typeof mockTx) => unknown) => fn(mockTx)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutPlanService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<WorkoutPlanService>(WorkoutPlanService);
    jest.clearAllMocks();
  });

  // Raw shape returned by Prisma (BigInt IDs, nullable fields)
  const rawMockPlan = {
    id: BigInt(1),
    userId: BigInt(1),
    name: 'Push Pull Legs',
    description: null,
    trainingGoal: 'general' as const,
    daysPerWeek: 3,
    durationWeeks: null,
    isActive: false,
    source: 'user' as const,
    startedAt: null,
    endedAt: null,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    days: [],
  };

  // Mapped shape returned by the service after BigInt→Number conversion
  const expectedPlan = {
    id: 1,
    userId: 1,
    name: 'Push Pull Legs',
    description: null,
    trainingGoal: 'general',
    daysPerWeek: 3,
    durationWeeks: null,
    isActive: false,
    source: 'user',
    startedAt: null,
    endedAt: null,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    days: [],
  };

  describe('create', () => {
    it('should create and return a workout plan', async () => {
      mockPrisma.workoutPlan.create.mockResolvedValue(rawMockPlan);

      const result = await service.create(1, {
        name: 'Push Pull Legs',
        daysPerWeek: 6,
      });

      expect(result).toEqual(expectedPlan);
      expect(mockPrisma.workoutPlan.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: BigInt(1),
          createdBy: BigInt(1),
          name: 'Push Pull Legs',
          source: 'user',
        }),
        include: expect.objectContaining({ days: expect.any(Object) }),
      });
    });

    it('should create plan with nested days and exercises', async () => {
      mockPrisma.workoutPlan.create.mockResolvedValue({
        ...rawMockPlan,
        days: [
          {
            id: BigInt(10),
            workoutPlanId: BigInt(1),
            dayNumber: 1,
            name: 'Push',
            isRestDay: false,
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
            updatedAt: new Date('2024-01-01T00:00:00.000Z'),
            exercises: [
              {
                id: BigInt(100),
                workoutPlanDayId: BigInt(10),
                exerciseId: BigInt(10),
                sortOrder: 1,
                targetSets: 4,
                targetRepsMin: 8,
                targetRepsMax: 12,
                targetWeightKg: null,
                targetRpe: null,
                restSeconds: 90,
                notes: null,
                createdAt: new Date('2024-01-01T00:00:00.000Z'),
                updatedAt: new Date('2024-01-01T00:00:00.000Z'),
                exercise: {
                  id: BigInt(10),
                  name: 'Bench Press',
                  description: null,
                  category: 'compound',
                  difficulty: 'beginner',
                  isBodyweight: false,
                },
              },
            ],
          },
        ],
      });

      await service.create(1, {
        name: 'PPL',
        days: [
          {
            dayNumber: 1,
            name: 'Push',
            exercises: [{ exerciseId: 10, targetSets: 4, targetRepsMin: 8 }],
          },
        ],
      });

      expect(mockPrisma.workoutPlan.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          days: expect.objectContaining({
            create: expect.arrayContaining([
              expect.objectContaining({
                dayNumber: 1,
                name: 'Push',
                exercises: expect.objectContaining({
                  create: expect.arrayContaining([
                    expect.objectContaining({
                      exerciseId: BigInt(10),
                      targetSets: 4,
                    }),
                  ]),
                }),
              }),
            ]),
          }),
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('findAllByUser', () => {
    it('should return all plans for a user', async () => {
      mockPrisma.workoutPlan.findMany.mockResolvedValue([rawMockPlan]);

      const result = await service.findAllByUser(1);

      expect(result).toEqual([expectedPlan]);
      expect(mockPrisma.workoutPlan.findMany).toHaveBeenCalledWith({
        where: { userId: BigInt(1) },
        include: expect.objectContaining({ days: expect.any(Object) }),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when user has no plans', async () => {
      mockPrisma.workoutPlan.findMany.mockResolvedValue([]);

      const result = await service.findAllByUser(1);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a plan by id', async () => {
      mockPrisma.workoutPlan.findUnique.mockResolvedValue(rawMockPlan);

      const result = await service.findOne(1, 1);

      expect(result).toEqual(expectedPlan);
    });

    it('should throw NotFoundException when plan not found', async () => {
      mockPrisma.workoutPlan.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1, 999)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when plan belongs to another user', async () => {
      mockPrisma.workoutPlan.findUnique.mockResolvedValue({
        ...rawMockPlan,
        userId: BigInt(2),
      });

      await expect(service.findOne(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getActivePlan', () => {
    it('should return the active plan', async () => {
      mockPrisma.workoutPlan.findFirst.mockResolvedValue({
        ...rawMockPlan,
        isActive: true,
      });

      const result = await service.getActivePlan(1);

      expect(result).toEqual({ ...expectedPlan, isActive: true });
      expect(mockPrisma.workoutPlan.findFirst).toHaveBeenCalledWith({
        where: { userId: BigInt(1), isActive: true },
        include: expect.objectContaining({ days: expect.any(Object) }),
      });
    });

    it('should throw NotFoundException when no active plan', async () => {
      mockPrisma.workoutPlan.findFirst.mockResolvedValue(null);

      await expect(service.getActivePlan(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update plan metadata without replacing days', async () => {
      mockPrisma.workoutPlan.findUnique.mockResolvedValue(rawMockPlan);
      mockTx.workoutPlan.update.mockResolvedValue({
        ...rawMockPlan,
        name: 'Updated PPL',
      });

      const result = await service.update(1, 1, { name: 'Updated PPL' });

      expect(result).toEqual({ ...expectedPlan, name: 'Updated PPL' });
      // Should not delete existing days when days is undefined
      expect(mockTx.workoutPlanDay.findMany).not.toHaveBeenCalled();
    });

    it('should replace days when days array is provided', async () => {
      mockPrisma.workoutPlan.findUnique.mockResolvedValue(rawMockPlan);
      mockTx.workoutPlanDay.findMany.mockResolvedValue([{ id: BigInt(100) }]);
      mockTx.workoutPlanExercise.deleteMany.mockResolvedValue({ count: 2 });
      mockTx.workoutPlanDay.deleteMany.mockResolvedValue({ count: 1 });
      mockTx.workoutPlan.update.mockResolvedValue({
        ...rawMockPlan,
        days: [
          {
            id: BigInt(10),
            workoutPlanId: BigInt(1),
            dayNumber: 1,
            name: 'New Day',
            isRestDay: false,
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
            updatedAt: new Date('2024-01-01T00:00:00.000Z'),
            exercises: [],
          },
        ],
      });

      const result = await service.update(1, 1, {
        days: [{ dayNumber: 1, name: 'New Day' }],
      });

      expect(mockTx.workoutPlanDay.findMany).toHaveBeenCalled();
      expect(mockTx.workoutPlanExercise.deleteMany).toHaveBeenCalled();
      expect(mockTx.workoutPlanDay.deleteMany).toHaveBeenCalled();
      expect(result.days).toHaveLength(1);
    });

    it('should throw NotFoundException when plan not found', async () => {
      mockPrisma.workoutPlan.findUnique.mockResolvedValue(null);

      await expect(service.update(1, 999, { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a workout plan', async () => {
      mockPrisma.workoutPlan.findUnique.mockResolvedValue(rawMockPlan);
      mockPrisma.workoutPlan.delete.mockResolvedValue(undefined);

      await service.remove(1, 1);

      expect(mockPrisma.workoutPlan.delete).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
      });
    });

    it('should throw NotFoundException when plan not found', async () => {
      mockPrisma.workoutPlan.findUnique.mockResolvedValue(null);

      await expect(service.remove(1, 999)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when plan belongs to another user', async () => {
      mockPrisma.workoutPlan.findUnique.mockResolvedValue({
        ...rawMockPlan,
        userId: BigInt(2),
      });

      await expect(service.remove(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('activate', () => {
    it('should deactivate all plans and activate the specified one', async () => {
      mockPrisma.workoutPlan.findUnique.mockResolvedValue(rawMockPlan);
      mockTx.workoutPlan.updateMany.mockResolvedValue({ count: 1 });
      mockTx.workoutPlan.update.mockResolvedValue({
        ...rawMockPlan,
        isActive: true,
      });

      const result = await service.activate(1, 1);

      expect(result).toEqual({ ...expectedPlan, isActive: true });
      expect(mockTx.workoutPlan.updateMany).toHaveBeenCalledWith({
        where: { userId: BigInt(1), isActive: true },
        data: { isActive: false },
      });
      expect(mockTx.workoutPlan.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: { isActive: true },
        include: expect.objectContaining({ days: expect.any(Object) }),
      });
    });

    it('should throw NotFoundException when plan not found', async () => {
      mockPrisma.workoutPlan.findUnique.mockResolvedValue(null);

      await expect(service.activate(1, 999)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when plan belongs to another user', async () => {
      mockPrisma.workoutPlan.findUnique.mockResolvedValue({
        ...rawMockPlan,
        userId: BigInt(2),
      });

      await expect(service.activate(1, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
