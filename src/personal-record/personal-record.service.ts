import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkoutSetInput } from './interfaces';

@Injectable()
export class PersonalRecordService {
  private readonly logger = new Logger(PersonalRecordService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getUserRecords(userId: number) {
    return this.prisma.personalRecord.findMany({
      where: { userId: BigInt(userId) },
      include: { exercise: true },
      orderBy: [{ exercise: { name: 'asc' } }, { recordType: 'asc' }],
    });
  }

  async getRecordsByExercise(userId: number, exerciseId: number) {
    return this.prisma.personalRecord.findMany({
      where: {
        userId: BigInt(userId),
        exerciseId: BigInt(exerciseId),
      },
      include: { exercise: true },
      orderBy: { recordType: 'asc' },
    });
  }

  async evaluateAndUpdateRecords(
    userId: number,
    set: WorkoutSetInput,
  ): Promise<void> {
    const candidates = this.buildCandidates(set);

    for (const { recordType, candidateValue } of candidates) {
      await this.upsertIfNewRecord(
        userId,
        set.exerciseId,
        recordType,
        candidateValue,
        set.id,
        set.performedAt,
      );
    }
  }

  private buildCandidates(set: WorkoutSetInput): {
    recordType: 'max_weight' | 'max_reps' | 'max_volume';
    candidateValue: number;
  }[] {
    const candidates: {
      recordType: 'max_weight' | 'max_reps' | 'max_volume';
      candidateValue: number;
    }[] = [];

    candidates.push({ recordType: 'max_reps', candidateValue: set.reps });

    if (set.weightKg !== null) {
      const weight = Number(set.weightKg);
      candidates.push({ recordType: 'max_weight', candidateValue: weight });
      candidates.push({
        recordType: 'max_volume',
        candidateValue: set.reps * weight,
      });
    }

    return candidates;
  }

  private async upsertIfNewRecord(
    userId: number,
    exerciseId: bigint,
    recordType: 'max_weight' | 'max_reps' | 'max_volume',
    candidateValue: number,
    workoutSetId: bigint,
    achievedAt: Date,
  ): Promise<void> {
    const existing = await this.prisma.personalRecord.findUnique({
      where: {
        userId_exerciseId_recordType: {
          userId: BigInt(userId),
          exerciseId,
          recordType,
        },
      },
    });

    if (existing && Number(existing.value) >= candidateValue) {
      return;
    }

    await this.prisma.personalRecord.upsert({
      where: {
        userId_exerciseId_recordType: {
          userId: BigInt(userId),
          exerciseId,
          recordType,
        },
      },
      create: {
        userId: BigInt(userId),
        exerciseId,
        recordType,
        value: candidateValue,
        workoutSetId,
        achievedAt,
      },
      update: {
        value: candidateValue,
        workoutSetId,
        achievedAt,
      },
    });

    this.logger.log(
      `New PR: user=${userId} exercise=${exerciseId} type=${recordType} value=${candidateValue}`,
    );
  }
}
