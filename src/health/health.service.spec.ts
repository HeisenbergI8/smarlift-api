import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

describe('HealthService', () => {
  let service: HealthService;

  const mockPrisma = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    jest.clearAllMocks();
  });

  describe('checkDatabase', () => {
    it('should return connected status when database is reachable', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ result: 1 }]);

      const result = await service.checkDatabase();

      expect(result.connected).toBe(true);
      expect(result.database).toBe('mysql');
      expect(result.timestamp).toBeDefined();
      expect(result.details).toEqual({ probe: 'SELECT 1' });
      expect(result.error).toBeUndefined();
    });

    it('should return disconnected status when database is unreachable', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection refused'));

      const result = await service.checkDatabase();

      expect(result.connected).toBe(false);
      expect(result.database).toBe('mysql');
      expect(result.timestamp).toBeDefined();
      expect(result.error).toEqual({ message: 'Connection refused' });
      expect(result.details).toBeUndefined();
    });

    it('should handle non-Error thrown objects', async () => {
      mockPrisma.$queryRaw.mockRejectedValue('string error');

      const result = await service.checkDatabase();

      expect(result.connected).toBe(false);
      expect(result.error).toEqual({ message: 'Unknown database error' });
    });
  });
});
