import { supabase } from '@/integrations/supabase/client';

export const notificationService = {
  sendResolutionMessage: async (citizenId: string, issueId: string, issueTitle: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: citizenId,
        issue_id: issueId,
        title: 'Issue Resolved',
        message: `Great news! Your report "${issueTitle}" has been marked as resolved by the city authorities. Please verify the work.`,
        type: 'resolution',
        is_read: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getNotifications: async (userId: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  markAsRead: async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  }
};