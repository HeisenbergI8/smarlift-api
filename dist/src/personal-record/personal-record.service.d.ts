import { PrismaService } from '../prisma/prisma.service';
export declare class PersonalRecordService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getUserRecords(userId: number): Promise<void>;
    getRecordsByExercise(userId: number, exerciseId: number): Promise<void>;
    evaluateAndUpdateRecords(userId: number, workoutSetId: number): Promise<void>;
}
