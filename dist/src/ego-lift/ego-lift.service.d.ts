import { PrismaService } from '../prisma/prisma.service';
export declare class EgoLiftService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAlerts(userId: number, page: number, limit: number): Promise<void>;
    getAlertsByExercise(userId: number, exerciseId: number): Promise<void>;
    dismissAlert(userId: number, alertId: number): Promise<void>;
    analyzeSet(userId: number, workoutSetId: number): Promise<void>;
}
