import { ProgressionService } from './progression.service';
import { UpdateProgressionSettingsDto } from './dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
export declare class ProgressionController {
    private readonly progressionService;
    constructor(progressionService: ProgressionService);
    getSettings(userId: number): void;
    updateSettings(userId: number, dto: UpdateProgressionSettingsDto): void;
    getHistory(userId: number, query: PaginationQueryDto): void;
    getHistoryByExercise(userId: number, exerciseId: number): void;
    evaluateProgression(userId: number): void;
}
