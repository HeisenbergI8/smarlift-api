import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogBodyWeightDto } from './dto';

@Injectable()
export class BodyWeightService {
  constructor(private readonly prisma: PrismaService) {}

  async logWeight(userId: number, dto: LogBodyWeightDto) {
    // TODO: Upsert body weight log by userId + logDate
    // TODO: Return created/updated log
  }

  async getLogs(userId: number, startDate: string, endDate: string) {
    // TODO: Return body weight logs within date range
    // TODO: Order by logDate asc
  }

  async getWeeklyAverages(userId: number, weeks: number) {
    // TODO: Fetch logs for the last N weeks
    // TODO: Group by week and calculate averages
    // TODO: Return array of { week, avgWeightKg }
  }

  async getLatest(userId: number) {
    // TODO: Return most recent body weight log
  }

  async deleteLog(userId: number, logId: number) {
    // TODO: Verify log belongs to user
    // TODO: Delete log
  }
}
