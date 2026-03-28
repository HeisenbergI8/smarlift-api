import { Module } from '@nestjs/common';
import { MusclePriorityController } from './muscle-priority.controller';
import { MusclePriorityService } from './muscle-priority.service';

@Module({
  controllers: [MusclePriorityController],
  providers: [MusclePriorityService],
  exports: [MusclePriorityService],
})
export class MusclePriorityModule {}
