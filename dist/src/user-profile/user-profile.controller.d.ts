import { UserProfileService } from './user-profile.service';
import { UpdateProfileDto } from './dto';
export declare class UserProfileController {
    private readonly userProfileService;
    constructor(userProfileService: UserProfileService);
    getProfile(userId: number): Promise<{
        heightCm: import("@prisma/client-runtime-utils").Decimal | null;
        weightKg: import("@prisma/client-runtime-utils").Decimal | null;
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
    updateProfile(userId: number, dto: UpdateProfileDto): Promise<{
        heightCm: import("@prisma/client-runtime-utils").Decimal | null;
        weightKg: import("@prisma/client-runtime-utils").Decimal | null;
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
