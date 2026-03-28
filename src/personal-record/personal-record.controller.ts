import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { PersonalRecordService } from './personal-record.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('personal-records')
export class PersonalRecordController {
  constructor(private readonly personalRecordService: PersonalRecordService) {}

  @Get()
  getUserRecords(@CurrentUser('id') userId: number) {
    // TODO: Delegate to personalRecordService.getUserRecords()
  }

  @Get('exercise/:exerciseId')
  getRecordsByExercise(
    @CurrentUser('id') userId: number,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
  ) {
    // TODO: Delegate to personalRecordService.getRecordsByExercise()
  }
}
