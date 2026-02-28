import { mockDb } from '../db';

export const notificationService = {
  sendResolutionMessage: (citizenId: string, issueId: string, issueTitle: string) => {
    const user = mockDb.users.find(u => u.id === citizenId);
    if (!user) return;

    if (!user.notifications) user.notifications = [];
    
    user.notifications.push({
      id: `notif-${Date.now()}`,
      userId: citizenId,
      issueId,
      title: 'Issue Resolved',
      message: `Great news! Your report "${issueTitle}" has been marked as resolved by the city authorities. Please verify the work.`,
      type: 'resolution',
      isRead: false,
      createdAt: new Date().toISOString()
    });
    
    mockDb.save();
  },

  getUnreadCount: (userId: string) => {
    const user = mockDb.users.find(u => u.id === userId);
    return user?.notifications?.filter(n => !n.isRead).length || 0;
  },

  markAsRead: (userId: string, notificationId: string) => {
    const user = mockDb.users.find(u => u.id === userId);
    if (!user || !user.notifications) return;
    
    const notif = user.notifications.find(n => n.id === notificationId);
    if (notif) notif.isRead = true;
    
    mockDb.save();
  }
};