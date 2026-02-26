export type UserRole = 'citizen' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}

export type IssueCategory = 'Road' | 'Water' | 'Electricity' | 'Garbage' | 'Other';
export type IssueStatus = 'Pending' | 'In Progress' | 'Resolved';
export type IssuePriority = 'Low' | 'Medium' | 'High';

export const DEPARTMENTS = [
  'Public Works',
  'Water & Sanitation',
  'Electrical Grid',
  'Waste Management',
  'Urban Planning'
];

export interface StatusHistory {
  status: IssueStatus;
  timestamp: string;
  updatedBy: string;
  note?: string;
}

export interface Location {
  address: string;
  lat: number;
  lng: number;
}

export interface Issue {
  id: string;
  citizenId: string;
  title: string;
  description: string;
  imageUrl?: string;
  category: IssueCategory;
  status: IssueStatus;
  priority: IssuePriority;
  location: Location;
  assignedTo?: string; // Department name
  statusHistory: StatusHistory[];
  escalated: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface AnalyticsData {
  totalIssues: number;
  byCategory: Record<IssueCategory, number>;
  byStatus: Record<IssueStatus, number>;
  avgResolutionTimeHours: number;
  topAreas: { address: string; count: number }[];
  monthlyTrends: { month: string; count: number }[];
}