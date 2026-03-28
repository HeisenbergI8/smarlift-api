import { Module } from '@nestjs/common';
import { WorkoutLogController } from './workout-log.controller';
import { WorkoutLogService } from './workout-log.service';

@Module({
  controllers: [WorkoutLogController],
  providers: [WorkoutLogService],
  exports: [WorkoutLogService],
})
export class WorkoutLogModule {}
