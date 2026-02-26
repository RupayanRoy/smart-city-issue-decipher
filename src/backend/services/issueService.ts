import { mockDb } from '../db';
import { Issue, IssueCategory, IssuePriority, IssueStatus, Location, Comment } from '../types';
import { aiService } from './aiService';

export const issueService = {
  createIssue: (citizenId: string, data: { title: string; description: string; imageUrl?: string; location: Location }) => {
    const { category: aiCategory, priority: aiPriority } = aiService.detectCategoryAndPriority(data.description);
    
    const newIssue: Issue = {
      id: Math.random().toString(36).substr(2, 9),
      citizenId,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      category: aiCategory,
      status: 'Pending',
      priority: aiPriority,
      location: data.location,
      statusHistory: [{
        status: 'Pending',
        timestamp: new Date().toISOString(),
        updatedBy: 'System'
      }],
      upvotes: [],
      reports: [],
      comments: [],
      escalated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notified: false
    };

    mockDb.issues.push(newIssue);
    mockDb.save();
    return newIssue;
  },

  toggleUpvote: (issueId: string, userId: string) => {
    const issue = mockDb.issues.find(i => i.id === issueId);
    if (!issue) return;

    const index = issue.upvotes.indexOf(userId);
    if (index === -1) {
      issue.upvotes.push(userId);
      if (issue.upvotes.length >= 5 && issue.priority !== 'High') {
        issue.priority = 'High';
      } else if (issue.upvotes.length >= 2 && issue.priority === 'Low') {
        issue.priority = 'Medium';
      }
    } else {
      issue.upvotes.splice(index, 1);
    }
    
    mockDb.save();
    return issue;
  },

  toggleReport: (issueId: string, userId: string) => {
    const issue = mockDb.issues.find(i => i.id === issueId);
    if (!issue) return;

    const index = issue.reports.indexOf(userId);
    if (index === -1) {
      issue.reports.push(userId);
    } else {
      issue.reports.splice(index, 1);
    }
    
    mockDb.save();
    return issue;
  },

  addComment: (issueId: string, userId: string, userName: string, text: string) => {
    const issue = mockDb.issues.find(i => i.id === issueId);
    if (!issue) return;

    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      userName,
      text,
      timestamp: new Date().toISOString()
    };

    issue.comments.push(newComment);
    mockDb.save();
    return issue;
  },

  deleteComment: (issueId: string, commentId: string) => {
    const issue = mockDb.issues.find(i => i.id === issueId);
    if (!issue) return;

    issue.comments = issue.comments.filter(c => c.id !== commentId);
    mockDb.save();
    return issue;
  },

  updateStatus: (issueId: string, status: IssueStatus, adminId: string) => {
    const issue = mockDb.issues.find(i => i.id === issueId);
    if (!issue) throw new Error('Issue not found');

    issue.status = status;
    issue.updatedAt = new Date().toISOString();
    
    if (status === 'Resolved') {
      issue.resolvedAt = new Date().toISOString();
      const citizen = mockDb.users.find(u => u.id === issue.citizenId);
      if (citizen) {
        citizen.points = (citizen.points || 0) + 10;
      }
    }
    
    issue.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      updatedBy: adminId
    });

    mockDb.save();
    return issue;
  },

  confirmReport: (issueId: string, adminId: string) => {
    const issue = mockDb.issues.find(i => i.id === issueId);
    if (!issue) return;

    // Penalize the creator
    const creator = mockDb.users.find(u => u.id === issue.citizenId);
    if (creator) {
      creator.points = Math.max(0, (creator.points || 0) - 1);
    }

    // Mark as flagged/invalid
    issue.status = 'Flagged';
    issue.statusHistory.push({
      status: 'Flagged',
      timestamp: new Date().toISOString(),
      updatedBy: adminId,
      note: 'Issue confirmed as invalid/fake by admin.'
    });

    mockDb.save();
  },

  dismissReports: (issueId: string) => {
    const issue = mockDb.issues.find(i => i.id === issueId);
    if (!issue) return;

    issue.reports = [];
    mockDb.save();
  },

  markAsNotified: (issueId: string) => {
    const issue = mockDb.issues.find(i => i.id === issueId);
    if (issue) {
      issue.notified = true;
      mockDb.save();
    }
  },

  assignIssue: (issueId: string, department: string) => {
    const issue = mockDb.issues.find(i => i.id === issueId);
    if (!issue) throw new Error('Issue not found');
    
    issue.assignedTo = department;
    issue.updatedAt = new Date().toISOString();
    mockDb.save();
    return issue;
  },

  getIssuesByRadius: (lat: number, lng: number, radiusKm: number) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    
    return mockDb.issues.filter(issue => {
      const R = 6371;
      const dLat = toRad(issue.location.lat - lat);
      const dLon = toRad(issue.location.lng - lng);
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat)) * Math.cos(toRad(issue.location.lat)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return distance <= radiusKm;
    });
  }
};