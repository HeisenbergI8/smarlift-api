import { PrismaService } from '../prisma/prisma.service';
import { UpdateNotificationPrefsDto } from './dto';
export declare class NotificationService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getNotifications(userId: number, page: number, limit: number): Promise<void>;
    getUnreadCount(userId: number): Promise<void>;
    markAsRead(userId: number, notificationId: number): Promise<void>;
    markAllAsRead(userId: number): Promise<void>;
    getPreferences(userId: number): Promise<void>;
    updatePreference(userId: number, dto: UpdateNotificationPrefsDto): Promise<void>;
}
