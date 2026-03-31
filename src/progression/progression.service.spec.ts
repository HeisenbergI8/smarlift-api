import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProgressionService } from './progression.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

describe('ProgressionService', () => {
  let service: ProgressionService;

  const mockPrisma = {
    progressionSetting: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    progressionHistory: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    workoutSession: {
      findMany: jest.fn(),
    },
    workoutPlan: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn((promises: unknown[]) => Promise.all(promises)),
  };

  const mockNotificationService = {
    createNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressionService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get<ProgressionService>(ProgressionService);
    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    it('should return progression settings', async () => {
      const mockSettings = {
        userId: BigInt(1),
        isEnabled: true,
        progressionFrequency: 'weekly',
        trainingGoal: 'hypertrophy',
        weightIncrementKg: 2.5,
        maxRepsBeforeIncrease: 12,
      };
      mockPrisma.progressionSetting.findUnique.mockResolvedValue(mockSettings);

      const result = await service.getSettings(1);

      expect(result).toEqual(mockSettings);
      expect(mockPrisma.progressionSetting.findUnique).toHaveBeenCalledWith({
        where: { userId: BigInt(1) },
      });
    });

    it('should throw NotFoundException when settings do not exist', async () => {
      mockPrisma.progressionSetting.findUnique.mockResolvedValue(null);

      await expect(service.getSettings(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('upsertSettings', () => {
    it('should upsert and return progression settings', async () => {
      const dto = { isEnabled: true, weightIncrementKg: 2.5 };
      const mockSettings = { userId: BigInt(1), ...dto };
      mockPrisma.progressionSetting.upsert.mockResolvedValue(mockSettings);

      const result = await service.upsertSettings(1, dto);

      expect(result).toEqual(mockSettings);
      expect(mockPrisma.progressionSetting.upsert).toHaveBeenCalledWith({
        where: { userId: BigInt(1) },
        update: expect.objectContaining({
          isEnabled: true,
          weightIncrementKg: 2.5,
        }),
        create: expect.objectContaining({ userId: BigInt(1), isEnabled: true }),
      });
    });

    it('should handle partial update with only one field', async () => {
      const dto = { maxRepsBeforeIncrease: 15 };
      mockPrisma.progressionSetting.upsert.mockResolvedValue({
        userId: BigInt(1),
        maxRepsBeforeIncrease: 15,
      });

      const result = await service.upsertSettings(1, dto);

      expect(result.maxRepsBeforeIncrease).toBe(15);
    });
  });

  describe('getHistory', () => {
    it('should return paginated progression history', async () => {
      const mockHistory = [
        {
          id: BigInt(1),
          userId: BigInt(1),
          exerciseId: BigInt(10),
          adjustmentType: 'weight_increase',
          exercise: { id: BigInt(10), name: 'Bench Press' },
        },
      ];
      mockPrisma.progressionHistory.findMany.mockResolvedValue(mockHistory);
      mockPrisma.progressionHistory.count.mockResolvedValue(1);

      const result = await service.getHistory(1, { page: 1, limit: 20 });

      expect(result).toEqual({
        data: mockHistory,
        total: 1,
        page: 1,
        limit: 20,
      });
      expect(mockPrisma.progressionHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: BigInt(1) },
          orderBy: { createdAt: 'desc' },
          skip: 0,
          take: 20,
        }),
      );
    });

    it('should return empty data when no history exists', async () => {
      mockPrisma.progressionHistory.findMany.mockResolvedValue([]);
      mockPrisma.progressionHistory.count.mockResolvedValue(0);

      const result = await service.getHistory(1, { page: 1, limit: 20 });

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    });
  });

  describe('getHistoryByExercise', () => {
    it('should return paginated history filtered by exercise', async () => {
      const mockHistory = [
        {
          id: BigInt(1),
          userId: BigInt(1),
          exerciseId: BigInt(10),
          adjustmentType: 'deload',
        },
      ];
      mockPrisma.progressionHistory.findMany.mockResolvedValue(mockHistory);
      mockPrisma.progressionHistory.count.mockResolvedValue(1);

      const result = await service.getHistoryByExercise(1, 10, {
        page: 1,
        limit: 20,
      });

      expect(result).toEqual({
        data: mockHistory,
        total: 1,
        page: 1,
        limit: 20,
      });
      expect(mockPrisma.progressionHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: BigInt(1), exerciseId: BigInt(10) },
        }),
      );
    });

    it('should return empty data when no history for exercise', async () => {
      mockPrisma.progressionHistory.findMany.mockResolvedValue([]);
      mockPrisma.progressionHistory.count.mockResolvedValue(0);

      const result = await service.getHistoryByExercise(1, 99, {
        page: 1,
        limit: 20,
      });

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    });
  });

  describe('evaluateProgression', () => {
    const enabledSettings = {
      userId: BigInt(1),
      isEnabled: true,
      progressionFrequency: 'weekly' as const,
      trainingGoal: 'hypertrophy',
      weightIncrementKg: { toNumber: () => 2.5, valueOf: () => 2.5 },
      maxRepsBeforeIncrease: 12,
    };

    it('should return disabled message when progression is disabled', async () => {
      mockPrisma.progressionSetting.findUnique.mockResolvedValue({
        ...enabledSettings,
        isEnabled: false,
      });

      const result = await service.evaluateProgression(1);

      expect(result.message).toBe('Progression tracking is disabled');
      expect(result.adjustments).toEqual([]);
    });

    it('should throw NotFoundException when settings do not exist', async () => {
      mockPrisma.progressionSetting.findUnique.mockResolvedValue(null);

      await expect(service.evaluateProgression(1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return no sessions message when no completed sessions', async () => {
      mockPrisma.progressionSetting.findUnique.mockResolvedValue(
        enabledSettings,
      );
      mockPrisma.workoutSession.findMany.mockResolvedValue([]);

      const result = await service.evaluateProgression(1);

      expect(result.message).toBe('No completed sessions found');
      expect(result.adjustments).toEqual([]);
    });

    it('should return no adjustments when reps are within range', async () => {
      mockPrisma.progressionSetting.findUnique.mockResolvedValue(
        enabledSettings,
      );
      mockPrisma.workoutSession.findMany.mockResolvedValue([
        {
          id: BigInt(1),
          sets: [
            {
              exerciseId: BigInt(10),
              reps: 10,
              weightKg: { valueOf: () => 60 },
            },
            {
              exerciseId: BigInt(10),
              reps: 11,
              weightKg: { valueOf: () => 60 },
            },
          ],
        },
      ]);
      // avg is 10.5, which is <= 12 and >= 6 (12*0.5), so no adjustment
      mockPrisma.workoutPlan.findFirst.mockResolvedValue(null);

      const result = await service.evaluateProgression(1);

      expect(result.message).toBe('No adjustments needed');
      expect(result.adjustments).toEqual([]);
    });

    it('should create weight increase when avg reps exceed threshold', async () => {
      mockPrisma.progressionSetting.findUnique.mockResolvedValue(
        enabledSettings,
      );
      mockPrisma.workoutSession.findMany.mockResolvedValue([
        {
          id: BigInt(1),
          sets: [
            {
              exerciseId: BigInt(10),
              reps: 14,
              weightKg: { valueOf: () => 60 },
            },
            {
              exerciseId: BigInt(10),
              reps: 15,
              weightKg: { valueOf: () => 60 },
            },
          ],
        },
      ]);
      mockPrisma.workoutPlan.findFirst.mockResolvedValue(null);

      const mockCreated = {
        id: BigInt(1),
        exerciseId: BigInt(10),
        adjustmentType: 'weight_increase',
        previousValue: 60,
        newValue: 62.5,
        exercise: { name: 'Bench Press' },
      };
      mockPrisma.$transaction.mockResolvedValue([mockCreated]);
      mockNotificationService.createNotification.mockResolvedValue(undefined);

      const result = await service.evaluateProgression(1);

      expect(result.message).toBe('Evaluation complete');
      expect(result.adjustments).toHaveLength(1);
    });

    it('should create deload when avg reps below deload threshold', async () => {
      mockPrisma.progressionSetting.findUnique.mockResolvedValue(
        enabledSettings,
      );
      mockPrisma.workoutSession.findMany.mockResolvedValue([
        {
          id: BigInt(1),
          sets: [
            {
              exerciseId: BigInt(10),
              reps: 3,
              weightKg: { valueOf: () => 80 },
            },
            {
              exerciseId: BigInt(10),
              reps: 4,
              weightKg: { valueOf: () => 80 },
            },
          ],
        },
      ]);
      // avg=3.5, threshold=12*0.5=6, so deload
      mockPrisma.workoutPlan.findFirst.mockResolvedValue(null);

      const mockCreated = {
        id: BigInt(1),
        exerciseId: BigInt(10),
        adjustmentType: 'deload',
        previousValue: 80,
        newValue: 72,
        exercise: { name: 'Squat' },
      };
      mockPrisma.$transaction.mockResolvedValue([mockCreated]);
      mockNotificationService.createNotification.mockResolvedValue(undefined);

      const result = await service.evaluateProgression(1);

      expect(result.message).toBe('Evaluation complete');
      expect(result.adjustments).toHaveLength(1);
    });

    it('should use plan target weight over set weight when available', async () => {
      mockPrisma.progressionSetting.findUnique.mockResolvedValue(
        enabledSettings,
      );
      mockPrisma.workoutSession.findMany.mockResolvedValue([
        {
          id: BigInt(1),
          sets: [
            {
              exerciseId: BigInt(10),
              reps: 14,
              weightKg: { valueOf: () => 50 },
            },
          ],
        },
      ]);
      mockPrisma.workoutPlan.findFirst.mockResolvedValue({
        days: [
          {
            exercises: [
              { exerciseId: BigInt(10), targetWeightKg: { valueOf: () => 60 } },
            ],
          },
        ],
      });

      const mockCreated = {
        id: BigInt(1),
        exerciseId: BigInt(10),
        adjustmentType: 'weight_increase',
        previousValue: 60,
        newValue: 62.5,
        exercise: { name: 'Bench Press' },
      };
      mockPrisma.$transaction.mockResolvedValue([mockCreated]);
      mockNotificationService.createNotification.mockResolvedValue(undefined);

      const result = await service.evaluateProgression(1);

      expect(result.adjustments).toHaveLength(1);
    });

    it('should skip exercises with no weight data', async () => {
      mockPrisma.progressionSetting.findUnique.mockResolvedValue(
        enabledSettings,
      );
      mockPrisma.workoutSession.findMany.mockResolvedValue([
        {
          id: BigInt(1),
          sets: [{ exerciseId: BigInt(10), reps: 14, weightKg: null }],
        },
      ]);
      mockPrisma.workoutPlan.findFirst.mockResolvedValue(null);

      const result = await service.evaluateProgression(1);

      expect(result.message).toBe('No adjustments needed');
      expect(result.adjustments).toEqual([]);
    });

    it('should handle notification failure gracefully', async () => {
      mockPrisma.progressionSetting.findUnique.mockResolvedValue(
        enabledSettings,
      );
      mockPrisma.workoutSession.findMany.mockResolvedValue([
        {
          id: BigInt(1),
          sets: [
            {
              exerciseId: BigInt(10),
              reps: 14,
              weightKg: { valueOf: () => 60 },
            },
          ],
        },
      ]);
      mockPrisma.workoutPlan.findFirst.mockResolvedValue(null);

      const mockCreated = {
        id: BigInt(1),
        exerciseId: BigInt(10),
        adjustmentType: 'weight_increase',
        previousValue: 60,
        newValue: 62.5,
        exercise: { name: 'Bench Press' },
      };
      mockPrisma.$transaction.mockResolvedValue([mockCreated]);
      mockNotificationService.createNotification.mockRejectedValue(
        new Error('Notification service down'),
      );

      const result = await service.evaluateProgression(1);

      // Should not throw even when notification fails
      expect(result.message).toBe('Evaluation complete');
      expect(result.adjustments).toHaveLength(1);
    });
  });
});
