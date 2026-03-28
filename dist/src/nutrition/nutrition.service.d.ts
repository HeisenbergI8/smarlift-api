import { PrismaService } from '../prisma/prisma.service';
import { CreateNutritionRecDto, LogDailyNutritionDto } from './dto';
export declare class NutritionService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getActiveRecommendation(userId: number): Promise<void>;
    createRecommendation(userId: number, dto: CreateNutritionRecDto): Promise<void>;
    generateSmartRecommendation(userId: number): Promise<void>;
    logDailyNutrition(userId: number, dto: LogDailyNutritionDto): Promise<void>;
    getDailyLogs(userId: number, startDate: string, endDate: string): Promise<void>;
    getAdjustmentHistory(userId: number): Promise<void>;
    detectPlateauAndAdjust(userId: number): Promise<void>;
}
