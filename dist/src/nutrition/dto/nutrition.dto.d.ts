export declare class CreateNutritionRecDto {
    dailyCaloriesKcal: number;
    proteinG: number;
    carbohydratesG: number;
    fatsG: number;
    effectiveFrom: string;
    effectiveTo?: string;
    notes?: string;
}
export declare class LogDailyNutritionDto {
    logDate: string;
    totalCaloriesKcal?: number;
    proteinG?: number;
    carbohydratesG?: number;
    fatsG?: number;
    notes?: string;
}
