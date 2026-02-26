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
      mockDb.users = parsed.users || [];
      mockDb.issues = parsed.issues || [];
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