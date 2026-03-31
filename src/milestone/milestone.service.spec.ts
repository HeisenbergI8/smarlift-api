import { Test, TestingModule } from '@nestjs/testing';
import { MilestoneService } from './milestone.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

describe('MilestoneService', () => {
  let service: MilestoneService;

  const mockPrisma = {
    milestone: {
      findMany: jest.fn(),
    },
    userMilestone: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    personalRecord: {
      findMany: jest.fn(),
    },
    workoutSession: {
      count: jest.fn(),
    },
    bodyWeightLog: {
      findFirst: jest.fn(),
    },
    dailyNutritionLog: {
      count: jest.fn(),
    },
    $transaction: jest.fn((promises: unknown[]) => Promise.all(promises)),
  };

  const mockNotificationService = {
    createNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MilestoneService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get<MilestoneService>(MilestoneService);
    jest.clearAllMocks();
  });

  describe('getAllMilestones', () => {
    it('should return milestones ordered by category and name', async () => {
      const mockMilestones = [
        { id: BigInt(1), name: 'First PR', category: 'strength' },
        { id: BigInt(2), name: '10 Sessions', category: 'consistency' },
      ];
      mockPrisma.milestone.findMany.mockResolvedValue(mockMilestones);

      const result = await service.getAllMilestones();

      expect(result).toEqual(mockMilestones);
      expect(mockPrisma.milestone.findMany).toHaveBeenCalledWith({
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      });
    });
  });

  describe('getUserMilestones', () => {
    it('should return earned milestones for user', async () => {
      const mockEarned = [
        {
          id: BigInt(1),
          userId: BigInt(1),
          milestoneId: BigInt(1),
          milestone: { name: 'First PR' },
        },
      ];
      mockPrisma.userMilestone.findMany.mockResolvedValue(mockEarned);

      const result = await service.getUserMilestones(1);

      expect(result).toEqual(mockEarned);
      expect(mockPrisma.userMilestone.findMany).toHaveBeenCalledWith({
        where: { userId: BigInt(1) },
        include: { milestone: true },
        orderBy: { achievedAt: 'desc' },
      });
    });
  });

  describe('checkAndAwardMilestones', () => {
    const strengthMilestone = {
      id: BigInt(1),
      name: 'Lift 100kg',
      category: 'strength',
      criteriaJson: { targetValue: 100, unit: 'kg' },
    };

    const consistencyMilestone = {
      id: BigInt(2),
      name: '10 Sessions',
      category: 'consistency',
      criteriaJson: { targetValue: 10 },
    };

    const generalMilestone = {
      id: BigInt(3),
      name: 'Welcome',
      category: 'general',
      criteriaJson: null,
    };

    it('should award milestones when criteria are met', async () => {
      mockPrisma.milestone.findMany.mockResolvedValue([
        strengthMilestone,
        consistencyMilestone,
      ]);
      mockPrisma.userMilestone.findMany.mockResolvedValue([]);

      // Stats: 150kg PR, 15 sessions
      mockPrisma.personalRecord.findMany.mockResolvedValue([{ value: 150 }]);
      mockPrisma.workoutSession.count.mockResolvedValue(15);
      mockPrisma.bodyWeightLog.findFirst.mockResolvedValue(null);
      mockPrisma.dailyNutritionLog.count.mockResolvedValue(0);

      mockPrisma.userMilestone.create.mockImplementation((args: unknown) =>
        Promise.resolve(args),
      );

      const result = await service.checkAndAwardMilestones(1);

      expect(result).toHaveLength(2);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockNotificationService.createNotification).toHaveBeenCalledTimes(
        2,
      );
    });

    it('should return empty array when all milestones already earned', async () => {
      mockPrisma.milestone.findMany.mockResolvedValue([strengthMilestone]);
      mockPrisma.userMilestone.findMany.mockResolvedValue([
        { milestoneId: BigInt(1) },
      ]);

      const result = await service.checkAndAwardMilestones(1);

      expect(result).toEqual([]);
    });

    it('should skip milestones without targetValue in criteria', async () => {
      mockPrisma.milestone.findMany.mockResolvedValue([generalMilestone]);
      mockPrisma.userMilestone.findMany.mockResolvedValue([]);

      // Stats don't matter — should skip evaluating
      mockPrisma.personalRecord.findMany.mockResolvedValue([]);
      mockPrisma.workoutSession.count.mockResolvedValue(0);
      mockPrisma.bodyWeightLog.findFirst.mockResolvedValue(null);
      mockPrisma.dailyNutritionLog.count.mockResolvedValue(0);

      const result = await service.checkAndAwardMilestones(1);

      expect(result).toEqual([]);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('should not award when criteria not met', async () => {
      mockPrisma.milestone.findMany.mockResolvedValue([strengthMilestone]);
      mockPrisma.userMilestone.findMany.mockResolvedValue([]);

      // Stats: only 50kg PR — not enough for 100kg milestone
      mockPrisma.personalRecord.findMany.mockResolvedValue([{ value: 50 }]);
      mockPrisma.workoutSession.count.mockResolvedValue(0);
      mockPrisma.bodyWeightLog.findFirst.mockResolvedValue(null);
      mockPrisma.dailyNutritionLog.count.mockResolvedValue(0);

      const result = await service.checkAndAwardMilestones(1);

      expect(result).toEqual([]);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('should handle weight milestone using magnitude of change', async () => {
      const weightMilestone = {
        id: BigInt(4),
        name: 'Lost 5kg',
        category: 'weight',
        criteriaJson: { targetValue: 5 },
      };

      mockPrisma.milestone.findMany.mockResolvedValue([weightMilestone]);
      mockPrisma.userMilestone.findMany.mockResolvedValue([]);

      mockPrisma.personalRecord.findMany.mockResolvedValue([]);
      mockPrisma.workoutSession.count.mockResolvedValue(0);
      mockPrisma.bodyWeightLog.findFirst
        .mockResolvedValueOnce({ weightKg: 80 }) // first
        .mockResolvedValueOnce({ weightKg: 74 }); // latest — 6kg change
      mockPrisma.dailyNutritionLog.count.mockResolvedValue(0);

      mockPrisma.userMilestone.create.mockImplementation((args: unknown) =>
        Promise.resolve(args),
      );

      const result = await service.checkAndAwardMilestones(1);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Lost 5kg');
    });

    it('should continue sending notifications even when one fails', async () => {
      mockPrisma.milestone.findMany.mockResolvedValue([
        strengthMilestone,
        consistencyMilestone,
      ]);
      mockPrisma.userMilestone.findMany.mockResolvedValue([]);

      mockPrisma.personalRecord.findMany.mockResolvedValue([{ value: 150 }]);
      mockPrisma.workoutSession.count.mockResolvedValue(15);
      mockPrisma.bodyWeightLog.findFirst.mockResolvedValue(null);
      mockPrisma.dailyNutritionLog.count.mockResolvedValue(0);

      mockPrisma.userMilestone.create.mockImplementation((args: unknown) =>
        Promise.resolve(args),
      );

      // First notification fails, second should still be called
      mockNotificationService.createNotification
        .mockRejectedValueOnce(new Error('notification failed'))
        .mockResolvedValueOnce(undefined);

      const result = await service.checkAndAwardMilestones(1);

      expect(result).toHaveLength(2);
      expect(mockNotificationService.createNotification).toHaveBeenCalledTimes(
        2,
      );
    });
  });
});
