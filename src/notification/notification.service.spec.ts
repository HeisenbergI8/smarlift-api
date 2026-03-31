import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { Notification_type } from '@prisma/client';
import { NotificationType } from './dto/notification.dto';

describe('NotificationService', () => {
  let service: NotificationService;

  const mockPrisma = {
    notification: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    notificationPreference: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create a notification when no preference exists', async () => {
      mockPrisma.notificationPreference.findUnique.mockResolvedValue(null);
      mockPrisma.notification.create.mockResolvedValue({});

      await service.createNotification(
        1,
        Notification_type.milestone,
        'Test Title',
        'Test message',
      );

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: BigInt(1),
          type: Notification_type.milestone,
          title: 'Test Title',
          message: 'Test message',
          isRead: false,
        },
      });
    });

    it('should create a notification when preference is enabled', async () => {
      mockPrisma.notificationPreference.findUnique.mockResolvedValue({
        isEnabled: true,
      });
      mockPrisma.notification.create.mockResolvedValue({});

      await service.createNotification(
        1,
        Notification_type.ego_lift_warning,
        'Warning',
        'Ego lift detected',
      );

      expect(mockPrisma.notification.create).toHaveBeenCalled();
    });

    it('should skip notification when preference is disabled', async () => {
      mockPrisma.notificationPreference.findUnique.mockResolvedValue({
        isEnabled: false,
      });

      await service.createNotification(
        1,
        Notification_type.ego_lift_warning,
        'Warning',
        'Ego lift detected',
      );

      expect(mockPrisma.notification.create).not.toHaveBeenCalled();
    });
  });

  describe('getNotifications', () => {
    it('should return paginated notifications', async () => {
      const mockNotifications = [
        { id: BigInt(1), userId: BigInt(1), title: 'Test', isRead: false },
      ];
      mockPrisma.notification.findMany.mockResolvedValue(mockNotifications);
      mockPrisma.notification.count.mockResolvedValue(1);

      const result = await service.getNotifications(1, {
        page: 1,
        limit: 20,
      });

      expect(result).toEqual({
        data: mockNotifications,
        total: 1,
        page: 1,
        limit: 20,
      });
      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: BigInt(1) },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
    });

    it('should apply correct skip for page 2', async () => {
      mockPrisma.notification.findMany.mockResolvedValue([]);
      mockPrisma.notification.count.mockResolvedValue(0);

      await service.getNotifications(1, { page: 2, limit: 10 });

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });

    it('should return empty data with total 0 when no notifications', async () => {
      mockPrisma.notification.findMany.mockResolvedValue([]);
      mockPrisma.notification.count.mockResolvedValue(0);

      const result = await service.getNotifications(1, {});

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      mockPrisma.notification.count.mockResolvedValue(5);

      const result = await service.getUnreadCount(1);

      expect(result).toEqual({ count: 5 });
      expect(mockPrisma.notification.count).toHaveBeenCalledWith({
        where: { userId: BigInt(1), isRead: false },
      });
    });

    it('should return 0 when no unread notifications', async () => {
      mockPrisma.notification.count.mockResolvedValue(0);

      const result = await service.getUnreadCount(1);

      expect(result).toEqual({ count: 0 });
    });
  });

  describe('markAsRead', () => {
    const mockNotification = {
      id: BigInt(1),
      userId: BigInt(1),
      isRead: false,
    };

    it('should mark notification as read when owned by user', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue(mockNotification);
      mockPrisma.notification.update.mockResolvedValue({
        ...mockNotification,
        isRead: true,
      });

      const result = await service.markAsRead(1, 1);

      expect(result.isRead).toBe(true);
      expect(mockPrisma.notification.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: { isRead: true, readAt: expect.any(Date) },
      });
    });

    it('should throw NotFoundException when notification not found', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue(null);

      await expect(service.markAsRead(1, 999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when user does not own notification', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue({
        ...mockNotification,
        userId: BigInt(2),
      });

      await expect(service.markAsRead(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.markAllAsRead(1);

      expect(result).toEqual({ updated: 3 });
      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: BigInt(1), isRead: false },
        data: { isRead: true, readAt: expect.any(Date) },
      });
    });

    it('should return 0 when no unread notifications', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.markAllAsRead(1);

      expect(result).toEqual({ updated: 0 });
    });
  });

  describe('getPreferences', () => {
    it('should return user preferences ordered by type', async () => {
      const mockPrefs = [
        {
          id: BigInt(1),
          userId: BigInt(1),
          type: 'ego_lift_warning',
          isEnabled: true,
        },
        {
          id: BigInt(2),
          userId: BigInt(1),
          type: 'milestone',
          isEnabled: false,
        },
      ];
      mockPrisma.notificationPreference.findMany.mockResolvedValue(mockPrefs);

      const result = await service.getPreferences(1);

      expect(result).toEqual(mockPrefs);
      expect(mockPrisma.notificationPreference.findMany).toHaveBeenCalledWith({
        where: { userId: BigInt(1) },
        orderBy: { type: 'asc' },
      });
    });
  });

  describe('updatePreference', () => {
    it('should upsert notification preference', async () => {
      const mockPref = {
        id: BigInt(1),
        userId: BigInt(1),
        type: 'milestone',
        isEnabled: false,
      };
      mockPrisma.notificationPreference.upsert.mockResolvedValue(mockPref);

      const dto = {
        type: NotificationType.MILESTONE,
        isEnabled: false,
      };

      const result = await service.updatePreference(1, dto);

      expect(result).toEqual(mockPref);
      expect(mockPrisma.notificationPreference.upsert).toHaveBeenCalled();
    });
  });
});
