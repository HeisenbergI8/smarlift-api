import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { MuscleGroupService } from './muscle-group.service';
import { PrismaService } from '../prisma/prisma.service';
import { BodyRegion } from './dto/muscle-group.dto';

describe('MuscleGroupService', () => {
  let service: MuscleGroupService;

  const mockPrisma = {
    muscleGroup: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MuscleGroupService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MuscleGroupService>(MuscleGroupService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated muscle groups', async () => {
      const mockGroups = [
        {
          id: BigInt(1),
          name: 'Chest',
          bodyRegion: 'upper_body',
          createdAt: new Date(),
        },
        {
          id: BigInt(2),
          name: 'Quads',
          bodyRegion: 'lower_body',
          createdAt: new Date(),
        },
      ];
      mockPrisma.muscleGroup.findMany.mockResolvedValue(mockGroups);
      mockPrisma.muscleGroup.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result).toEqual({
        data: mockGroups,
        total: 2,
        page: 1,
        limit: 20,
      });
      expect(mockPrisma.muscleGroup.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
        orderBy: { name: 'asc' },
      });
    });

    it('should filter by bodyRegion when provided', async () => {
      mockPrisma.muscleGroup.findMany.mockResolvedValue([]);
      mockPrisma.muscleGroup.count.mockResolvedValue(0);

      await service.findAll({
        bodyRegion: BodyRegion.UPPER_BODY,
        page: 1,
        limit: 20,
      });

      expect(mockPrisma.muscleGroup.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { bodyRegion: BodyRegion.UPPER_BODY },
        }),
      );
    });

    it('should return empty data when no muscle groups exist', async () => {
      mockPrisma.muscleGroup.findMany.mockResolvedValue([]);
      mockPrisma.muscleGroup.count.mockResolvedValue(0);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    });

    it('should use default page and limit when not provided', async () => {
      mockPrisma.muscleGroup.findMany.mockResolvedValue([]);
      mockPrisma.muscleGroup.count.mockResolvedValue(0);

      const result = await service.findAll({});

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    });

    it('should calculate correct skip for page 2', async () => {
      mockPrisma.muscleGroup.findMany.mockResolvedValue([]);
      mockPrisma.muscleGroup.count.mockResolvedValue(25);

      await service.findAll({ page: 2, limit: 10 });

      expect(mockPrisma.muscleGroup.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });
  });

  describe('create', () => {
    it('should create a muscle group with valid data', async () => {
      const mockCreated = {
        id: BigInt(1),
        name: 'Chest',
        bodyRegion: 'upper_body',
        createdAt: new Date(),
      };
      mockPrisma.muscleGroup.create.mockResolvedValue(mockCreated);

      const result = await service.create({
        name: 'Chest',
        bodyRegion: BodyRegion.UPPER_BODY,
      });

      expect(result).toEqual(mockCreated);
      expect(mockPrisma.muscleGroup.create).toHaveBeenCalledWith({
        data: { name: 'Chest', bodyRegion: BodyRegion.UPPER_BODY },
      });
    });

    it('should throw ConflictException on duplicate name', async () => {
      mockPrisma.muscleGroup.create.mockRejectedValue({ code: 'P2002' });

      await expect(
        service.create({ name: 'Chest', bodyRegion: BodyRegion.UPPER_BODY }),
      ).rejects.toThrow(ConflictException);
    });

    it('should rethrow non-P2002 errors', async () => {
      mockPrisma.muscleGroup.create.mockRejectedValue(
        new Error('Connection lost'),
      );

      await expect(
        service.create({ name: 'Chest', bodyRegion: BodyRegion.UPPER_BODY }),
      ).rejects.toThrow('Connection lost');
    });
  });

  describe('update', () => {
    it('should update muscle group when found', async () => {
      mockPrisma.muscleGroup.findUnique.mockResolvedValue({
        id: BigInt(1),
        name: 'Chest',
        bodyRegion: 'upper_body',
      });
      const updated = {
        id: BigInt(1),
        name: 'Upper Chest',
        bodyRegion: 'upper_body',
      };
      mockPrisma.muscleGroup.update.mockResolvedValue(updated);

      const result = await service.update(1, { name: 'Upper Chest' });

      expect(result).toEqual(updated);
      expect(mockPrisma.muscleGroup.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: { name: 'Upper Chest' },
      });
    });

    it('should throw NotFoundException when muscle group not found', async () => {
      mockPrisma.muscleGroup.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { name: 'New Name' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException on duplicate name during update', async () => {
      mockPrisma.muscleGroup.findUnique.mockResolvedValue({
        id: BigInt(1),
        name: 'Chest',
      });
      mockPrisma.muscleGroup.update.mockRejectedValue({ code: 'P2002' });

      await expect(service.update(1, { name: 'Quads' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should delete muscle group when found', async () => {
      mockPrisma.muscleGroup.findUnique.mockResolvedValue({
        id: BigInt(1),
        name: 'Chest',
      });
      mockPrisma.muscleGroup.delete.mockResolvedValue({});

      await service.remove(1);

      expect(mockPrisma.muscleGroup.delete).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
      });
    });

    it('should throw NotFoundException when muscle group not found', async () => {
      mockPrisma.muscleGroup.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
