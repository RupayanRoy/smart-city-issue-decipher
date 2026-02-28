export type UserRole = 'citizen' | 'admin' | 'worker';

export interface Notification {
  id: string;
  userId: string;
  issueId: string;
  title: string;
  message: string;
  type: 'resolution' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  points?: number;
  department?: string;
  notifications?: Notification[];
}

export type IssueCategory = 'Road' | 'Water' | 'Electricity' | 'Garbage' | 'Other';
export type IssueStatus = 'Pending' | 'In Progress' | 'Completed' | 'Resolved' | 'Flagged';
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

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

export interface Location {
  address: string;
  lat: number;
  lng: number;
}

export interface WorkerReport {
  submittedAt: string;
  notes: string;
  imageUrl?: string;
}

export interface Issue {
  id: string;
  citizenId: string;
  workerId?: string;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  category: IssueCategory;
  status: IssueStatus;
  priority: IssuePriority;
  location: Location;
  assignedTo?: string;
  statusHistory: StatusHistory[];
  upvotes: string[];
  reports: string[];
  comments: Comment[];
  escalated: boolean;
  isSevereAlert?: boolean;
  isReissued?: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  notified?: boolean;
  workerReport?: WorkerReport;
}

export interface AnalyticsData {
  totalIssues: number;
  byCategory: Record<IssueCategory, number>;
  byStatus: Record<IssueStatus, number>;
  avgResolutionTimeHours: number;
  topAreas: { address: string; count: number }[];
  monthlyTrends: { month: string; count: number }[];
}