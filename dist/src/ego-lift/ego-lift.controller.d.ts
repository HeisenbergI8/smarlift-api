import { EgoLiftService } from './ego-lift.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
export declare class EgoLiftController {
    private readonly egoLiftService;
    constructor(egoLiftService: EgoLiftService);
    getAlerts(userId: number, query: PaginationQueryDto): void;
    getAlertsByExercise(userId: number, exerciseId: number): void;
    dismissAlert(userId: number, alertId: number): void;
}
