import { mockDb } from '../db';
import { Issue, IssueCategory, IssuePriority, IssueStatus, Location } from '../types';
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
      escalated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockDb.issues.push(newIssue);
    mockDb.save();
    return newIssue;
  },

  updateStatus: (issueId: string, status: IssueStatus, adminId: string) => {
    const issue = mockDb.issues.find(i => i.id === issueId);
    if (!issue) throw new Error('Issue not found');

    issue.status = status;
    issue.updatedAt = new Date().toISOString();
    if (status === 'Resolved') issue.resolvedAt = new Date().toISOString();
    
    issue.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      updatedBy: adminId
    });

    mockDb.save();
    return issue;
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
      const R = 6371; // Earth radius in km
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