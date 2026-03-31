import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UserProfileService', () => {
  let service: UserProfileService;

  const mockPrisma = {
    userProfile: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserProfileService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UserProfileService>(UserProfileService);
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return the user profile', async () => {
      const mockProfile = {
        userId: BigInt(1),
        heightCm: 180,
        weightKg: 80,
        age: 30,
        gender: 'male',
      };
      mockPrisma.userProfile.findUnique.mockResolvedValue(mockProfile);

      const result = await service.getProfile(1);

      expect(result).toEqual(mockProfile);
      expect(mockPrisma.userProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: BigInt(1) },
      });
    });

    it('should throw NotFoundException when profile does not exist', async () => {
      mockPrisma.userProfile.findUnique.mockResolvedValue(null);

      await expect(service.getProfile(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('upsertProfile', () => {
    it('should upsert and return the profile', async () => {
      const dto = { heightCm: 180, weightKg: 80, age: 30 };
      const mockProfile = { userId: BigInt(1), ...dto };
      mockPrisma.userProfile.upsert.mockResolvedValue(mockProfile);

      const result = await service.upsertProfile(1, dto);

      expect(result).toEqual(mockProfile);
      expect(mockPrisma.userProfile.upsert).toHaveBeenCalledWith({
        where: { userId: BigInt(1) },
        update: dto,
        create: expect.objectContaining({ userId: BigInt(1) }),
      });
    });

    it('should handle partial update with only one field', async () => {
      const dto = { weightKg: 85 };
      const mockProfile = { userId: BigInt(1), weightKg: 85 };
      mockPrisma.userProfile.upsert.mockResolvedValue(mockProfile);

      const result = await service.upsertProfile(1, dto);

      expect(result).toEqual(mockProfile);
    });
  });
});
