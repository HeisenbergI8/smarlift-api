import { Module } from '@nestjs/common';
import { EgoLiftController } from './ego-lift.controller';
import { EgoLiftService } from './ego-lift.service';

@Module({
  controllers: [EgoLiftController],
  providers: [EgoLiftService],
  exports: [EgoLiftService],
})
export class EgoLiftModule {}
