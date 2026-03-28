import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EgoLiftService {
  constructor(private readonly prisma: PrismaService) {}

  async getAlerts(userId: number, page: number, limit: number) {
    // TODO: Return paginated ego-lift alerts for user
    // TODO: Include exercise details
    // TODO: Order by createdAt desc
  }

  async getAlertsByExercise(userId: number, exerciseId: number) {
    // TODO: Return ego-lift alerts for a specific exercise
  }

  async dismissAlert(userId: number, alertId: number) {
    // TODO: Verify alert belongs to user
    // TODO: Set is_dismissed = true
    // TODO: Return updated alert
  }

  async analyzeSet(userId: number, workoutSetId: number) {
    // TODO: Fetch the logged set and user's training goal
    // TODO: Compare weight/reps against previous sets for the same exercise
    // TODO: Detect if weight increase is disproportionate to rep decrease
    // TODO: If ego-lift detected, create ego_lift_alert record
    // TODO: Return alert or null
  }
}
