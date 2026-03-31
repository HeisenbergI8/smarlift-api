import { Module } from '@nestjs/common';
import { WorkoutLogController } from './workout-log.controller';
import { WorkoutLogService } from './workout-log.service';
import { PersonalRecordModule } from '../personal-record/personal-record.module';
import { EgoLiftModule } from '../ego-lift/ego-lift.module';
import { MilestoneModule } from '../milestone/milestone.module';

@Module({
  imports: [PersonalRecordModule, EgoLiftModule, MilestoneModule],
  controllers: [WorkoutLogController],
  providers: [WorkoutLogService],
  exports: [WorkoutLogService],
})
export class WorkoutLogModule {}
