import { HealthService } from './health.service';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    checkDatabase(): Promise<{
        connected: boolean;
        database: "mysql";
        timestamp: string;
        details?: {
            probe: string;
        };
        error?: {
            message: string;
        };
    }>;
}
