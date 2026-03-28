import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkoutPlanService } from './workout-plan.service';
import { CreateWorkoutPlanDto, UpdateWorkoutPlanDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('workout-plans')
export class WorkoutPlanController {
  constructor(private readonly workoutPlanService: WorkoutPlanService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser('id') userId: number, @Body() dto: CreateWorkoutPlanDto) {
    return this.workoutPlanService.create(userId, dto);
  }

  @Get()
  findAll(@CurrentUser('id') userId: number) {
    return this.workoutPlanService.findAllByUser(userId);
  }

  @Get('active')
  getActivePlan(@CurrentUser('id') userId: number) {
    return this.workoutPlanService.getActivePlan(userId);
  }

  @Get(':id')
  findOne(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) planId: number,
  ) {
    return this.workoutPlanService.findOne(userId, planId);
  }

  @Put(':id')
  update(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) planId: number,
    @Body() dto: UpdateWorkoutPlanDto,
  ) {
    return this.workoutPlanService.update(userId, planId, dto);
  }

  @Patch(':id/activate')
  activate(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) planId: number,
  ) {
    return this.workoutPlanService.activate(userId, planId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) planId: number,
  ) {
    return this.workoutPlanService.remove(userId, planId);
  }
}
