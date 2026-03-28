import { NutritionService } from './nutrition.service';
import { CreateNutritionRecDto, LogDailyNutritionDto } from './dto';
export declare class NutritionController {
    private readonly nutritionService;
    constructor(nutritionService: NutritionService);
    getActiveRecommendation(userId: number): void;
    createRecommendation(userId: number, dto: CreateNutritionRecDto): void;
    generateSmartRecommendation(userId: number): void;
    logDailyNutrition(userId: number, dto: LogDailyNutritionDto): void;
    getDailyLogs(userId: number, startDate: string, endDate: string): void;
    getAdjustmentHistory(userId: number): void;
    detectPlateauAndAdjust(userId: number): void;
}
