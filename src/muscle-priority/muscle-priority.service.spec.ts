import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MusclePriorityService } from './muscle-priority.service';
import { PrismaService } from '../prisma/prisma.service';
import { PriorityLevel } from './dto/upsert-muscle-priority.dto';

describe('MusclePriorityService', () => {
  let service: MusclePriorityService;

  const mockPrisma = {
    userMusclePriority: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    muscleGroup: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MusclePriorityService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MusclePriorityService>(MusclePriorityService);
    jest.clearAllMocks();
  });

  describe('getUserPriorities', () => {
    it('should return paginated user muscle priorities', async () => {
      const mockData = [
        {
          id: BigInt(1),
          userId: BigInt(1),
          muscleGroupId: BigInt(3),
          priorityLevel: 'high',
          hasImbalance: true,
          notes: 'Left side weaker',
          muscleGroup: {
            id: BigInt(3),
            name: 'Shoulder',
            bodyRegion: 'upper_body',
          },
        },
      ];
      mockPrisma.userMusclePriority.findMany.mockResolvedValue(mockData);
      mockPrisma.userMusclePriority.count.mockResolvedValue(1);

      const result = await service.getUserPriorities(1, {
        page: 1,
        limit: 20,
      });

      expect(result).toEqual({
        data: mockData,
        total: 1,
        page: 1,
        limit: 20,
      });
      expect(mockPrisma.userMusclePriority.findMany).toHaveBeenCalledWith({
        where: { userId: BigInt(1) },
        include: { muscleGroup: true },
        skip: 0,
        take: 20,
        orderBy: { muscleGroup: { name: 'asc' } },
      });
    });

    it('should return empty data when user has no priorities', async () => {
      mockPrisma.userMusclePriority.findMany.mockResolvedValue([]);
      mockPrisma.userMusclePriority.count.mockResolvedValue(0);

      const result = await service.getUserPriorities(1, {
        page: 1,
        limit: 20,
      });

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    });

    it('should use default page and limit when not provided', async () => {
      mockPrisma.userMusclePriority.findMany.mockResolvedValue([]);
      mockPrisma.userMusclePriority.count.mockResolvedValue(0);

      const result = await service.getUserPriorities(1, {});

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    });

    it('should calculate correct skip for page 2', async () => {
      mockPrisma.userMusclePriority.findMany.mockResolvedValue([]);
      mockPrisma.userMusclePriority.count.mockResolvedValue(25);

      await service.getUserPriorities(1, { page: 2, limit: 10 });

      expect(mockPrisma.userMusclePriority.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });
  });

  describe('upsertPriority', () => {
    it('should upsert a muscle priority when muscle group exists', async () => {
      mockPrisma.muscleGroup.findUnique.mockResolvedValue({
        id: BigInt(3),
        name: 'Shoulder',
      });
      const mockResult = {
        id: BigInt(1),
        userId: BigInt(1),
        muscleGroupId: BigInt(3),
        priorityLevel: 'high',
        hasImbalance: true,
        notes: 'Left side weaker',
        muscleGroup: { id: BigInt(3), name: 'Shoulder' },
      };
      mockPrisma.userMusclePriority.upsert.mockResolvedValue(mockResult);

      const result = await service.upsertPriority(1, {
        muscleGroupId: 3,
        priorityLevel: PriorityLevel.HIGH,
        hasImbalance: true,
        notes: 'Left side weaker',
      });

      expect(result).toEqual(mockResult);
      expect(mockPrisma.userMusclePriority.upsert).toHaveBeenCalledWith({
        where: {
          userId_muscleGroupId: {
            userId: BigInt(1),
            muscleGroupId: BigInt(3),
          },
        },
        update: {
          priorityLevel: PriorityLevel.HIGH,
          hasImbalance: true,
          notes: 'Left side weaker',
        },
        create: {
          userId: BigInt(1),
          muscleGroupId: BigInt(3),
          priorityLevel: PriorityLevel.HIGH,
          hasImbalance: true,
          notes: 'Left side weaker',
        },
        include: { muscleGroup: true },
      });
    });

    it('should throw NotFoundException when muscle group does not exist', async () => {
      mockPrisma.muscleGroup.findUnique.mockResolvedValue(null);

      await expect(
        service.upsertPriority(1, {
          muscleGroupId: 999,
          priorityLevel: PriorityLevel.HIGH,
        }),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.userMusclePriority.upsert).not.toHaveBeenCalled();
    });

    it('should upsert with only muscleGroupId (no optional fields)', async () => {
      mockPrisma.muscleGroup.findUnique.mockResolvedValue({
        id: BigInt(3),
        name: 'Shoulder',
      });
      mockPrisma.userMusclePriority.upsert.mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(1),
        muscleGroupId: BigInt(3),
        muscleGroup: { id: BigInt(3), name: 'Shoulder' },
      });

      const result = await service.upsertPriority(1, { muscleGroupId: 3 });

      expect(result).toBeDefined();
      expect(mockPrisma.userMusclePriority.upsert).toHaveBeenCalled();
    });
  });

  describe('deletePriority', () => {
    it('should delete priority when it exists for the user', async () => {
      mockPrisma.userMusclePriority.findUnique.mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(1),
        muscleGroupId: BigInt(3),
      });
      mockPrisma.userMusclePriority.delete.mockResolvedValue({});

      await service.deletePriority(1, 3);

      expect(mockPrisma.userMusclePriority.delete).toHaveBeenCalledWith({
        where: {
          userId_muscleGroupId: {
            userId: BigInt(1),
            muscleGroupId: BigInt(3),
          },
        },
      });
    });

    it('should throw NotFoundException when priority does not exist', async () => {
      mockPrisma.userMusclePriority.findUnique.mockResolvedValue(null);

      await expect(service.deletePriority(1, 999)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockPrisma.userMusclePriority.delete).not.toHaveBeenCalled();
    });
  });
});
