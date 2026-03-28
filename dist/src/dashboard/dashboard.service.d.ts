import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getOverview(userId: number): Promise<void>;
    getStrengthProgress(userId: number): Promise<void>;
    getWeightTrend(userId: number, period: string): Promise<void>;
    getWorkoutConsistency(userId: number, weeks: number): Promise<void>;
    getNutritionAdherence(userId: number, days: number): Promise<void>;
    getKpiSnapshots(userId: number, startDate: string, endDate: string): Promise<void>;
    createKpiSnapshot(userId: number): Promise<void>;
}
