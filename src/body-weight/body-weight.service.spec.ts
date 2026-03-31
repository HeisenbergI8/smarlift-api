import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BodyWeightService } from './body-weight.service';
import { PrismaService } from '../prisma/prisma.service';
import { LogBodyWeightDto, GetBodyWeightLogsQueryDto } from './dto';

describe('BodyWeightService', () => {
  let service: BodyWeightService;

  const mockPrisma = {
    bodyWeightLog: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BodyWeightService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BodyWeightService>(BodyWeightService);
    jest.clearAllMocks();
  });

  describe('logWeight', () => {
    it('should upsert a body weight log with provided source', async () => {
      const dto: LogBodyWeightDto = {
        logDate: '2026-03-28',
        weightKg: 75.5,
        source: 'manual' as LogBodyWeightDto['source'],
      };
      const mockResult = {
        id: BigInt(1),
        userId: BigInt(1),
        logDate: new Date('2026-03-28'),
        weightKg: 75.5,
        source: 'manual',
        createdAt: new Date(),
      };
      mockPrisma.bodyWeightLog.upsert.mockResolvedValue(mockResult);

      const result = await service.logWeight(1, dto);

      expect(result).toEqual(mockResult);
      expect(mockPrisma.bodyWeightLog.upsert).toHaveBeenCalledWith({
        where: {
          userId_logDate: {
            userId: BigInt(1),
            logDate: new Date('2026-03-28'),
          },
        },
        update: { weightKg: 75.5, source: 'manual' },
        create: {
          userId: BigInt(1),
          logDate: new Date('2026-03-28'),
          weightKg: 75.5,
          source: 'manual',
        },
      });
    });

    it('should default source to manual when not provided', async () => {
      const dto: LogBodyWeightDto = {
        logDate: '2026-03-28',
        weightKg: 80,
      };
      mockPrisma.bodyWeightLog.upsert.mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(1),
        logDate: new Date('2026-03-28'),
        weightKg: 80,
        source: 'manual',
      });

      await service.logWeight(1, dto);

      expect(mockPrisma.bodyWeightLog.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: { weightKg: 80, source: 'manual' },
          create: expect.objectContaining({ source: 'manual' }),
        }),
      );
    });
  });

  describe('getLogs', () => {
    it('should return paginated body weight logs', async () => {
      const mockLogs = [
        {
          id: BigInt(2),
          userId: BigInt(1),
          logDate: new Date('2026-03-28'),
          weightKg: 76,
          source: 'manual',
        },
        {
          id: BigInt(1),
          userId: BigInt(1),
          logDate: new Date('2026-03-27'),
          weightKg: 75.5,
          source: 'manual',
        },
      ];
      mockPrisma.bodyWeightLog.findMany.mockResolvedValue(mockLogs);
      mockPrisma.bodyWeightLog.count.mockResolvedValue(2);

      const query: GetBodyWeightLogsQueryDto = { page: 1, limit: 20 };
      const result = await service.getLogs(1, query);

      expect(result).toEqual({ data: mockLogs, total: 2, page: 1, limit: 20 });
      expect(mockPrisma.bodyWeightLog.findMany).toHaveBeenCalledWith({
        where: { userId: BigInt(1) },
        orderBy: { logDate: 'desc' },
        skip: 0,
        take: 20,
      });
    });

    it('should apply startDate filter when provided', async () => {
      mockPrisma.bodyWeightLog.findMany.mockResolvedValue([]);
      mockPrisma.bodyWeightLog.count.mockResolvedValue(0);

      const query: GetBodyWeightLogsQueryDto = {
        page: 1,
        limit: 20,
        startDate: '2026-03-01',
      };
      await service.getLogs(1, query);

      expect(mockPrisma.bodyWeightLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: BigInt(1),
            logDate: { gte: new Date('2026-03-01') },
          },
        }),
      );
    });

    it('should apply endDate filter when provided', async () => {
      mockPrisma.bodyWeightLog.findMany.mockResolvedValue([]);
      mockPrisma.bodyWeightLog.count.mockResolvedValue(0);

      const query: GetBodyWeightLogsQueryDto = {
        page: 1,
        limit: 20,
        endDate: '2026-03-31',
      };
      await service.getLogs(1, query);

      expect(mockPrisma.bodyWeightLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: BigInt(1),
            logDate: { lte: new Date('2026-03-31') },
          },
        }),
      );
    });

    it('should apply both startDate and endDate filters', async () => {
      mockPrisma.bodyWeightLog.findMany.mockResolvedValue([]);
      mockPrisma.bodyWeightLog.count.mockResolvedValue(0);

      const query: GetBodyWeightLogsQueryDto = {
        page: 1,
        limit: 20,
        startDate: '2026-03-01',
        endDate: '2026-03-31',
      };
      await service.getLogs(1, query);

      expect(mockPrisma.bodyWeightLog.findMany).toHaveBeenCalledWith(
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

    it('should return empty data with total 0 when no logs exist', async () => {
      mockPrisma.bodyWeightLog.findMany.mockResolvedValue([]);
      mockPrisma.bodyWeightLog.count.mockResolvedValue(0);

      const query: GetBodyWeightLogsQueryDto = { page: 1, limit: 20 };
      const result = await service.getLogs(1, query);

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    });

    it('should use default page and limit when not provided', async () => {
      mockPrisma.bodyWeightLog.findMany.mockResolvedValue([]);
      mockPrisma.bodyWeightLog.count.mockResolvedValue(0);

      const query: GetBodyWeightLogsQueryDto = {};
      const result = await service.getLogs(1, query);

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
      expect(mockPrisma.bodyWeightLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });

    it('should calculate correct skip for page 2', async () => {
      mockPrisma.bodyWeightLog.findMany.mockResolvedValue([]);
      mockPrisma.bodyWeightLog.count.mockResolvedValue(25);

      const query: GetBodyWeightLogsQueryDto = { page: 2, limit: 10 };
      await service.getLogs(1, query);

      expect(mockPrisma.bodyWeightLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });
  });

  describe('getWeeklyAverages', () => {
    it('should return weekly averages grouped by Monday', async () => {
      // Monday 2026-03-23 and Wednesday 2026-03-25 are same week
      const mockLogs = [
        {
          id: BigInt(1),
          userId: BigInt(1),
          logDate: new Date('2026-03-23'),
          weightKg: 74,
          source: 'manual',
        },
        {
          id: BigInt(2),
          userId: BigInt(1),
          logDate: new Date('2026-03-25'),
          weightKg: 76,
          source: 'manual',
        },
      ];
      mockPrisma.bodyWeightLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.getWeeklyAverages(1, 4);

      expect(result).toHaveLength(1);
      expect(result[0].avgWeightKg).toBe(75);
      expect(result[0].entryCount).toBe(2);
    });

    it('should return multiple weeks sorted by weekStart ascending', async () => {
      const mockLogs = [
        {
          id: BigInt(1),
          userId: BigInt(1),
          logDate: new Date('2026-03-16'),
          weightKg: 74,
          source: 'manual',
        },
        {
          id: BigInt(2),
          userId: BigInt(1),
          logDate: new Date('2026-03-23'),
          weightKg: 76,
          source: 'manual',
        },
      ];
      mockPrisma.bodyWeightLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.getWeeklyAverages(1, 4);

      expect(result).toHaveLength(2);
      expect(result[0].weekStart.getTime()).toBeLessThan(
        result[1].weekStart.getTime(),
      );
    });

    it('should return empty array when no logs exist', async () => {
      mockPrisma.bodyWeightLog.findMany.mockResolvedValue([]);

      const result = await service.getWeeklyAverages(1, 12);

      expect(result).toEqual([]);
    });

    it('should use default 12 weeks when weeks param is not provided', async () => {
      mockPrisma.bodyWeightLog.findMany.mockResolvedValue([]);

      await service.getWeeklyAverages(1);

      expect(mockPrisma.bodyWeightLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: BigInt(1),
            logDate: expect.objectContaining({ gte: expect.any(Date) }),
          }),
          orderBy: { logDate: 'asc' },
        }),
      );
    });

    it('should round avgWeightKg to one decimal place', async () => {
      const mockLogs = [
        {
          id: BigInt(1),
          userId: BigInt(1),
          logDate: new Date('2026-03-23'),
          weightKg: 74.3,
          source: 'manual',
        },
        {
          id: BigInt(2),
          userId: BigInt(1),
          logDate: new Date('2026-03-24'),
          weightKg: 74.5,
          source: 'manual',
        },
        {
          id: BigInt(3),
          userId: BigInt(1),
          logDate: new Date('2026-03-25'),
          weightKg: 74.8,
          source: 'manual',
        },
      ];
      mockPrisma.bodyWeightLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.getWeeklyAverages(1, 4);

      // (74.3 + 74.5 + 74.8) / 3 = 74.533... → 74.5
      expect(result[0].avgWeightKg).toBe(74.5);
      expect(result[0].entryCount).toBe(3);
    });
  });

  describe('getLatest', () => {
    it('should return the most recent body weight log', async () => {
      const mockLog = {
        id: BigInt(5),
        userId: BigInt(1),
        logDate: new Date('2026-03-28'),
        weightKg: 76,
        source: 'manual',
      };
      mockPrisma.bodyWeightLog.findFirst.mockResolvedValue(mockLog);

      const result = await service.getLatest(1);

      expect(result).toEqual(mockLog);
      expect(mockPrisma.bodyWeightLog.findFirst).toHaveBeenCalledWith({
        where: { userId: BigInt(1) },
        orderBy: { logDate: 'desc' },
      });
    });

    it('should return null when no logs exist', async () => {
      mockPrisma.bodyWeightLog.findFirst.mockResolvedValue(null);

      const result = await service.getLatest(1);

      expect(result).toBeNull();
    });
  });

  describe('deleteLog', () => {
    it('should delete the log when found and owned by user', async () => {
      const mockLog = {
        id: BigInt(1),
        userId: BigInt(1),
        logDate: new Date('2026-03-28'),
        weightKg: 75,
      };
      mockPrisma.bodyWeightLog.findUnique.mockResolvedValue(mockLog);
      mockPrisma.bodyWeightLog.delete.mockResolvedValue(mockLog);

      await service.deleteLog(1, 1);

      expect(mockPrisma.bodyWeightLog.delete).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
      });
    });

    it('should throw NotFoundException when log does not exist', async () => {
      mockPrisma.bodyWeightLog.findUnique.mockResolvedValue(null);

      await expect(service.deleteLog(1, 999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when user does not own the log', async () => {
      const mockLog = {
        id: BigInt(1),
        userId: BigInt(2),
        logDate: new Date('2026-03-28'),
        weightKg: 75,
      };
      mockPrisma.bodyWeightLog.findUnique.mockResolvedValue(mockLog);

      await expect(service.deleteLog(1, 1)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.bodyWeightLog.delete).not.toHaveBeenCalled();
    });
  });
});
