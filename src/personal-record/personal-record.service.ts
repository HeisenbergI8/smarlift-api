import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PersonalRecordService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserRecords(userId: number) {
    // TODO: Return all personal records for user
    // TODO: Include exercise details
    // TODO: Order by exercise name
  }

  async getRecordsByExercise(userId: number, exerciseId: number) {
    // TODO: Return personal records for a specific exercise
    // TODO: Include all record types (max_weight, max_reps, max_volume)
  }

  async evaluateAndUpdateRecords(userId: number, workoutSetId: number) {
    // TODO: Fetch the logged set details
    // TODO: Compare against existing personal records
    // TODO: If new PR detected, upsert personal_record
    // TODO: Return list of new PRs or empty array
  }
}
