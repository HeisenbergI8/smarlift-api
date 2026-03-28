import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type DatabaseHealthResult = {
  connected: boolean;
  database: 'mysql';
  timestamp: string;
  details?: {
    probe: string;
  };
  error?: {
    message: string;
  };
};

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async checkDatabase(): Promise<DatabaseHealthResult> {
    try {
      await this.prisma.$queryRaw(Prisma.sql`SELECT 1 AS result`);

      return {
        connected: true,
        database: 'mysql',
        timestamp: new Date().toISOString(),
        details: {
          probe: 'SELECT 1',
        },
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown database error';

      return {
        connected: false,
        database: 'mysql',
        timestamp: new Date().toISOString(),
        error: { message },
      };
    }
  }
}
