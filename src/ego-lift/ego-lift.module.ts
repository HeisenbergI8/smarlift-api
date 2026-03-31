import { Module } from '@nestjs/common';
import { EgoLiftController } from './ego-lift.controller';
import { EgoLiftService } from './ego-lift.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [EgoLiftController],
  providers: [EgoLiftService],
  exports: [EgoLiftService],
})
export class EgoLiftModule {}
