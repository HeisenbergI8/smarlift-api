import { PrismaService } from '../prisma/prisma.service';
import { UpdateProgressionSettingsDto } from './dto';
export declare class ProgressionService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSettings(userId: number): Promise<void>;
    upsertSettings(userId: number, dto: UpdateProgressionSettingsDto): Promise<void>;
    getHistory(userId: number, page: number, limit: number): Promise<void>;
    getHistoryByExercise(userId: number, exerciseId: number): Promise<void>;
    evaluateProgression(userId: number): Promise<void>;
}
