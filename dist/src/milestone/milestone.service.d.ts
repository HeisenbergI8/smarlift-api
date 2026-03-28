import { PrismaService } from '../prisma/prisma.service';
export declare class MilestoneService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAllMilestones(): Promise<void>;
    getUserMilestones(userId: number): Promise<void>;
    checkAndAwardMilestones(userId: number): Promise<void>;
}
