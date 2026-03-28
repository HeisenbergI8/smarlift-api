import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { BodyWeightService } from './body-weight.service';
import { LogBodyWeightDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('body-weight')
export class BodyWeightController {
  constructor(private readonly bodyWeightService: BodyWeightService) {}

  @Post()
  logWeight(@CurrentUser('id') userId: number, @Body() dto: LogBodyWeightDto) {
    // TODO: Delegate to bodyWeightService.logWeight()
  }

  @Get()
  getLogs(
    @CurrentUser('id') userId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    // TODO: Delegate to bodyWeightService.getLogs()
  }

  @Get('weekly-averages')
  getWeeklyAverages(
    @CurrentUser('id') userId: number,
    @Query('weeks') weeks: number,
  ) {
    // TODO: Delegate to bodyWeightService.getWeeklyAverages()
  }

  @Get('latest')
  getLatest(@CurrentUser('id') userId: number) {
    // TODO: Delegate to bodyWeightService.getLatest()
  }

  @Delete(':id')
  deleteLog(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) logId: number,
  ) {
    // TODO: Delegate to bodyWeightService.deleteLog()
  }
}
