import { BodyWeightService } from './body-weight.service';
import { LogBodyWeightDto } from './dto';
export declare class BodyWeightController {
    private readonly bodyWeightService;
    constructor(bodyWeightService: BodyWeightService);
    logWeight(userId: number, dto: LogBodyWeightDto): void;
    getLogs(userId: number, startDate: string, endDate: string): void;
    getWeeklyAverages(userId: number, weeks: number): void;
    getLatest(userId: number): void;
    deleteLog(userId: number, logId: number): void;
}
