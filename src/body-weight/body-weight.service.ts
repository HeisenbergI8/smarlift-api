import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Prisma, BodyWeightLog } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LogBodyWeightDto, GetBodyWeightLogsQueryDto } from './dto';
import {
  BodyWeightLogResponse,
  WeeklyAverageResponse,
  PaginatedBodyWeightLogsResponse,
} from './interfaces';

@Injectable()
export class BodyWeightService {
  private readonly logger = new Logger(BodyWeightService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logWeight(
    userId: number,
    dto: LogBodyWeightDto,
  ): Promise<BodyWeightLogResponse> {
    const logDate = new Date(dto.logDate);
    const source = dto.source ?? 'manual';

    const record = await this.prisma.bodyWeightLog.upsert({
      where: {
        userId_logDate: { userId: BigInt(userId), logDate },
      },
      update: { weightKg: dto.weightKg, source },
      create: {
        userId: BigInt(userId),
        logDate,
        weightKg: dto.weightKg,
        source,
      },
    });

    return this.mapLog(record);
  }

  async getLogs(
    userId: number,
    query: GetBodyWeightLogsQueryDto,
  ): Promise<PaginatedBodyWeightLogsResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.BodyWeightLogWhereInput = {
      userId: BigInt(userId),
    };

    if (query.startDate || query.endDate) {
      where.logDate = {};
      if (query.startDate) {
        where.logDate.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.logDate.lte = new Date(query.endDate);
      }
    }

    const [raw, total] = await Promise.all([
      this.prisma.bodyWeightLog.findMany({
        where,
        orderBy: { logDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.bodyWeightLog.count({ where }),
    ]);

    return { data: raw.map((r) => this.mapLog(r)), total, page, limit };
  }

  async getWeeklyAverages(
    userId: number,
    weeks: number = 12,
  ): Promise<WeeklyAverageResponse[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);

    const logs = await this.prisma.bodyWeightLog.findMany({
      where: {
        userId: BigInt(userId),
        logDate: { gte: startDate },
      },
      orderBy: { logDate: 'asc' },
    });

    return this.groupLogsByWeek(logs);
  }

  private groupLogsByWeek(logs: BodyWeightLog[]): WeeklyAverageResponse[] {
    const weekMap = new Map<
      string,
      { weekStart: Date; totalWeight: number; count: number }
    >();

    for (const log of logs) {
      const weekStart = this.getMonday(new Date(log.logDate));
      const key = weekStart.toISOString().slice(0, 10);

      const existing = weekMap.get(key) ?? {
        weekStart,
        totalWeight: 0,
        count: 0,
      };
      existing.totalWeight += Number(log.weightKg);
      existing.count += 1;
      weekMap.set(key, existing);
    }

    return Array.from(weekMap.values())
      .map((w) => ({
        weekStart: w.weekStart,
        avgWeightKg: parseFloat((w.totalWeight / w.count).toFixed(1)),
        entryCount: w.count,
      }))
      .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
  }

  private getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  async getLatest(userId: number): Promise<BodyWeightLogResponse | null> {
    const record = await this.prisma.bodyWeightLog.findFirst({
      where: { userId: BigInt(userId) },
      orderBy: { logDate: 'desc' },
    });

    return record ? this.mapLog(record) : null;
  }

  async deleteLog(userId: number, logId: number): Promise<{ message: string }> {
    const log = await this.prisma.bodyWeightLog.findUnique({
      where: { id: BigInt(logId) },
    });
    if (!log || log.userId !== BigInt(userId)) {
      throw new NotFoundException('Body weight log not found');
    }

    await this.prisma.bodyWeightLog.delete({
      where: { id: BigInt(logId) },
    });

    return { message: 'Log deleted' };
  }

  private mapLog(raw: BodyWeightLog): BodyWeightLogResponse {
    return {
      id: Number(raw.id),
      userId: Number(raw.userId),
      logDate: raw.logDate,
      weightKg: parseFloat(raw.weightKg.toString()),
      source: raw.source,
      createdAt: raw.createdAt,
    };
  }
}
