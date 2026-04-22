import { Milestone_category } from '@prisma/client';

export interface MilestoneResponse {
  id: number;
  name: string;
  description: string | null;
  category: Milestone_category;
  iconUrl: string | null;
  createdAt: Date;
}

export interface UserMilestoneResponse {
  id: number;
  userId: number;
  milestoneId: number;
  achievedAt: Date;
  milestone: MilestoneResponse;
}
