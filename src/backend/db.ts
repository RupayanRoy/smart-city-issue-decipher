import { User, Issue } from './types';

// In a real app, this would be MongoDB
export const mockDb = {
  users: [] as User[],
  issues: [] as Issue[],
  
  // Helper to persist to localStorage for demo purposes
  save: () => {
    localStorage.setItem('smart_city_db', JSON.stringify({
      users: mockDb.users,
      issues: mockDb.issues
    }));
  },
  
  load: () => {
    const data = localStorage.getItem('smart_city_db');
    if (data) {
      const parsed = JSON.parse(data);
      mockDb.users = parsed.users;
      mockDb.issues = parsed.issues;
    }
  }
};

// Initialize
mockDb.load();

// Seed Admin if not exists
if (!mockDb.users.find(u => u.role === 'admin')) {
  mockDb.users.push({
    id: 'admin-1',
    name: 'System Admin',
    email: 'admin@smartcity.gov',
    role: 'admin',
    password: 'password123'
  });
  mockDb.save();
}
</dyad-db>

<dyad-write path="src/backend/services/issueService.ts" description="Core business logic for issue management.">
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
      category: aiCategory, // AI Overrides manual selection as per requirements
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