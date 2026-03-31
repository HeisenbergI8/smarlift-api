import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkoutLogService } from './workout-log.service';
import { PrismaService } from '../prisma/prisma.service';
import { PersonalRecordService } from '../personal-record/personal-record.service';
import { EgoLiftService } from '../ego-lift/ego-lift.service';
import { MilestoneService } from '../milestone/milestone.service';

describe('WorkoutLogService', () => {
  let service: WorkoutLogService;

  const mockPrisma = {
    workoutSession: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    workoutSet: {
      create: jest.fn(),
    },
    progressionSetting: {
      findUnique: jest.fn(),
    },
  };

  const mockPersonalRecordService = {
    evaluateAndUpdateRecords: jest.fn(),
  };

  const mockEgoLiftService = {
    analyzeSet: jest.fn(),
  };

  const mockMilestoneService = {
    checkAndAwardMilestones: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutLogService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PersonalRecordService, useValue: mockPersonalRecordService },
        { provide: EgoLiftService, useValue: mockEgoLiftService },
        { provide: MilestoneService, useValue: mockMilestoneService },
      ],
    }).compile();

    service = module.get<WorkoutLogService>(WorkoutLogService);
    jest.clearAllMocks();
  });

  describe('startSession', () => {
    it('should create and return a new workout session', async () => {
      const mockSession = {
        id: BigInt(1),
        userId: BigInt(1),
        status: 'in_progress',
        sets: [],
      };
      mockPrisma.workoutSession.create.mockResolvedValue(mockSession);

      const result = await service.startSession(1, { notes: 'Leg day' });

      expect(result).toEqual(mockSession);
      expect(mockPrisma.workoutSession.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: BigInt(1),
          status: 'in_progress',
          notes: 'Leg day',
        }),
        include: expect.objectContaining({ sets: expect.any(Object) }),
      });
    });

    it('should create session with workoutPlanDayId when provided', async () => {
      mockPrisma.workoutSession.create.mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(1),
        workoutPlanDayId: BigInt(5),
        status: 'in_progress',
        sets: [],
      });

      await service.startSession(1, { workoutPlanDayId: 5 });

      expect(mockPrisma.workoutSession.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ workoutPlanDayId: BigInt(5) }),
        include: expect.any(Object),
      });
    });
  });

  describe('logSet', () => {
    const inProgressSession = {
      id: BigInt(1),
      userId: BigInt(1),
      status: 'in_progress',
    };

    it('should create a set and trigger PR + ego-lift analysis', async () => {
      mockPrisma.workoutSession.findUnique.mockResolvedValue(inProgressSession);
      const mockSet = {
        id: BigInt(10),
        exerciseId: BigInt(5),
        workoutSessionId: BigInt(1),
        reps: 10,
        weightKg: { toNumber: () => 60, valueOf: () => 60 },
        isWarmup: false,
        performedAt: new Date(),
        exercise: { id: BigInt(5), name: 'Bench Press' },
      };
      mockPrisma.workoutSet.create.mockResolvedValue(mockSet);
      mockPrisma.progressionSetting.findUnique.mockResolvedValue({
        trainingGoal: 'hypertrophy',
      });
      mockPersonalRecordService.evaluateAndUpdateRecords.mockResolvedValue(
        undefined,
      );
      mockEgoLiftService.analyzeSet.mockResolvedValue(undefined);

      const result = await service.logSet(1, 1, {
        exerciseId: 5,
        setNumber: 1,
        reps: 10,
        weightKg: 60,
      });

      expect(result).toEqual(mockSet);
      expect(
        mockPersonalRecordService.evaluateAndUpdateRecords,
      ).toHaveBeenCalled();
      expect(mockEgoLiftService.analyzeSet).toHaveBeenCalled();
    });

    it('should skip PR and ego-lift analysis for warmup sets', async () => {
      mockPrisma.workoutSession.findUnique.mockResolvedValue(inProgressSession);
      const mockSet = {
        id: BigInt(10),
        exerciseId: BigInt(5),
        workoutSessionId: BigInt(1),
        reps: 10,
        weightKg: { toNumber: () => 40, valueOf: () => 40 },
        isWarmup: true,
        performedAt: new Date(),
        exercise: { id: BigInt(5), name: 'Bench Press' },
      };
      mockPrisma.workoutSet.create.mockResolvedValue(mockSet);

      await service.logSet(1, 1, {
        exerciseId: 5,
        setNumber: 1,
        reps: 10,
        weightKg: 40,
        isWarmup: true,
      });

      expect(
        mockPersonalRecordService.evaluateAndUpdateRecords,
      ).not.toHaveBeenCalled();
      expect(mockEgoLiftService.analyzeSet).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when session not found', async () => {
      mockPrisma.workoutSession.findUnique.mockResolvedValue(null);

      await expect(
        service.logSet(1, 999, { exerciseId: 5, setNumber: 1, reps: 10 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when session belongs to another user', async () => {
      mockPrisma.workoutSession.findUnique.mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(2), // different user
        status: 'in_progress',
      });

      await expect(
        service.logSet(1, 1, { exerciseId: 5, setNumber: 1, reps: 10 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when session is not in progress', async () => {
      mockPrisma.workoutSession.findUnique.mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(1),
        status: 'completed',
      });

      await expect(
        service.logSet(1, 1, { exerciseId: 5, setNumber: 1, reps: 10 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle PR evaluation failure gracefully', async () => {
      mockPrisma.workoutSession.findUnique.mockResolvedValue(inProgressSession);
      const mockSet = {
        id: BigInt(10),
        exerciseId: BigInt(5),
        workoutSessionId: BigInt(1),
        reps: 10,
        weightKg: { toNumber: () => 60, valueOf: () => 60 },
        isWarmup: false,
        performedAt: new Date(),
        exercise: { id: BigInt(5), name: 'Bench Press' },
      };
      mockPrisma.workoutSet.create.mockResolvedValue(mockSet);
      mockPersonalRecordService.evaluateAndUpdateRecords.mockRejectedValue(
        new Error('PR service down'),
      );
      mockPrisma.progressionSetting.findUnique.mockResolvedValue(null);
      mockEgoLiftService.analyzeSet.mockResolvedValue(undefined);

      // Should not throw
      const result = await service.logSet(1, 1, {
        exerciseId: 5,
        setNumber: 1,
        reps: 10,
        weightKg: 60,
      });

      expect(result).toEqual(mockSet);
    });

    it('should handle ego-lift analysis failure gracefully', async () => {
      mockPrisma.workoutSession.findUnique.mockResolvedValue(inProgressSession);
      const mockSet = {
        id: BigInt(10),
        exerciseId: BigInt(5),
        workoutSessionId: BigInt(1),
        reps: 10,
        weightKg: { toNumber: () => 60, valueOf: () => 60 },
        isWarmup: false,
        performedAt: new Date(),
        exercise: { id: BigInt(5), name: 'Bench Press' },
      };
      mockPrisma.workoutSet.create.mockResolvedValue(mockSet);
      mockPersonalRecordService.evaluateAndUpdateRecords.mockResolvedValue(
        undefined,
      );
      mockPrisma.progressionSetting.findUnique.mockResolvedValue(null);
      mockEgoLiftService.analyzeSet.mockRejectedValue(
        new Error('Ego-lift service down'),
      );

      const result = await service.logSet(1, 1, {
        exerciseId: 5,
        setNumber: 1,
        reps: 10,
        weightKg: 60,
      });

      expect(result).toEqual(mockSet);
    });
  });

  describe('completeSession', () => {
    it('should complete a session and check milestones', async () => {
      const startTime = new Date('2026-03-31T10:00:00Z');
      mockPrisma.workoutSession.findUnique.mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(1),
        status: 'in_progress',
        startedAt: startTime,
      });
      const mockUpdated = {
        id: BigInt(1),
        userId: BigInt(1),
        status: 'completed',
        completedAt: expect.any(Date),
        sets: [],
      };
      mockPrisma.workoutSession.update.mockResolvedValue(mockUpdated);
      mockMilestoneService.checkAndAwardMilestones.mockResolvedValue(undefined);

      const result = await service.completeSession(1, 1, {});

      expect(result).toEqual(mockUpdated);
      expect(mockPrisma.workoutSession.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: BigInt(1) },
          data: expect.objectContaining({ status: 'completed' }),
        }),
      );
      expect(mockMilestoneService.checkAndAwardMilestones).toHaveBeenCalledWith(
        1,
      );
    });

    it('should throw NotFoundException when session not found', async () => {
      mockPrisma.workoutSession.findUnique.mockResolvedValue(null);

      await expect(service.completeSession(1, 999, {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when session belongs to another user', async () => {
      mockPrisma.workoutSession.findUnique.mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(2),
        status: 'in_progress',
        startedAt: new Date(),
      });

      await expect(service.completeSession(1, 1, {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle milestone check failure gracefully', async () => {
      mockPrisma.workoutSession.findUnique.mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(1),
        status: 'in_progress',
        startedAt: new Date(),
      });
      mockPrisma.workoutSession.update.mockResolvedValue({
        id: BigInt(1),
        status: 'completed',
        sets: [],
      });
      mockMilestoneService.checkAndAwardMilestones.mockRejectedValue(
        new Error('Milestone service down'),
      );

      // Should not throw
      const result = await service.completeSession(1, 1, {});

      expect(result.status).toBe('completed');
    });

    it('should include notes when provided', async () => {
      mockPrisma.workoutSession.findUnique.mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(1),
        status: 'in_progress',
        startedAt: new Date(),
      });
      mockPrisma.workoutSession.update.mockResolvedValue({
        id: BigInt(1),
        status: 'completed',
        notes: 'Great workout',
        sets: [],
      });
      mockMilestoneService.checkAndAwardMilestones.mockResolvedValue(undefined);

      await service.completeSession(1, 1, { notes: 'Great workout' });

      expect(mockPrisma.workoutSession.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ notes: 'Great workout' }),
        }),
      );
    });
  });

  describe('getSessionHistory', () => {
    it('should return paginated session history', async () => {
      const mockSessions = [
        { id: BigInt(1), userId: BigInt(1), status: 'completed', sets: [] },
      ];
      mockPrisma.workoutSession.findMany.mockResolvedValue(mockSessions);
      mockPrisma.workoutSession.count.mockResolvedValue(1);

      const result = await service.getSessionHistory(1, 1, 20);

      expect(result).toEqual({
        data: mockSessions,
        total: 1,
        page: 1,
        limit: 20,
      });
      expect(mockPrisma.workoutSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: BigInt(1) },
          orderBy: { startedAt: 'desc' },
          skip: 0,
          take: 20,
        }),
      );
    });

    it('should return empty data when no sessions exist', async () => {
      mockPrisma.workoutSession.findMany.mockResolvedValue([]);
      mockPrisma.workoutSession.count.mockResolvedValue(0);

      const result = await service.getSessionHistory(1, 1, 20);

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    });

    it('should calculate correct skip for page 2', async () => {
      mockPrisma.workoutSession.findMany.mockResolvedValue([]);
      mockPrisma.workoutSession.count.mockResolvedValue(0);

      await service.getSessionHistory(1, 2, 10);

      expect(mockPrisma.workoutSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });
  });

  describe('getSessionById', () => {
    it('should return a session by id', async () => {
      const mockSession = {
        id: BigInt(1),
        userId: BigInt(1),
        status: 'completed',
        sets: [],
      };
      mockPrisma.workoutSession.findUnique.mockResolvedValue(mockSession);

      const result = await service.getSessionById(1, 1);

      expect(result).toEqual(mockSession);
    });

    it('should throw NotFoundException when session not found', async () => {
      mockPrisma.workoutSession.findUnique.mockResolvedValue(null);

      await expect(service.getSessionById(1, 999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when session belongs to another user', async () => {
      mockPrisma.workoutSession.findUnique.mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(2),
        status: 'completed',
        sets: [],
      });

      await expect(service.getSessionById(1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteSession', () => {
    it('should delete a session', async () => {
      mockPrisma.workoutSession.findUnique.mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(1),
      });
      mockPrisma.workoutSession.delete.mockResolvedValue(undefined);

      await service.deleteSession(1, 1);

      expect(mockPrisma.workoutSession.delete).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
      });
    });

    it('should throw NotFoundException when session not found', async () => {
      mockPrisma.workoutSession.findUnique.mockResolvedValue(null);

      await expect(service.deleteSession(1, 999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when session belongs to another user', async () => {
      mockPrisma.workoutSession.findUnique.mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(2),
      });

      await expect(service.deleteSession(1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
