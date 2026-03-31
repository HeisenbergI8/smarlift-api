import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockPrisma = {
    bodyWeightLog: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    kpiSnapshot: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn(),
    },
    nutritionRecommendation: {
      findFirst: jest.fn(),
    },
    workoutPlan: {
      findFirst: jest.fn(),
    },
    notification: {
      count: jest.fn(),
    },
    egoLiftAlert: {
      count: jest.fn(),
    },
    personalRecord: {
      findMany: jest.fn(),
    },
    workoutSession: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    dailyNutritionLog: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  describe('getOverview', () => {
    it('should return full overview when all data exists', async () => {
      mockPrisma.bodyWeightLog.findFirst.mockResolvedValue({
        weightKg: 75.5,
        logDate: new Date('2026-03-28'),
      });
      mockPrisma.kpiSnapshot.findFirst.mockResolvedValue({
        id: BigInt(1),
        snapshotDate: new Date('2026-03-28'),
      });
      mockPrisma.nutritionRecommendation.findFirst.mockResolvedValue({
        id: BigInt(1),
        dailyCaloriesKcal: 2200,
      });
      mockPrisma.workoutPlan.findFirst.mockResolvedValue({
        id: BigInt(5),
        name: 'Push Pull Legs',
        daysPerWeek: 6,
      });
      mockPrisma.notification.count.mockResolvedValue(3);
      mockPrisma.egoLiftAlert.count.mockResolvedValue(1);

      const result = await service.getOverview(1);

      expect(result.latestWeight).toEqual({
        weightKg: 75.5,
        logDate: new Date('2026-03-28'),
      });
      expect(result.activePlan).toEqual({
        id: 5,
        name: 'Push Pull Legs',
        daysPerWeek: 6,
      });
      expect(result.unreadNotifications).toBe(3);
      expect(result.activeEgoAlerts).toBe(1);
      expect(result.latestSnapshot).toBeDefined();
      expect(result.activeRecommendation).toBeDefined();
    });

    it('should return null for latestWeight and activePlan when no data exists', async () => {
      mockPrisma.bodyWeightLog.findFirst.mockResolvedValue(null);
      mockPrisma.kpiSnapshot.findFirst.mockResolvedValue(null);
      mockPrisma.nutritionRecommendation.findFirst.mockResolvedValue(null);
      mockPrisma.workoutPlan.findFirst.mockResolvedValue(null);
      mockPrisma.notification.count.mockResolvedValue(0);
      mockPrisma.egoLiftAlert.count.mockResolvedValue(0);

      const result = await service.getOverview(1);

      expect(result.latestWeight).toBeNull();
      expect(result.activePlan).toBeNull();
      expect(result.unreadNotifications).toBe(0);
      expect(result.activeEgoAlerts).toBe(0);
    });
  });

  describe('getStrengthProgress', () => {
    it('should return mapped personal records', async () => {
      mockPrisma.personalRecord.findMany.mockResolvedValue([
        {
          id: BigInt(1),
          userId: BigInt(1),
          exerciseId: BigInt(10),
          value: 100,
          achievedAt: new Date('2026-03-20'),
          exercise: { name: 'Bench Press' },
        },
        {
          id: BigInt(2),
          userId: BigInt(1),
          exerciseId: BigInt(20),
          value: 140,
          achievedAt: new Date('2026-03-21'),
          exercise: { name: 'Squat' },
        },
      ]);

      const result = await service.getStrengthProgress(1);

      expect(result.records).toEqual([
        {
          exerciseId: 10,
          exerciseName: 'Bench Press',
          currentMaxWeightKg: 100,
          achievedAt: new Date('2026-03-20'),
        },
        {
          exerciseId: 20,
          exerciseName: 'Squat',
          currentMaxWeightKg: 140,
          achievedAt: new Date('2026-03-21'),
        },
      ]);
    });

    it('should return empty records when no personal records exist', async () => {
      mockPrisma.personalRecord.findMany.mockResolvedValue([]);

      const result = await service.getStrengthProgress(1);

      expect(result.records).toEqual([]);
    });
  });

  describe('getWeightTrend', () => {
    it('should return weight trend with change calculations', async () => {
      mockPrisma.bodyWeightLog.findMany.mockResolvedValue([
        {
          id: BigInt(1),
          logDate: new Date('2026-03-01'),
          weightKg: 80,
        },
        {
          id: BigInt(2),
          logDate: new Date('2026-03-15'),
          weightKg: 78,
        },
        {
          id: BigInt(3),
          logDate: new Date('2026-03-28'),
          weightKg: 76,
        },
      ]);

      const result = await service.getWeightTrend(1, 'month');

      expect(result.entries).toHaveLength(3);
      expect(result.startWeight).toBe(80);
      expect(result.endWeight).toBe(76);
      expect(result.changeKg).toBe(-4);
      expect(result.changePct).toBe(-5);
    });

    it('should return empty trend when no entries exist', async () => {
      mockPrisma.bodyWeightLog.findMany.mockResolvedValue([]);

      const result = await service.getWeightTrend(1, 'week');

      expect(result).toEqual({
        entries: [],
        startWeight: null,
        endWeight: null,
        changeKg: 0,
        changePct: 0,
      });
    });

    it('should default to month period', async () => {
      mockPrisma.bodyWeightLog.findMany.mockResolvedValue([]);

      await service.getWeightTrend(1);

      expect(mockPrisma.bodyWeightLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: BigInt(1),
            logDate: { gte: expect.any(Date) },
          }),
          orderBy: { logDate: 'asc' },
        }),
      );
    });

    it('should handle single entry with zero change', async () => {
      mockPrisma.bodyWeightLog.findMany.mockResolvedValue([
        {
          id: BigInt(1),
          logDate: new Date('2026-03-28'),
          weightKg: 75,
        },
      ]);

      const result = await service.getWeightTrend(1, 'week');

      expect(result.startWeight).toBe(75);
      expect(result.endWeight).toBe(75);
      expect(result.changeKg).toBe(0);
      expect(result.changePct).toBe(0);
    });
  });

  describe('getWorkoutConsistency', () => {
    it('should return weekly consistency data with streak', async () => {
      mockPrisma.workoutSession.findMany.mockResolvedValue([
        { startedAt: new Date('2026-03-23') },
        { startedAt: new Date('2026-03-24') },
        { startedAt: new Date('2026-03-25') },
      ]);
      mockPrisma.workoutPlan.findFirst.mockResolvedValue({
        daysPerWeek: 3,
      });

      const result = await service.getWorkoutConsistency(1, 1);

      expect(result).toHaveProperty('weeks');
      expect(result).toHaveProperty('overallConsistencyPct');
      expect(result).toHaveProperty('currentStreak');
      expect(Array.isArray(result.weeks)).toBe(true);
    });

    it('should default to 3 days/week when no active plan', async () => {
      mockPrisma.workoutSession.findMany.mockResolvedValue([]);
      mockPrisma.workoutPlan.findFirst.mockResolvedValue(null);

      const result = await service.getWorkoutConsistency(1, 2);

      expect(result.overallConsistencyPct).toBe(0);
      expect(result.currentStreak).toBe(0);
    });

    it('should default to 8 weeks when param is not provided', async () => {
      mockPrisma.workoutSession.findMany.mockResolvedValue([]);
      mockPrisma.workoutPlan.findFirst.mockResolvedValue(null);

      const result = await service.getWorkoutConsistency(1);

      expect(result.weeks).toHaveLength(8);
    });
  });

  describe('getNutritionAdherence', () => {
    it('should return adherence entries with average', async () => {
      mockPrisma.dailyNutritionLog.findMany.mockResolvedValue([
        {
          id: BigInt(1),
          logDate: new Date('2026-03-27'),
          totalCaloriesKcal: 2000,
        },
        {
          id: BigInt(2),
          logDate: new Date('2026-03-28'),
          totalCaloriesKcal: 2200,
        },
      ]);
      mockPrisma.nutritionRecommendation.findFirst.mockResolvedValue({
        dailyCaloriesKcal: 2200,
      });

      const result = await service.getNutritionAdherence(1, 7);

      expect(result.entries).toHaveLength(2);
      expect(result.entries[0].targetCaloriesKcal).toBe(2200);
      expect(result.avgAdherencePct).toBeGreaterThan(0);
    });

    it('should return zero adherence when no recommendation exists', async () => {
      mockPrisma.dailyNutritionLog.findMany.mockResolvedValue([
        {
          id: BigInt(1),
          logDate: new Date('2026-03-28'),
          totalCaloriesKcal: 2000,
        },
      ]);
      mockPrisma.nutritionRecommendation.findFirst.mockResolvedValue(null);

      const result = await service.getNutritionAdherence(1, 7);

      expect(result.entries[0].adherencePct).toBe(0);
      expect(result.avgAdherencePct).toBe(0);
    });

    it('should exclude logs with null calories', async () => {
      mockPrisma.dailyNutritionLog.findMany.mockResolvedValue([
        {
          id: BigInt(1),
          logDate: new Date('2026-03-27'),
          totalCaloriesKcal: 2000,
        },
        {
          id: BigInt(2),
          logDate: new Date('2026-03-28'),
          totalCaloriesKcal: null,
        },
      ]);
      mockPrisma.nutritionRecommendation.findFirst.mockResolvedValue({
        dailyCaloriesKcal: 2200,
      });

      const result = await service.getNutritionAdherence(1, 7);

      expect(result.entries).toHaveLength(1);
    });

    it('should return empty entries and zero average when no logs exist', async () => {
      mockPrisma.dailyNutritionLog.findMany.mockResolvedValue([]);
      mockPrisma.nutritionRecommendation.findFirst.mockResolvedValue(null);

      const result = await service.getNutritionAdherence(1, 30);

      expect(result.entries).toEqual([]);
      expect(result.avgAdherencePct).toBe(0);
    });
  });

  describe('getKpiSnapshots', () => {
    it('should return paginated KPI snapshots', async () => {
      const mockSnapshots = [
        {
          id: BigInt(1),
          userId: BigInt(1),
          snapshotDate: new Date('2026-03-27'),
        },
      ];
      mockPrisma.kpiSnapshot.findMany.mockResolvedValue(mockSnapshots);
      mockPrisma.kpiSnapshot.count.mockResolvedValue(1);

      const result = await service.getKpiSnapshots(1, {
        page: 1,
        limit: 20,
      });

      expect(result).toEqual({
        data: mockSnapshots,
        total: 1,
        page: 1,
        limit: 20,
      });
    });

    it('should apply date filters when provided', async () => {
      mockPrisma.kpiSnapshot.findMany.mockResolvedValue([]);
      mockPrisma.kpiSnapshot.count.mockResolvedValue(0);

      await service.getKpiSnapshots(1, {
        page: 1,
        limit: 20,
        startDate: '2026-03-01',
        endDate: '2026-03-31',
      });

      expect(mockPrisma.kpiSnapshot.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: BigInt(1),
            snapshotDate: {
              gte: new Date('2026-03-01'),
              lte: new Date('2026-03-31'),
            },
          },
        }),
      );
    });

    it('should return empty data for no snapshots', async () => {
      mockPrisma.kpiSnapshot.findMany.mockResolvedValue([]);
      mockPrisma.kpiSnapshot.count.mockResolvedValue(0);

      const result = await service.getKpiSnapshots(1, {});

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    });
  });

  describe('createKpiSnapshot', () => {
    it('should upsert a KPI snapshot with computed values', async () => {
      mockPrisma.bodyWeightLog.findFirst.mockResolvedValue({
        weightKg: 75.5,
      });
      mockPrisma.workoutSession.count.mockResolvedValue(4);
      mockPrisma.workoutPlan.findFirst.mockResolvedValue({
        daysPerWeek: 4,
      });
      mockPrisma.personalRecord.findMany.mockResolvedValue([
        { value: 100 },
        { value: 60 },
      ]);
      mockPrisma.kpiSnapshot.findFirst.mockResolvedValue({
        weeklyStreak: 3,
      });
      const mockSnapshot = {
        id: BigInt(1),
        userId: BigInt(1),
        consistencyScore: 100,
      };
      mockPrisma.kpiSnapshot.upsert.mockResolvedValue(mockSnapshot);

      const result = await service.createKpiSnapshot(1);

      expect(result).toEqual(mockSnapshot);
      expect(mockPrisma.kpiSnapshot.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId_snapshotDate: expect.objectContaining({
              userId: BigInt(1),
            }),
          }),
          create: expect.objectContaining({
            userId: BigInt(1),
            bodyWeightKg: 75.5,
            totalSessionsWeek: 4,
            plannedSessionsWeek: 4,
            consistencyScore: 100,
            strengthIndex: 160,
            weeklyStreak: 4,
          }),
        }),
      );
    });

    it('should reset streak when sessions are below planned', async () => {
      mockPrisma.bodyWeightLog.findFirst.mockResolvedValue(null);
      mockPrisma.workoutSession.count.mockResolvedValue(1);
      mockPrisma.workoutPlan.findFirst.mockResolvedValue({
        daysPerWeek: 4,
      });
      mockPrisma.personalRecord.findMany.mockResolvedValue([]);
      mockPrisma.kpiSnapshot.findFirst.mockResolvedValue({
        weeklyStreak: 5,
      });
      mockPrisma.kpiSnapshot.upsert.mockResolvedValue({});

      await service.createKpiSnapshot(1);

      expect(mockPrisma.kpiSnapshot.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            weeklyStreak: 0,
            bodyWeightKg: null,
          }),
        }),
      );
    });

    it('should default to 3 planned sessions when no active plan', async () => {
      mockPrisma.bodyWeightLog.findFirst.mockResolvedValue(null);
      mockPrisma.workoutSession.count.mockResolvedValue(3);
      mockPrisma.workoutPlan.findFirst.mockResolvedValue(null);
      mockPrisma.personalRecord.findMany.mockResolvedValue([]);
      mockPrisma.kpiSnapshot.findFirst.mockResolvedValue(null);
      mockPrisma.kpiSnapshot.upsert.mockResolvedValue({});

      await service.createKpiSnapshot(1);

      expect(mockPrisma.kpiSnapshot.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            plannedSessionsWeek: 3,
            weeklyStreak: 1,
          }),
        }),
      );
    });
  });
});
