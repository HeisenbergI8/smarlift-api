import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Notification_type } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateNotificationPrefsDto } from './dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createNotification(
    userId: number,
    type: Notification_type,
    title: string,
    message: string,
  ): Promise<void> {
    const preference = await this.prisma.notificationPreference.findUnique({
      where: { userId_type: { userId: BigInt(userId), type } },
    });

    if (preference && !preference.isEnabled) {
      return;
    }

    await this.prisma.notification.create({
      data: {
        userId: BigInt(userId),
        type,
        title,
        message,
        isRead: false,
      },
    });

    this.logger.log(
      `Notification created: user=${userId} type=${type} title="${title}"`,
    );
  }

  async getNotifications(userId: number, query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = { userId: BigInt(userId) };

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getUnreadCount(userId: number) {
    const count = await this.prisma.notification.count({
      where: { userId: BigInt(userId), isRead: false },
    });
    return { count };
  }

  async markAsRead(userId: number, notificationId: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: BigInt(notificationId) },
    });
    if (!notification || notification.userId !== BigInt(userId)) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id: BigInt(notificationId) },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: number) {
    const result = await this.prisma.notification.updateMany({
      where: { userId: BigInt(userId), isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { updated: result.count };
  }

  async getPreferences(userId: number) {
    return this.prisma.notificationPreference.findMany({
      where: { userId: BigInt(userId) },
      orderBy: { type: 'asc' },
    });
  }

  async updatePreference(userId: number, dto: UpdateNotificationPrefsDto) {
    const type = dto.type as unknown as Notification_type;
    return this.prisma.notificationPreference.upsert({
      where: { userId_type: { userId: BigInt(userId), type } },
      update: { isEnabled: dto.isEnabled },
      create: { userId: BigInt(userId), type, isEnabled: dto.isEnabled },
    });
  }
}
