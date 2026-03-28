import { PersonalRecordService } from './personal-record.service';
export declare class PersonalRecordController {
    private readonly personalRecordService;
    constructor(personalRecordService: PersonalRecordService);
    getUserRecords(userId: number): void;
    getRecordsByExercise(userId: number, exerciseId: number): void;
}
