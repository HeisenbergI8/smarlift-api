import { Test, TestingModule } from '@nestjs/testing';
import { PersonalRecordService } from './personal-record.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PersonalRecordService', () => {
  let service: PersonalRecordService;

  const mockPrisma = {
    personalRecord: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonalRecordService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PersonalRecordService>(PersonalRecordService);
    jest.clearAllMocks();
  });

  const makeSet = (overrides: Record<string, unknown> = {}) => ({
    id: BigInt(100),
    exerciseId: BigInt(10),
    reps: 12,
    weightKg: { toNumber: () => 80, valueOf: () => 80 },
    performedAt: new Date('2026-04-01'),
    ...overrides,
  });

  describe('getUserRecords', () => {
    it('should return all personal records for a user', async () => {
      const mockRecords = [
        {
          id: BigInt(1),
          userId: BigInt(1),
          exerciseId: BigInt(10),
          recordType: 'max_weight',
          value: 100,
          exercise: { id: BigInt(10), name: 'Bench Press' },
        },
      ];
      mockPrisma.personalRecord.findMany.mockResolvedValue(mockRecords);

      const result = await service.getUserRecords(1);

      expect(result).toEqual(mockRecords);
      expect(mockPrisma.personalRecord.findMany).toHaveBeenCalledWith({
        where: { userId: BigInt(1) },
        include: { exercise: true },
        orderBy: [{ exercise: { name: 'asc' } }, { recordType: 'asc' }],
      });
    });

    it('should return empty array when user has no records', async () => {
      mockPrisma.personalRecord.findMany.mockResolvedValue([]);

      const result = await service.getUserRecords(1);

      expect(result).toEqual([]);
    });
  });

  describe('getRecordsByExercise', () => {
    it('should return records for a specific exercise', async () => {
      const mockRecords = [
        {
          id: BigInt(1),
          userId: BigInt(1),
          exerciseId: BigInt(10),
          recordType: 'max_weight',
          value: 100,
        },
      ];
      mockPrisma.personalRecord.findMany.mockResolvedValue(mockRecords);

      const result = await service.getRecordsByExercise(1, 10);

      expect(result).toEqual(mockRecords);
      expect(mockPrisma.personalRecord.findMany).toHaveBeenCalledWith({
        where: { userId: BigInt(1), exerciseId: BigInt(10) },
        include: { exercise: true },
        orderBy: { recordType: 'asc' },
      });
    });

    it('should return empty array when no records for exercise', async () => {
      mockPrisma.personalRecord.findMany.mockResolvedValue([]);

      const result = await service.getRecordsByExercise(1, 999);

      expect(result).toEqual([]);
    });
  });

  describe('evaluateAndUpdateRecords', () => {
    it('should evaluate max_reps, max_weight, and max_volume when weightKg is provided', async () => {
      mockPrisma.personalRecord.findUnique.mockResolvedValue(null);
      mockPrisma.personalRecord.upsert.mockResolvedValue({});

      await service.evaluateAndUpdateRecords(1, makeSet());

      expect(mockPrisma.personalRecord.upsert).toHaveBeenCalledTimes(3);
      const callTypes = (
        mockPrisma.personalRecord.upsert.mock.calls as Array<
          [{ create: { recordType: string } }]
        >
      ).map((c) => c[0].create.recordType);
      expect(callTypes).toContain('max_reps');
      expect(callTypes).toContain('max_weight');
      expect(callTypes).toContain('max_volume');
    });

    it('should evaluate only max_reps when weightKg is null', async () => {
      mockPrisma.personalRecord.findUnique.mockResolvedValue(null);
      mockPrisma.personalRecord.upsert.mockResolvedValue({});

      await service.evaluateAndUpdateRecords(1, makeSet({ weightKg: null }));

      expect(mockPrisma.personalRecord.upsert).toHaveBeenCalledTimes(1);
      expect(mockPrisma.personalRecord.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ recordType: 'max_reps' }),
        }),
      );
    });

    it('should skip upsert when existing record is better', async () => {
      mockPrisma.personalRecord.findUnique.mockResolvedValue({
        id: BigInt(1),
        value: 20, // existing is better than 12 reps
      });

      await service.evaluateAndUpdateRecords(1, makeSet({ weightKg: null }));

      expect(mockPrisma.personalRecord.upsert).not.toHaveBeenCalled();
    });

    it('should upsert when new record is better than existing', async () => {
      mockPrisma.personalRecord.findUnique.mockResolvedValue({
        id: BigInt(1),
        value: 5, // existing is worse than 12 reps
      });
      mockPrisma.personalRecord.upsert.mockResolvedValue({});

      await service.evaluateAndUpdateRecords(1, makeSet({ weightKg: null }));

      expect(mockPrisma.personalRecord.upsert).toHaveBeenCalledTimes(1);
    });

    it('should calculate volume correctly as reps * weightKg', async () => {
      mockPrisma.personalRecord.findUnique.mockResolvedValue(null);
      mockPrisma.personalRecord.upsert.mockResolvedValue({});

      await service.evaluateAndUpdateRecords(
        1,
        makeSet({
          reps: 10,
          weightKg: { toNumber: () => 100, valueOf: () => 100 },
        }),
      );

      const calls = mockPrisma.personalRecord.upsert.mock.calls as Array<
        [{ create: { recordType: string; value: number } }]
      >;
      const volumeCall = calls.find(
        (c) => c[0].create.recordType === 'max_volume',
      );
      expect(volumeCall).toBeDefined();
      expect(volumeCall![0].create.value).toBe(1000); // 10 * 100
    });
  });
});
