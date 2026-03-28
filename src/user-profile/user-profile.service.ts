import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto';

@Injectable()
export class UserProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: number) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId: BigInt(userId) },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  async upsertProfile(userId: number, dto: UpdateProfileDto) {
    const bigUserId = BigInt(userId);
    const data = dto as unknown as Prisma.UserProfileUpdateInput;
    return this.prisma.userProfile.upsert({
      where: { userId: bigUserId },
      update: data,
      create: {
        userId: bigUserId,
        ...dto,
      } as unknown as Prisma.UserProfileUncheckedCreateInput,
    });
  }
}
