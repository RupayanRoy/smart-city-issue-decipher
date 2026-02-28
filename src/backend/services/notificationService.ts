import { mockDb } from '../db';
import { Notification } from '../types';

export const notificationService = {
  sendResolutionMessage: (citizenId: string, issueId: string, issueTitle: string) => {
    const user = mockDb.users.find(u => u.id === citizenId);
    if (!user) return;

    if (!user.notifications) user.notifications = [];

    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      userId: citizenId,
      issueId,
      title: 'Issue Resolved',
      message: `Great news! Your report "${issueTitle}" has been marked as resolved by the city authorities. Please verify the work.`,
      type: 'resolution',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    user.notifications.unshift(newNotification);
    mockDb.save();
    return newNotification;
  },

  markAsRead: (userId: string, notificationId: string) => {
    const user = mockDb.users.find(u => u.id === userId);
    if (!user || !user.notifications) return;

    const notification = user.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      mockDb.save();
    }
  },

  getUnreadCount: (userId: string) => {
    const user = mockDb.users.find(u => u.id === userId);
    return user?.notifications?.filter(n => !n.isRead).length || 0;
  }
};