import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Prisma, UserProfile } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto';
import { UserProfileResponse } from './interfaces';

@Injectable()
export class UserProfileService {
  private readonly logger = new Logger(UserProfileService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: number): Promise<UserProfileResponse> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId: BigInt(userId) },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return this.toResponse(profile);
  }

  async upsertProfile(
    userId: number,
    dto: UpdateProfileDto,
  ): Promise<UserProfileResponse> {
    const bigUserId = BigInt(userId);
    const data = dto as unknown as Prisma.UserProfileUpdateInput;
    const profile = await this.prisma.userProfile.upsert({
      where: { userId: bigUserId },
      update: data,
      create: {
        userId: bigUserId,
        ...dto,
      } as unknown as Prisma.UserProfileUncheckedCreateInput,
    });
    return this.toResponse(profile);
  }

  private toResponse(profile: UserProfile): UserProfileResponse {
    return {
      id: Number(profile.id),
      userId: Number(profile.userId),
      heightCm: profile.heightCm !== null ? Number(profile.heightCm) : null,
      weightKg: profile.weightKg !== null ? Number(profile.weightKg) : null,
      age: profile.age,
      gender: profile.gender,
      fitnessGoal: profile.fitnessGoal,
      activityLevel: profile.activityLevel,
      trainingMethod: profile.trainingMethod,
      trainingDaysPerWeek: profile.trainingDaysPerWeek,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
