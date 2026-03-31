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
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard, CurrentUser } from '../common';
import { BodyWeightService } from './body-weight.service';
import { LogBodyWeightDto, GetBodyWeightLogsQueryDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('body-weight')
export class BodyWeightController {
  constructor(private readonly bodyWeightService: BodyWeightService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  logWeight(@CurrentUser('id') userId: number, @Body() dto: LogBodyWeightDto) {
    return this.bodyWeightService.logWeight(userId, dto);
  }

  @Get()
  getLogs(
    @CurrentUser('id') userId: number,
    @Query() query: GetBodyWeightLogsQueryDto,
  ) {
    return this.bodyWeightService.getLogs(userId, query);
  }

  @Get('weekly-averages')
  getWeeklyAverages(
    @CurrentUser('id') userId: number,
    @Query('weeks', new DefaultValuePipe(12), ParseIntPipe) weeks: number,
  ) {
    return this.bodyWeightService.getWeeklyAverages(userId, weeks);
  }

  @Get('latest')
  getLatest(@CurrentUser('id') userId: number) {
    return this.bodyWeightService.getLatest(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteLog(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) logId: number,
  ) {
    return this.bodyWeightService.deleteLog(userId, logId);
  }
}
