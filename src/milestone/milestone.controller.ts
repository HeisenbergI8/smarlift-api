import {
  Controller,
  Get,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MilestoneService } from './milestone.service';
import { JwtAuthGuard, CurrentUser } from '../common';

@UseGuards(JwtAuthGuard)
@Controller('milestones')
export class MilestoneController {
  constructor(private readonly milestoneService: MilestoneService) {}

  @Get()
  getAllMilestones() {
    return this.milestoneService.getAllMilestones();
  }

  @Get('me')
  getUserMilestones(@CurrentUser('id') userId: number) {
    return this.milestoneService.getUserMilestones(userId);
  }

  @Post('check')
  @HttpCode(HttpStatus.OK)
  checkAndAward(@CurrentUser('id') userId: number) {
    return this.milestoneService.checkAndAwardMilestones(userId);
  }
}
