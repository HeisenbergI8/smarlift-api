import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto';
export declare class UserProfileService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: number): Promise<{
        heightCm: Prisma.Decimal | null;
        weightKg: Prisma.Decimal | null;
        age: number | null;
        gender: import("@prisma/client").$Enums.UserProfile_gender | null;
        fitnessGoal: import("@prisma/client").$Enums.UserProfile_fitnessGoal | null;
        activityLevel: import("@prisma/client").$Enums.UserProfile_activityLevel | null;
        trainingMethod: import("@prisma/client").$Enums.UserProfile_trainingMethod;
        trainingDaysPerWeek: number;
        id: bigint;
        userId: bigint;
        createdAt: Date;
        updatedAt: Date;
    }>;
    upsertProfile(userId: number, dto: UpdateProfileDto): Promise<{
        heightCm: Prisma.Decimal | null;
        weightKg: Prisma.Decimal | null;
        age: number | null;
        gender: import("@prisma/client").$Enums.UserProfile_gender | null;
        fitnessGoal: import("@prisma/client").$Enums.UserProfile_fitnessGoal | null;
        activityLevel: import("@prisma/client").$Enums.UserProfile_activityLevel | null;
        trainingMethod: import("@prisma/client").$Enums.UserProfile_trainingMethod;
        trainingDaysPerWeek: number;
        id: bigint;
        userId: bigint;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
