import { mockDb } from '../db';
import { Issue, IssueCategory, IssuePriority, IssueStatus, Location, Comment, WorkerReport } from '../types';
import { aiService } from './aiService';
import { notificationService } from './notificationService';

export const issueService = {
  getIssues: () => {
    return [...mockDb.issues];
  },

  createIssue: (citizenId: string, data: { title: string; description: string; imageUrl?: string; videoUrl?: string; location: Location }) => {
    const analysis = aiService.analyzeIssue(data.description);
    
    const newIssue: Issue = {
      id: `iss-${Math.random().toString(36).substr(2, 9)}`,
      citizenId,
      title: data.title || analysis.suggestedTitle,
      description: data.description,
      imageUrl: data.imageUrl,
      videoUrl: data.videoUrl,
      category: analysis.category,
      status: 'Pending',
      priority: analysis.priority,
      location: data.location,
      statusHistory: [{
        status: 'Pending',
        timestamp: new Date().toISOString(),
        updatedBy: 'CityCare AI'
      }],
      upvotes: [],
      reports: [],
      comments: [],
      escalated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
    } else {
      issue.upvotes.splice(index, 1);
    }

    if (issue.upvotes.length >= 5 && issue.priority !== 'High') {
      issue.priority = 'High';
    } else if (issue.upvotes.length >= 2 && issue.priority === 'Low') {
      issue.priority = 'Medium';
    }

    issue.updatedAt = new Date().toISOString();
    mockDb.save();
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
  },

  addComment: (issueId: string, userId: string, userName: string, text: string) => {
    const issue = mockDb.issues.find(i => i.id === issueId);
    if (!issue) return;

    issue.comments.push({
      id: `c-${Date.now()}`,
      userId,
      userName,
      text,
      timestamp: new Date().toISOString()
    });
    issue.updatedAt = new Date().toISOString();
    mockDb.save();
  },

  deleteComment: (issueId: string, commentId: string) => {
    const issue = mockDb.issues.find(i => i.id === issueId);
    if (!issue) return;
    issue.comments = issue.comments.filter(c => c.id !== commentId);
    mockDb.save();
  },

  updateStatus: (issueId: string, status: IssueStatus, adminName: string) => {
    const issue = mockDb.issues.find(i => i.id === issueId);
    if (!issue) return;

    issue.status = status;
    issue.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      updatedBy: adminName
    });

    if (status === 'Resolved') {
      issue.resolvedAt = new Date().toISOString();
      issue.isSevereAlert = false;
      const citizen = mockDb.users.find(u => u.id === issue.citizenId);
      if (citizen) citizen.points = (citizen.points || 0) + 10;
      notificationService.sendResolutionMessage(issue.citizenId, issue.id, issue.title);
    }

    issue.updatedAt = new Date().toISOString();
    mockDb.save();
  },

  assignIssue: (issueId: string, department: string, workerId?: string) => {
    const issue = mockDb.issues.find(i => i.id === issueId);
    if (!issue) return;

    issue.assignedTo = department;
    issue.workerId = workerId;
    issue.status = workerId ? 'In Progress' : 'Pending';
    issue.updatedAt = new Date().toISOString();
    mockDb.save();
  },

  submitWorkerReport: (issueId: string, report: WorkerReport) => {
    const issue = mockDb.issues.find(i => i.id === issueId);
    if (!issue) return;

    issue.workerReport = report;
    issue.status = 'Completed';
    issue.statusHistory.push({
      status: 'Completed',
      timestamp: new Date().toISOString(),
      updatedBy: 'Field Worker'
    });
    issue.updatedAt = new Date().toISOString();
    mockDb.save();
  },

  reissueIssue: (issueId: string, userId: string, note: string) => {
    const issue = mockDb.issues.find(i => i.id === issueId);
    if (!issue) return;

    issue.status = 'Pending';
    issue.priority = 'High';
    issue.isReissued = true;
    issue.statusHistory.push({
      status: 'Pending',
      timestamp: new Date().toISOString(),
      updatedBy: 'Citizen (Re-issue)',
      note
    });
    issue.updatedAt = new Date().toISOString();
    mockDb.save();
  },

  findSimilarIssues: (description: string, location: { lat: number, lng: number }) => {
    const text = description.toLowerCase();
    return mockDb.issues.filter(issue => {
      const dist = Math.sqrt(Math.pow(issue.location.lat - location.lat, 2) + Math.pow(issue.location.lng - location.lng, 2));
      const isNearby = dist < 0.01; // Roughly 1km
      const isSimilarText = text.split(' ').some(word => word.length > 3 && issue.description.toLowerCase().includes(word));
      return isNearby && isSimilarText && issue.status !== 'Resolved' && issue.status !== 'Flagged';
    });
  },

  dismissReports: (issueId: string) => {
    const issue = mockDb.issues.find(i => i.id === issueId);
    if (!issue) return;
    issue.reports = [];
    mockDb.save();
  },

  confirmReport: (issueId: string, adminName: string) => {
    const issue = mockDb.issues.find(i => i.id === issueId);
    if (!issue) return;
    issue.status = 'Flagged';
    issue.statusHistory.push({
      status: 'Flagged',
      timestamp: new Date().toISOString(),
      updatedBy: adminName,
      note: 'Confirmed as invalid or spam by administration.'
    });
    mockDb.save();
  }
};