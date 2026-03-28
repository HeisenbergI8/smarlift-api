import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkoutLogService } from './workout-log.service';
import { StartSessionDto, LogSetDto, CompleteSessionDto } from './dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('workout-sessions')
export class WorkoutLogController {
  constructor(private readonly workoutLogService: WorkoutLogService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  startSession(
    @CurrentUser('id') userId: number,
    @Body() dto: StartSessionDto,
  ) {
    return this.workoutLogService.startSession(userId, dto);
  }

  @Get()
  getHistory(
    @CurrentUser('id') userId: number,
    @Query() query: PaginationQueryDto,
  ) {
    return this.workoutLogService.getSessionHistory(
      userId,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  @Get(':id')
  getSession(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) sessionId: number,
  ) {
    return this.workoutLogService.getSessionById(userId, sessionId);
  }

  @Post(':id/sets')
  @HttpCode(HttpStatus.CREATED)
  logSet(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) sessionId: number,
    @Body() dto: LogSetDto,
  ) {
    return this.workoutLogService.logSet(userId, sessionId, dto);
  }

  @Patch(':id/complete')
  completeSession(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) sessionId: number,
    @Body() dto: CompleteSessionDto,
  ) {
    return this.workoutLogService.completeSession(userId, sessionId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSession(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) sessionId: number,
  ) {
    return this.workoutLogService.deleteSession(userId, sessionId);
  }
}
