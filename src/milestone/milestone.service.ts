import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MilestoneService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllMilestones() {
    // TODO: Return all milestone definitions
    // TODO: Order by category, name
  }

  async getUserMilestones(userId: number) {
    // TODO: Return milestones earned by user
    // TODO: Include milestone details
    // TODO: Order by achievedAt desc
  }

  async checkAndAwardMilestones(userId: number) {
    // TODO: Evaluate user's stats against milestone criteria
    // TODO: Award any newly earned milestones
    // TODO: Return list of newly awarded milestones
  }
}
