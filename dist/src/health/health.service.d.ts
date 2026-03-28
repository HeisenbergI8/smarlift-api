import { PrismaService } from '../prisma/prisma.service';
type DatabaseHealthResult = {
    connected: boolean;
    database: 'mysql';
    timestamp: string;
    details?: {
        probe: string;
    };
    error?: {
        message: string;
    };
};
export declare class HealthService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    checkDatabase(): Promise<DatabaseHealthResult>;
}
export {};
