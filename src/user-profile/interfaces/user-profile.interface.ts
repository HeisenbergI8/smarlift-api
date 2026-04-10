import {
  UserProfile_gender,
  UserProfile_fitnessGoal,
  UserProfile_activityLevel,
  UserProfile_trainingMethod,
} from '@prisma/client';

export interface UserProfileResponse {
  id: number;
  userId: number;
  heightCm: number | null;
  weightKg: number | null;
  age: number | null;
  gender: UserProfile_gender | null;
  fitnessGoal: UserProfile_fitnessGoal | null;
  activityLevel: UserProfile_activityLevel | null;
  trainingMethod: UserProfile_trainingMethod;
  trainingDaysPerWeek: number;
  createdAt: Date;
  updatedAt: Date;
}
