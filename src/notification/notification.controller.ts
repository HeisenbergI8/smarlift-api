import {
  Controller,
  Get,
  Patch,
  Put,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { UpdateNotificationPrefsDto } from './dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard, CurrentUser } from '../common';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  getNotifications(
    @CurrentUser('id') userId: number,
    @Query() query: PaginationQueryDto,
  ) {
    return this.notificationService.getNotifications(userId, query);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser('id') userId: number) {
    return this.notificationService.getUnreadCount(userId);
  }

  @Patch(':id/read')
  markAsRead(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) notificationId: number,
  ) {
    return this.notificationService.markAsRead(userId, notificationId);
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser('id') userId: number) {
    return this.notificationService.markAllAsRead(userId);
  }

  @Get('preferences')
  getPreferences(@CurrentUser('id') userId: number) {
    return this.notificationService.getPreferences(userId);
  }

  @Put('preferences')
  updatePreference(
    @CurrentUser('id') userId: number,
    @Body() dto: UpdateNotificationPrefsDto,
  ) {
    return this.notificationService.updatePreference(userId, dto);
  }
}
