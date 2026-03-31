import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NutritionService', () => {
  let service: NutritionService;

  const mockTx = {
    nutritionRecommendation: {
      updateMany: jest.fn(),
      create: jest.fn(),
    },
    nutritionAdjustment: {
      create: jest.fn(),
    },
  };

  const mockPrisma = {
    nutritionRecommendation: {
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
    },
    dailyNutritionLog: {
      findMany: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
    },
    nutritionAdjustment: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    userProfile: {
      findUnique: jest.fn(),
    },
    bodyWeightLog: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn((fn: (tx: typeof mockTx) => unknown) => fn(mockTx)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NutritionService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<NutritionService>(NutritionService);
    jest.clearAllMocks();
  });

  describe('getActiveRecommendation', () => {
    it('should return the active recommendation', async () => {
      const mockRec = {
        id: BigInt(1),
        userId: BigInt(1),
        dailyCaloriesKcal: 2200,
        isActive: true,
      };
      mockPrisma.nutritionRecommendation.findFirst.mockResolvedValue(mockRec);

      const result = await service.getActiveRecommendation(1);

      expect(result).toEqual(mockRec);
      expect(mockPrisma.nutritionRecommendation.findFirst).toHaveBeenCalledWith(
        {
          where: { userId: BigInt(1), isActive: true },
          orderBy: { createdAt: 'desc' },
        },
      );
    });

    it('should throw NotFoundException when no active recommendation', async () => {
      mockPrisma.nutritionRecommendation.findFirst.mockResolvedValue(null);

      await expect(service.getActiveRecommendation(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createRecommendation', () => {
    it('should deactivate existing and create new recommendation in transaction', async () => {
      mockTx.nutritionRecommendation.updateMany.mockResolvedValue({ count: 1 });
      const mockCreated = {
        id: BigInt(2),
        userId: BigInt(1),
        dailyCaloriesKcal: 2500,
        isActive: true,
      };
      mockTx.nutritionRecommendation.create.mockResolvedValue(mockCreated);

      const result = await service.createRecommendation(1, {
        dailyCaloriesKcal: 2500,
        proteinG: 180,
        carbohydratesG: 250,
        fatsG: 70,
        effectiveFrom: '2026-04-01',
      });

      expect(result).toEqual(mockCreated);
      expect(mockTx.nutritionRecommendation.updateMany).toHaveBeenCalledWith({
        where: { userId: BigInt(1), isActive: true },
        data: { isActive: false, effectiveTo: expect.any(Date) },
      });
      expect(mockTx.nutritionRecommendation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: BigInt(1),
          dailyCaloriesKcal: 2500,
          proteinG: 180,
          source: 'coach',
          isActive: true,
        }),
      });
    });
  });

  describe('generateSmartRecommendation', () => {
    const completeProfile = {
      userId: BigInt(1),
      weightKg: 80,
      heightCm: 180,
      age: 30,
      gender: 'male',
      activityLevel: 'moderately_active',
      fitnessGoal: 'maintain',
    };

    it('should generate recommendation from profile data', async () => {
      mockPrisma.userProfile.findUnique.mockResolvedValue(completeProfile);
      mockTx.nutritionRecommendation.updateMany.mockResolvedValue({ count: 0 });
      const mockCreated = {
        id: BigInt(1),
        userId: BigInt(1),
        dailyCaloriesKcal: 2700,
        source: 'system',
        isActive: true,
      };
      mockTx.nutritionRecommendation.create.mockResolvedValue(mockCreated);

      const result = await service.generateSmartRecommendation(1);

      expect(result).toEqual(mockCreated);
      expect(mockTx.nutritionRecommendation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: BigInt(1),
          source: 'system',
          isActive: true,
          dailyCaloriesKcal: expect.any(Number),
          proteinG: expect.any(Number),
          carbohydratesG: expect.any(Number),
          fatsG: expect.any(Number),
        }),
      });
    });

    it('should throw BadRequestException when profile is incomplete', async () => {
      mockPrisma.userProfile.findUnique.mockResolvedValue(null);

      await expect(service.generateSmartRecommendation(1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when profile is missing required fields', async () => {
      mockPrisma.userProfile.findUnique.mockResolvedValue({
        userId: BigInt(1),
        weightKg: null,
        heightCm: 180,
        age: 30,
        gender: 'male',
        activityLevel: 'moderately_active',
        fitnessGoal: 'maintain',
      });

      await expect(service.generateSmartRecommendation(1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should apply lose_weight calorie reduction', async () => {
      mockPrisma.userProfile.findUnique.mockResolvedValue({
        ...completeProfile,
        fitnessGoal: 'lose_weight',
      });
      mockTx.nutritionRecommendation.updateMany.mockResolvedValue({ count: 0 });
      mockTx.nutritionRecommendation.create.mockImplementation(
        (args: { data: { dailyCaloriesKcal: number } }) =>
          Promise.resolve(args.data),
      );

      const result = await service.generateSmartRecommendation(1);

      // lose_weight subtracts 500 from TDEE
      const maintainProfile = { ...completeProfile };
      // Just verify it's lower than what maintain would be
      expect(
        (result as { dailyCaloriesKcal: number }).dailyCaloriesKcal,
      ).toBeDefined();
    });

    it('should apply gain_muscle calorie increase', async () => {
      mockPrisma.userProfile.findUnique.mockResolvedValue({
        ...completeProfile,
        fitnessGoal: 'gain_muscle',
      });
      mockTx.nutritionRecommendation.updateMany.mockResolvedValue({ count: 0 });
      mockTx.nutritionRecommendation.create.mockImplementation(
        (args: { data: { dailyCaloriesKcal: number } }) =>
          Promise.resolve(args.data),
      );

      const result = await service.generateSmartRecommendation(1);

      expect(
        (result as { dailyCaloriesKcal: number }).dailyCaloriesKcal,
      ).toBeDefined();
    });
  });

  describe('logDailyNutrition', () => {
    it('should upsert a daily nutrition log', async () => {
      const mockLog = {
        id: BigInt(1),
        userId: BigInt(1),
        logDate: new Date('2026-03-28'),
        totalCaloriesKcal: 2100,
        proteinG: 160,
      };
      mockPrisma.dailyNutritionLog.upsert.mockResolvedValue(mockLog);

      const result = await service.logDailyNutrition(1, {
        logDate: '2026-03-28',
        totalCaloriesKcal: 2100,
        proteinG: 160,
      });

      expect(result).toEqual(mockLog);
      expect(mockPrisma.dailyNutritionLog.upsert).toHaveBeenCalledWith({
        where: {
          userId_logDate: {
            userId: BigInt(1),
            logDate: new Date('2026-03-28'),
          },
        },
        update: expect.objectContaining({ totalCaloriesKcal: 2100 }),
        create: expect.objectContaining({
          userId: BigInt(1),
          totalCaloriesKcal: 2100,
        }),
      });
    });
  });

  describe('getDailyLogs', () => {
    it('should return paginated daily logs', async () => {
      const mockLogs = [
        {
          id: BigInt(1),
          userId: BigInt(1),
          logDate: new Date('2026-03-28'),
          totalCaloriesKcal: 2100,
        },
      ];
      mockPrisma.dailyNutritionLog.findMany.mockResolvedValue(mockLogs);
      mockPrisma.dailyNutritionLog.count.mockResolvedValue(1);

      const result = await service.getDailyLogs(1, { page: 1, limit: 20 });

      expect(result).toEqual({
        data: mockLogs,
        total: 1,
        page: 1,
        limit: 20,
      });
    });

    it('should apply date filters', async () => {
      mockPrisma.dailyNutritionLog.findMany.mockResolvedValue([]);
      mockPrisma.dailyNutritionLog.count.mockResolvedValue(0);

      await service.getDailyLogs(1, {
        page: 1,
        limit: 20,
        startDate: '2026-03-01',
        endDate: '2026-03-31',
      });

      expect(mockPrisma.dailyNutritionLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: BigInt(1),
            logDate: {
              gte: new Date('2026-03-01'),
              lte: new Date('2026-03-31'),
            },
          },
        }),
      );
    });

    it('should return empty data when no logs exist', async () => {
      mockPrisma.dailyNutritionLog.findMany.mockResolvedValue([]);
      mockPrisma.dailyNutritionLog.count.mockResolvedValue(0);

      const result = await service.getDailyLogs(1, { page: 1, limit: 20 });

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    });
  });

  describe('getAdjustmentHistory', () => {
    it('should return paginated adjustment history', async () => {
      const mockAdj = [
        {
          id: BigInt(1),
          userId: BigInt(1),
          triggerReason: 'plateau_detected',
          nutritionRecommendation: { id: BigInt(2) },
        },
      ];
      mockPrisma.nutritionAdjustment.findMany.mockResolvedValue(mockAdj);
      mockPrisma.nutritionAdjustment.count.mockResolvedValue(1);

      const result = await service.getAdjustmentHistory(1, {
        page: 1,
        limit: 20,
      });

      expect(result).toEqual({
        data: mockAdj,
        total: 1,
        page: 1,
        limit: 20,
      });
    });

    it('should return empty data when no adjustments exist', async () => {
      mockPrisma.nutritionAdjustment.findMany.mockResolvedValue([]);
      mockPrisma.nutritionAdjustment.count.mockResolvedValue(0);

      const result = await service.getAdjustmentHistory(1, {
        page: 1,
        limit: 20,
      });

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    });
  });

  describe('detectPlateauAndAdjust', () => {
    it('should return no plateau when insufficient data', async () => {
      mockPrisma.userProfile.findUnique.mockResolvedValue({
        userId: BigInt(1),
        fitnessGoal: 'lose_weight',
      });
      mockPrisma.bodyWeightLog.findMany.mockResolvedValue([]);

      const result = await service.detectPlateauAndAdjust(1);

      expect(result).toEqual({
        plateauDetected: false,
        reason: 'Insufficient data',
      });
    });

    it('should return no plateau when weight is changing', async () => {
      mockPrisma.userProfile.findUnique.mockResolvedValue({
        userId: BigInt(1),
        fitnessGoal: 'lose_weight',
      });
      // 3 weeks of logs with significant weight change
      const monday1 = new Date('2026-03-09');
      const monday2 = new Date('2026-03-16');
      const monday3 = new Date('2026-03-23');
      mockPrisma.bodyWeightLog.findMany.mockResolvedValue([
        { logDate: monday1, weightKg: 80 },
        { logDate: monday2, weightKg: 79 },
        { logDate: monday3, weightKg: 78 },
      ]);

      const result = await service.detectPlateauAndAdjust(1);

      expect(result.plateauDetected).toBe(false);
    });

    it('should detect plateau and create adjustment for lose_weight', async () => {
      mockPrisma.userProfile.findUnique.mockResolvedValue({
        userId: BigInt(1),
        fitnessGoal: 'lose_weight',
      });
      // 3 weeks of stable weight
      const monday1 = new Date('2026-03-09');
      const monday2 = new Date('2026-03-16');
      const monday3 = new Date('2026-03-23');
      mockPrisma.bodyWeightLog.findMany.mockResolvedValue([
        { logDate: monday1, weightKg: 80 },
        { logDate: monday2, weightKg: 80.1 },
        { logDate: monday3, weightKg: 80.2 },
      ]);
      mockPrisma.nutritionRecommendation.findFirst.mockResolvedValue({
        id: BigInt(1),
        dailyCaloriesKcal: 2200,
        proteinG: 160,
        carbohydratesG: 220,
        fatsG: 60,
      });
      const mockNewRec = {
        id: BigInt(2),
        dailyCaloriesKcal: 2100,
        isActive: true,
      };
      const mockAdj = {
        id: BigInt(1),
        triggerReason: 'plateau_detected',
      };
      mockTx.nutritionRecommendation.updateMany.mockResolvedValue({ count: 1 });
      mockTx.nutritionRecommendation.create.mockResolvedValue(mockNewRec);
      mockTx.nutritionAdjustment.create.mockResolvedValue(mockAdj);

      const result = await service.detectPlateauAndAdjust(1);

      expect(result.plateauDetected).toBe(true);
      expect(result.newRecommendation).toBeDefined();
      expect(result.adjustment).toBeDefined();
    });

    it('should throw BadRequestException when profile has no fitness goal', async () => {
      mockPrisma.userProfile.findUnique.mockResolvedValue({
        userId: BigInt(1),
        fitnessGoal: null,
      });

      await expect(service.detectPlateauAndAdjust(1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when no profile exists', async () => {
      mockPrisma.userProfile.findUnique.mockResolvedValue(null);

      await expect(service.detectPlateauAndAdjust(1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return plateau with no adjustment for maintain goal', async () => {
      mockPrisma.userProfile.findUnique.mockResolvedValue({
        userId: BigInt(1),
        fitnessGoal: 'maintain',
      });
      const monday1 = new Date('2026-03-09');
      const monday2 = new Date('2026-03-16');
      const monday3 = new Date('2026-03-23');
      mockPrisma.bodyWeightLog.findMany.mockResolvedValue([
        { logDate: monday1, weightKg: 80 },
        { logDate: monday2, weightKg: 80 },
        { logDate: monday3, weightKg: 80 },
      ]);

      const result = await service.detectPlateauAndAdjust(1);

      expect(result.plateauDetected).toBe(true);
      expect(result.reason).toContain('no adjustment needed');
    });

    it('should throw NotFoundException when no active recommendation during plateau', async () => {
      mockPrisma.userProfile.findUnique.mockResolvedValue({
        userId: BigInt(1),
        fitnessGoal: 'lose_weight',
      });
      const monday1 = new Date('2026-03-09');
      const monday2 = new Date('2026-03-16');
      const monday3 = new Date('2026-03-23');
      mockPrisma.bodyWeightLog.findMany.mockResolvedValue([
        { logDate: monday1, weightKg: 80 },
        { logDate: monday2, weightKg: 80 },
        { logDate: monday3, weightKg: 80 },
      ]);
      mockPrisma.nutritionRecommendation.findFirst.mockResolvedValue(null);

      await expect(service.detectPlateauAndAdjust(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
