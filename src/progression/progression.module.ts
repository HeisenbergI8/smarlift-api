import { Module } from '@nestjs/common';
import { ProgressionController } from './progression.controller';
import { ProgressionService } from './progression.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [ProgressionController],
  providers: [ProgressionService],
  exports: [ProgressionService],
})
export class ProgressionModule {}
