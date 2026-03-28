import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getOverview(userId: number): void;
    getStrengthProgress(userId: number): void;
    getWeightTrend(userId: number, period: string): void;
    getWorkoutConsistency(userId: number, weeks: number): void;
    getNutritionAdherence(userId: number, days: number): void;
    getKpiSnapshots(userId: number, startDate: string, endDate: string): void;
    createKpiSnapshot(userId: number): void;
}
