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
}

// Seed Mock Citizens if not exists
if (mockDb.users.length <= 1) {
  const mockCitizens = [
    { id: 'cit-1', name: 'Arun Kumar', email: 'arun@example.com', role: 'citizen' as const, password: 'password123' },
    { id: 'cit-2', name: 'Priya Sharma', email: 'priya@example.com', role: 'citizen' as const, password: 'password123' },
    { id: 'cit-3', name: 'Sanjay Viswanathan', email: 'sanjay@example.com', role: 'citizen' as const, password: 'password123' }
  ];
  mockDb.users.push(...mockCitizens);
}

// Seed Mock Issues around VIT Chennai (12.8406, 80.1534) if empty
if (mockDb.issues.length === 0) {
  const now = new Date();
  const mockIssues: Issue[] = [
    {
      id: 'iss-1',
      citizenId: 'cit-1',
      title: 'Large Pothole near VIT Main Gate',
      description: 'There is a very deep pothole right at the entrance that is causing traffic delays and is dangerous for bikers.',
      category: 'Road',
      status: 'In Progress',
      priority: 'High',
      location: { address: 'Vandalur-Kelambakkam Road, Chennai', lat: 12.8412, lng: 80.1538 },
      assignedTo: 'Public Works',
      statusHistory: [
        { status: 'Pending', timestamp: new Date(now.getTime() - 86400000 * 2).toISOString(), updatedBy: 'System' },
        { status: 'In Progress', timestamp: new Date(now.getTime() - 86400000).toISOString(), updatedBy: 'System Admin' }
      ],
      escalated: false,
      createdAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
      updatedAt: new Date(now.getTime() - 86400000).toISOString()
    },
    {
      id: 'iss-2',
      citizenId: 'cit-2',
      title: 'Street Light Outage',
      description: 'The street lights on the back road are not working for the past 3 days. It is very dark and unsafe at night.',
      category: 'Electricity',
      status: 'Pending',
      priority: 'Medium',
      location: { address: 'Kelambakkam High Road, Chennai', lat: 12.8385, lng: 80.1560 },
      statusHistory: [{ status: 'Pending', timestamp: new Date(now.getTime() - 86400000).toISOString(), updatedBy: 'System' }],
      escalated: false,
      createdAt: new Date(now.getTime() - 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 86400000).toISOString()
    },
    {
      id: 'iss-3',
      citizenId: 'cit-3',
      title: 'Garbage Overflow',
      description: 'The community bin is overflowing and hasn\'t been cleared in a week. The smell is becoming unbearable.',
      category: 'Garbage',
      status: 'Pending',
      priority: 'Medium',
      location: { address: 'Mambakkam Main Road, Chennai', lat: 12.8450, lng: 80.1480 },
      statusHistory: [{ status: 'Pending', timestamp: new Date(now.getTime() - 43200000).toISOString(), updatedBy: 'System' }],
      escalated: false,
      createdAt: new Date(now.getTime() - 43200000).toISOString(),
      updatedAt: new Date(now.getTime() - 43200000).toISOString()
    },
    {
      id: 'iss-4',
      citizenId: 'cit-1',
      title: 'Water Pipe Leakage',
      description: 'Major water leakage from a burst pipe on the side of the road. Significant amount of water is being wasted.',
      category: 'Water',
      status: 'Resolved',
      priority: 'High',
      location: { address: 'Near VIT Chennai Campus', lat: 12.8425, lng: 80.1510 },
      assignedTo: 'Water & Sanitation',
      statusHistory: [
        { status: 'Pending', timestamp: new Date(now.getTime() - 86400000 * 3).toISOString(), updatedBy: 'System' },
        { status: 'In Progress', timestamp: new Date(now.getTime() - 86400000 * 2).toISOString(), updatedBy: 'System Admin' },
        { status: 'Resolved', timestamp: new Date(now.getTime() - 86400000).toISOString(), updatedBy: 'System Admin' }
      ],
      escalated: false,
      createdAt: new Date(now.getTime() - 86400000 * 3).toISOString(),
      updatedAt: new Date(now.getTime() - 86400000).toISOString(),
      resolvedAt: new Date(now.getTime() - 86400000).toISOString()
    }
  ];
  mockDb.issues.push(...mockIssues);
}

mockDb.save();