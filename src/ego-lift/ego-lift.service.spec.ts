import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Notification_type } from '@prisma/client';
import { EgoLiftService } from './ego-lift.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

describe('EgoLiftService', () => {
  let service: EgoLiftService;

  const mockPrisma = {
    egoLiftAlert: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    workoutSet: {
      findFirst: jest.fn(),
    },
  };

  const mockNotificationService = {
    createNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EgoLiftService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get<EgoLiftService>(EgoLiftService);
    jest.clearAllMocks();
  });

  describe('getAlerts', () => {
    it('should return paginated non-dismissed alerts', async () => {
      const mockAlerts = [
        {
          id: BigInt(1),
          userId: BigInt(1),
          severity: 'warning',
          isDismissed: false,
          exercise: { name: 'Bench Press' },
        },
      ];
      mockPrisma.egoLiftAlert.findMany.mockResolvedValue(mockAlerts);
      mockPrisma.egoLiftAlert.count.mockResolvedValue(1);

      const result = await service.getAlerts(1, { page: 1, limit: 20 });

      expect(result).toEqual({
        data: mockAlerts,
        total: 1,
        page: 1,
        limit: 20,
      });
      expect(mockPrisma.egoLiftAlert.findMany).toHaveBeenCalledWith({
        where: { userId: BigInt(1), isDismissed: false },
        include: { exercise: true },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
    });

    it('should return empty data when no alerts exist', async () => {
      mockPrisma.egoLiftAlert.findMany.mockResolvedValue([]);
      mockPrisma.egoLiftAlert.count.mockResolvedValue(0);

      const result = await service.getAlerts(1, { page: 1, limit: 20 });

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    });

    it('should use default page and limit when not provided', async () => {
      mockPrisma.egoLiftAlert.findMany.mockResolvedValue([]);
      mockPrisma.egoLiftAlert.count.mockResolvedValue(0);

      const result = await service.getAlerts(1, {});

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
      expect(mockPrisma.egoLiftAlert.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });

    it('should calculate correct skip for page 2', async () => {
      mockPrisma.egoLiftAlert.findMany.mockResolvedValue([]);
      mockPrisma.egoLiftAlert.count.mockResolvedValue(25);

      await service.getAlerts(1, { page: 2, limit: 10 });

      expect(mockPrisma.egoLiftAlert.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });
  });

  describe('getAlertsByExercise', () => {
    it('should return paginated alerts filtered by exercise', async () => {
      const mockAlerts = [
        {
          id: BigInt(1),
          userId: BigInt(1),
          exerciseId: BigInt(5),
          exercise: { name: 'Squat' },
        },
      ];
      mockPrisma.egoLiftAlert.findMany.mockResolvedValue(mockAlerts);
      mockPrisma.egoLiftAlert.count.mockResolvedValue(1);

      const result = await service.getAlertsByExercise(1, 5, {
        page: 1,
        limit: 20,
      });

      expect(result).toEqual({
        data: mockAlerts,
        total: 1,
        page: 1,
        limit: 20,
      });
      expect(mockPrisma.egoLiftAlert.findMany).toHaveBeenCalledWith({
        where: { userId: BigInt(1), exerciseId: BigInt(5) },
        include: { exercise: true },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
    });

    it('should return empty data when no alerts for exercise', async () => {
      mockPrisma.egoLiftAlert.findMany.mockResolvedValue([]);
      mockPrisma.egoLiftAlert.count.mockResolvedValue(0);

      const result = await service.getAlertsByExercise(1, 99, {
        page: 1,
        limit: 20,
      });

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    });
  });

  describe('dismissAlert', () => {
    it('should dismiss an alert owned by user', async () => {
      const mockAlert = {
        id: BigInt(1),
        userId: BigInt(1),
        isDismissed: false,
      };
      mockPrisma.egoLiftAlert.findUnique.mockResolvedValue(mockAlert);
      const updatedAlert = { ...mockAlert, isDismissed: true };
      mockPrisma.egoLiftAlert.update.mockResolvedValue(updatedAlert);

      const result = await service.dismissAlert(1, 1);

      expect(result).toEqual(updatedAlert);
      expect(mockPrisma.egoLiftAlert.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: { isDismissed: true },
      });
    });

    it('should throw NotFoundException when alert does not exist', async () => {
      mockPrisma.egoLiftAlert.findUnique.mockResolvedValue(null);

      await expect(service.dismissAlert(1, 999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when user does not own the alert', async () => {
      mockPrisma.egoLiftAlert.findUnique.mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(2),
        isDismissed: false,
      });

      await expect(service.dismissAlert(1, 1)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.egoLiftAlert.update).not.toHaveBeenCalled();
    });
  });

  describe('analyzeSet', () => {
    const makeCurrentSet = (
      weightKg: number | null,
      reps: number,
      exerciseId = BigInt(10),
    ) => ({
      id: BigInt(100),
      exerciseId,
      workoutSessionId: BigInt(50),
      reps,
      weightKg: weightKg !== null ? { toNumber: () => weightKg } : null,
    });

    it('should skip analysis when currentSet weightKg is null', async () => {
      await service.analyzeSet(1, makeCurrentSet(null, 8), 'hypertrophy');

      expect(mockPrisma.workoutSet.findFirst).not.toHaveBeenCalled();
      expect(mockPrisma.egoLiftAlert.create).not.toHaveBeenCalled();
    });

    it('should skip when no previous set exists', async () => {
      mockPrisma.workoutSet.findFirst.mockResolvedValue(null);

      await service.analyzeSet(1, makeCurrentSet(60, 8), 'hypertrophy');

      expect(mockPrisma.egoLiftAlert.create).not.toHaveBeenCalled();
    });

    it('should skip when previous set has null weightKg', async () => {
      mockPrisma.workoutSet.findFirst.mockResolvedValue({
        id: BigInt(90),
        reps: 10,
        weightKg: null,
      });

      await service.analyzeSet(1, makeCurrentSet(60, 8), 'hypertrophy');

      expect(mockPrisma.egoLiftAlert.create).not.toHaveBeenCalled();
    });

    it('should skip when previous set weight is zero', async () => {
      mockPrisma.workoutSet.findFirst.mockResolvedValue({
        id: BigInt(90),
        reps: 10,
        weightKg: 0,
      });

      await service.analyzeSet(1, makeCurrentSet(60, 8), 'hypertrophy');

      expect(mockPrisma.egoLiftAlert.create).not.toHaveBeenCalled();
    });

    it('should not flag when weight increase is below threshold', async () => {
      // hypertrophy: weightIncreaseMin=15%, repDropMin=25%
      // 60 → 65 = 8.3% increase (below 15%)
      mockPrisma.workoutSet.findFirst.mockResolvedValue({
        id: BigInt(90),
        reps: 10,
        weightKg: 60,
      });

      await service.analyzeSet(1, makeCurrentSet(65, 5), 'hypertrophy');

      expect(mockPrisma.egoLiftAlert.create).not.toHaveBeenCalled();
    });

    it('should not flag when rep drop is below threshold', async () => {
      // 60 → 72 = 20% increase (above 15%), reps 10 → 8 = 20% drop (below 25%)
      mockPrisma.workoutSet.findFirst.mockResolvedValue({
        id: BigInt(90),
        reps: 10,
        weightKg: 60,
      });

      await service.analyzeSet(1, makeCurrentSet(72, 8), 'hypertrophy');

      expect(mockPrisma.egoLiftAlert.create).not.toHaveBeenCalled();
    });

    it('should create warning alert when thresholds are exceeded for hypertrophy', async () => {
      // 60 → 75 = 25% increase (>15%), reps 10 → 7 = 30% drop (>=25%, <33%)
      mockPrisma.workoutSet.findFirst.mockResolvedValue({
        id: BigInt(90),
        reps: 10,
        weightKg: 60,
      });
      mockPrisma.egoLiftAlert.create.mockResolvedValue({});
      mockNotificationService.createNotification.mockResolvedValue(undefined);

      await service.analyzeSet(1, makeCurrentSet(75, 7), 'hypertrophy');

      expect(mockPrisma.egoLiftAlert.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: BigInt(1),
          exerciseId: BigInt(10),
          severity: 'warning',
          previousWeightKg: 60,
          flaggedWeightKg: 75,
          previousReps: 10,
          flaggedReps: 7,
          trainingGoal: 'hypertrophy',
        }),
      });
    });

    it('should create critical alert when rep drop is >= 33%', async () => {
      // 60 → 80 = 33% increase (>15%), reps 12 → 6 = 50% drop (>=33%)
      mockPrisma.workoutSet.findFirst.mockResolvedValue({
        id: BigInt(90),
        reps: 12,
        weightKg: 60,
      });
      mockPrisma.egoLiftAlert.create.mockResolvedValue({});
      mockNotificationService.createNotification.mockResolvedValue(undefined);

      await service.analyzeSet(1, makeCurrentSet(80, 6), 'hypertrophy');

      expect(mockPrisma.egoLiftAlert.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          severity: 'critical',
        }),
      });
    });

    it('should use strength thresholds when goal is strength', async () => {
      // strength: weightIncreaseMin=10%, repDropMin=20%
      // 100 → 115 = 15% increase (>10%), reps 5 → 3 = 40% drop (>20%)
      mockPrisma.workoutSet.findFirst.mockResolvedValue({
        id: BigInt(90),
        reps: 5,
        weightKg: 100,
      });
      mockPrisma.egoLiftAlert.create.mockResolvedValue({});
      mockNotificationService.createNotification.mockResolvedValue(undefined);

      await service.analyzeSet(1, makeCurrentSet(115, 3), 'strength');

      expect(mockPrisma.egoLiftAlert.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          trainingGoal: 'strength',
        }),
      });
    });

    it('should use endurance thresholds when goal is endurance', async () => {
      // endurance: weightIncreaseMin=20%, repDropMin=30%
      // 40 → 52 = 30% increase (>20%), reps 20 → 12 = 40% drop (>30%)
      mockPrisma.workoutSet.findFirst.mockResolvedValue({
        id: BigInt(90),
        reps: 20,
        weightKg: 40,
      });
      mockPrisma.egoLiftAlert.create.mockResolvedValue({});
      mockNotificationService.createNotification.mockResolvedValue(undefined);

      await service.analyzeSet(1, makeCurrentSet(52, 12), 'endurance');

      expect(mockPrisma.egoLiftAlert.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          trainingGoal: 'endurance',
        }),
      });
    });

    it('should default to hypertrophy for unknown training goal', async () => {
      // 60 → 75 = 25% increase (>15%), reps 10 → 7 = 30% drop (>=25%)
      mockPrisma.workoutSet.findFirst.mockResolvedValue({
        id: BigInt(90),
        reps: 10,
        weightKg: 60,
      });
      mockPrisma.egoLiftAlert.create.mockResolvedValue({});
      mockNotificationService.createNotification.mockResolvedValue(undefined);

      await service.analyzeSet(1, makeCurrentSet(75, 7), 'unknown_goal');

      expect(mockPrisma.egoLiftAlert.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          trainingGoal: 'hypertrophy',
        }),
      });
    });

    it('should send notification after creating alert', async () => {
      mockPrisma.workoutSet.findFirst.mockResolvedValue({
        id: BigInt(90),
        reps: 10,
        weightKg: 60,
      });
      mockPrisma.egoLiftAlert.create.mockResolvedValue({});
      mockNotificationService.createNotification.mockResolvedValue(undefined);

      await service.analyzeSet(1, makeCurrentSet(75, 7), 'hypertrophy');

      expect(mockNotificationService.createNotification).toHaveBeenCalledWith(
        1,
        Notification_type.ego_lift_warning,
        'Ego-Lift Warning',
        expect.stringContaining('possible ego-lift detected'),
      );
    });

    it('should not throw when notification fails', async () => {
      mockPrisma.workoutSet.findFirst.mockResolvedValue({
        id: BigInt(90),
        reps: 10,
        weightKg: 60,
      });
      mockPrisma.egoLiftAlert.create.mockResolvedValue({});
      mockNotificationService.createNotification.mockRejectedValue(
        new Error('Notification service down'),
      );

      await expect(
        service.analyzeSet(1, makeCurrentSet(75, 7), 'hypertrophy'),
      ).resolves.toBeUndefined();

      expect(mockPrisma.egoLiftAlert.create).toHaveBeenCalled();
    });
  });
});
