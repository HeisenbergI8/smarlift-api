import { MilestoneService } from './milestone.service';
export declare class MilestoneController {
    private readonly milestoneService;
    constructor(milestoneService: MilestoneService);
    getAllMilestones(): void;
    getUserMilestones(userId: number): void;
    checkAndAward(userId: number): void;
}
