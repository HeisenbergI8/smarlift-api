import { PrismaService } from '../prisma/prisma.service';
import { LogBodyWeightDto } from './dto';
export declare class BodyWeightService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    logWeight(userId: number, dto: LogBodyWeightDto): Promise<void>;
    getLogs(userId: number, startDate: string, endDate: string): Promise<void>;
    getWeeklyAverages(userId: number, weeks: number): Promise<void>;
    getLatest(userId: number): Promise<void>;
    deleteLog(userId: number, logId: number): Promise<void>;
}
