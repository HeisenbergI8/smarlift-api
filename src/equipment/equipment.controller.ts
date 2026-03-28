import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Put,
  Body,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import {
  SyncEquipmentDto,
  FindEquipmentQueryDto,
  CreateEquipmentDto,
  UpdateEquipmentDto,
} from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../common';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  findAll(@Query() query: FindEquipmentQueryDto) {
    return this.equipmentService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getUserEquipment(
    @CurrentUser('id') userId: number,
    @Query() query: FindEquipmentQueryDto,
  ) {
    return this.equipmentService.getUserEquipment(userId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  syncUserEquipment(
    @CurrentUser('id') userId: number,
    @Body() dto: SyncEquipmentDto,
  ) {
    return this.equipmentService.syncUserEquipment(userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateEquipmentDto) {
    return this.equipmentService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEquipmentDto,
  ) {
    return this.equipmentService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.equipmentService.remove(id);
  }
}
