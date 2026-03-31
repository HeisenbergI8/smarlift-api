import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EquipmentService', () => {
  let service: EquipmentService;

  const mockPrisma = {
    equipment: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    userEquipment: {
      findMany: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn((promises: unknown[]) => Promise.all(promises)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EquipmentService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EquipmentService>(EquipmentService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated equipment list', async () => {
      const mockEquipment = [
        { id: BigInt(1), name: 'Barbell', description: null },
        { id: BigInt(2), name: 'Dumbbell', description: '40 lbs' },
      ];
      mockPrisma.equipment.findMany.mockResolvedValue(mockEquipment);
      mockPrisma.equipment.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result).toEqual({
        data: mockEquipment,
        total: 2,
        page: 1,
        limit: 20,
      });
      expect(mockPrisma.equipment.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        orderBy: { name: 'asc' },
      });
    });

    it('should return empty data when no equipment exists', async () => {
      mockPrisma.equipment.findMany.mockResolvedValue([]);
      mockPrisma.equipment.count.mockResolvedValue(0);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    });

    it('should use default page and limit when not provided', async () => {
      mockPrisma.equipment.findMany.mockResolvedValue([]);
      mockPrisma.equipment.count.mockResolvedValue(0);

      const result = await service.findAll({});

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    });

    it('should calculate correct skip for page 2', async () => {
      mockPrisma.equipment.findMany.mockResolvedValue([]);
      mockPrisma.equipment.count.mockResolvedValue(25);

      await service.findAll({ page: 2, limit: 10 });

      expect(mockPrisma.equipment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });
  });

  describe('getUserEquipment', () => {
    it('should return paginated user equipment with included equipment', async () => {
      const mockData = [
        {
          id: BigInt(1),
          userId: BigInt(1),
          equipmentId: BigInt(1),
          equipment: { id: BigInt(1), name: 'Barbell' },
        },
      ];
      mockPrisma.userEquipment.findMany.mockResolvedValue(mockData);
      mockPrisma.userEquipment.count.mockResolvedValue(1);

      const result = await service.getUserEquipment(1, {
        page: 1,
        limit: 20,
      });

      expect(result).toEqual({
        data: mockData,
        total: 1,
        page: 1,
        limit: 20,
      });
      expect(mockPrisma.userEquipment.findMany).toHaveBeenCalledWith({
        where: { userId: BigInt(1) },
        include: { equipment: true },
        skip: 0,
        take: 20,
        orderBy: { equipment: { name: 'asc' } },
      });
    });

    it('should return empty data when user has no equipment', async () => {
      mockPrisma.userEquipment.findMany.mockResolvedValue([]);
      mockPrisma.userEquipment.count.mockResolvedValue(0);

      const result = await service.getUserEquipment(1, {
        page: 1,
        limit: 20,
      });

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    });
  });

  describe('syncUserEquipment', () => {
    it('should delete existing and create new user equipment', async () => {
      mockPrisma.equipment.findMany.mockResolvedValue([
        { id: BigInt(1) },
        { id: BigInt(2) },
      ]);
      mockPrisma.userEquipment.deleteMany.mockResolvedValue({ count: 1 });
      mockPrisma.userEquipment.createMany.mockResolvedValue({ count: 2 });
      // getUserEquipment call after sync
      mockPrisma.userEquipment.findMany.mockResolvedValue([
        {
          id: BigInt(1),
          userId: BigInt(1),
          equipmentId: BigInt(1),
          equipment: { id: BigInt(1), name: 'Barbell' },
        },
        {
          id: BigInt(2),
          userId: BigInt(1),
          equipmentId: BigInt(2),
          equipment: { id: BigInt(2), name: 'Dumbbell' },
        },
      ]);
      mockPrisma.userEquipment.count.mockResolvedValue(2);

      const result = await service.syncUserEquipment(1, {
        equipmentIds: [1, 2],
      });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should throw BadRequestException when invalid equipment IDs provided', async () => {
      mockPrisma.equipment.findMany.mockResolvedValue([{ id: BigInt(1) }]);

      await expect(
        service.syncUserEquipment(1, { equipmentIds: [1, 99] }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('create', () => {
    it('should create equipment with valid data', async () => {
      const mockCreated = {
        id: BigInt(1),
        name: 'Kettlebell',
        description: '16kg',
        createdAt: new Date(),
      };
      mockPrisma.equipment.create.mockResolvedValue(mockCreated);

      const result = await service.create({
        name: 'Kettlebell',
        description: '16kg',
      });

      expect(result).toEqual(mockCreated);
      expect(mockPrisma.equipment.create).toHaveBeenCalledWith({
        data: { name: 'Kettlebell', description: '16kg' },
      });
    });

    it('should throw ConflictException on duplicate name', async () => {
      mockPrisma.equipment.create.mockRejectedValue({ code: 'P2002' });

      await expect(service.create({ name: 'Barbell' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('should rethrow non-P2002 errors', async () => {
      mockPrisma.equipment.create.mockRejectedValue(
        new Error('Connection lost'),
      );

      await expect(service.create({ name: 'Barbell' })).rejects.toThrow(
        'Connection lost',
      );
    });
  });

  describe('update', () => {
    it('should update equipment when found', async () => {
      const mockEquipment = {
        id: BigInt(1),
        name: 'Barbell',
        description: null,
      };
      mockPrisma.equipment.findUnique.mockResolvedValue(mockEquipment);
      const updated = { ...mockEquipment, description: 'Olympic barbell' };
      mockPrisma.equipment.update.mockResolvedValue(updated);

      const result = await service.update(1, {
        description: 'Olympic barbell',
      });

      expect(result).toEqual(updated);
      expect(mockPrisma.equipment.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: { description: 'Olympic barbell' },
      });
    });

    it('should throw NotFoundException when equipment not found', async () => {
      mockPrisma.equipment.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { name: 'New Name' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException on duplicate name during update', async () => {
      mockPrisma.equipment.findUnique.mockResolvedValue({
        id: BigInt(1),
        name: 'Barbell',
      });
      mockPrisma.equipment.update.mockRejectedValue({ code: 'P2002' });

      await expect(service.update(1, { name: 'Dumbbell' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should delete equipment when found', async () => {
      mockPrisma.equipment.findUnique.mockResolvedValue({
        id: BigInt(1),
        name: 'Barbell',
      });
      mockPrisma.equipment.delete.mockResolvedValue({});

      await service.remove(1);

      expect(mockPrisma.equipment.delete).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
      });
    });

    it('should throw NotFoundException when equipment not found', async () => {
      mockPrisma.equipment.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
