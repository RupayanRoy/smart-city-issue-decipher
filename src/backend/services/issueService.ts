import { supabase } from '@/integrations/supabase/client';
import { Issue, IssueCategory, IssuePriority, IssueStatus, Location, Comment, WorkerReport } from '../types';
import { aiService } from './aiService';
import { notificationService } from './notificationService';

export const issueService = {
  getIssues: async () => {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  createIssue: async (citizenId: string, data: { title: string; description: string; imageUrl?: string; videoUrl?: string; location: Location }) => {
    const analysis = aiService.analyzeIssue(data.description);
    
    const { data: newIssue, error } = await supabase
      .from('issues')
      .insert({
        citizen_id: citizenId,
        title: data.title || analysis.suggestedTitle,
        description: data.description,
        image_url: data.imageUrl,
        video_url: data.videoUrl,
        category: analysis.category,
        status: 'Pending',
        priority: analysis.priority,
        location_address: data.location.address,
        location_lat: data.location.lat,
        location_lng: data.location.lng,
        status_history: [{
          status: 'Pending',
          timestamp: new Date().toISOString(),
          updatedBy: 'CityCare AI'
        }]
      })
      .select()
      .single();

    if (error) throw error;
    return newIssue;
  },

  toggleUpvote: async (issueId: string, userId: string) => {
    const { data: issue, error: fetchError } = await supabase
      .from('issues')
      .select('upvotes, priority')
      .eq('id', issueId)
      .single();

    if (fetchError) throw fetchError;

    let upvotes = issue.upvotes || [];
    const index = upvotes.indexOf(userId);
    if (index === -1) {
      upvotes.push(userId);
    } else {
      upvotes.splice(index, 1);
    }

    let priority = issue.priority;
    if (upvotes.length >= 5 && priority !== 'High') {
      priority = 'High';
    } else if (upvotes.length >= 2 && priority === 'Low') {
      priority = 'Medium';
    }

    const { data: updatedIssue, error: updateError } = await supabase
      .from('issues')
      .update({ upvotes, priority, updated_at: new Date().toISOString() })
      .eq('id', issueId)
      .select()
      .single();

    if (updateError) throw updateError;
    return updatedIssue;
  },

  updateStatus: async (issueId: string, status: IssueStatus, adminId: string) => {
    const { data: issue, error: fetchError } = await supabase
      .from('issues')
      .select('*')
      .eq('id', issueId)
      .single();

    if (fetchError) throw fetchError;

    const history = issue.status_history || [];
    history.push({
      status,
      timestamp: new Date().toISOString(),
      updatedBy: adminId
    });

    const updateData: any = {
      status,
      status_history: history,
      updated_at: new Date().toISOString()
    };

    if (status === 'Resolved') {
      updateData.resolved_at = new Date().toISOString();
      updateData.is_severe_alert = false;
      
      // Award points to citizen
      const { data: profile } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', issue.citizen_id)
        .single();
      
      if (profile) {
        await supabase
          .from('profiles')
          .update({ points: (profile.points || 0) + 10 })
          .eq('id', issue.citizen_id);
      }

      await notificationService.sendResolutionMessage(issue.citizen_id, issue.id, issue.title);
    }

    const { data: updatedIssue, error: updateError } = await supabase
      .from('issues')
      .update(updateData)
      .eq('id', issueId)
      .select()
      .single();

    if (updateError) throw updateError;
    return updatedIssue;
  },

  addComment: async (issueId: string, userId: string, userName: string, text: string) => {
    const { error } = await supabase
      .from('comments')
      .insert({
        issue_id: issueId,
        user_id: userId,
        user_name: userName,
        text: text
      });

    if (error) throw error;
  },

  assignIssue: async (issueId: string, department: string, workerId?: string) => {
    const { data: updatedIssue, error } = await supabase
      .from('issues')
      .update({
        assigned_to: department,
        worker_id: workerId,
        status: workerId ? 'In Progress' : 'Pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', issueId)
      .select()
      .single();

    if (error) throw error;
    return updatedIssue;
  }
};