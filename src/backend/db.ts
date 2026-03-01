import { User, Issue } from './types';

export const mockDb = {
  users: [] as User[],
  issues: [] as Issue[],
  
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

mockDb.load();

if (!mockDb.users.find(u => u.role === 'admin')) {
  mockDb.users.push({
    id: 'admin-1',
    name: 'System Admin',
    email: 'admin@smartcity.gov',
    role: 'admin',
    password: 'password123'
  });
}

// Add Mock Workers
if (!mockDb.users.find(u => u.role === 'worker')) {
  mockDb.users.push(
    { id: 'wrk-1', name: 'John Technician', email: 'john@citycare.gov', role: 'worker', password: 'password123', department: 'Public Works' },
    { id: 'wrk-2', name: 'Sarah Electrician', email: 'sarah@citycare.gov', role: 'worker', password: 'password123', department: 'Electrical Grid' },
    { id: 'wrk-3', name: 'Mike Firefighter', email: 'mike@citycare.gov', role: 'worker', password: 'password123', department: 'Fire & Rescue' }
  );
}

if (mockDb.users.length <= 4) {
  const mockCitizens = [
    { id: 'cit-1', name: 'Rupayan', email: 'rupayan@example.com', role: 'citizen' as const, password: 'password123', points: 15 },
    { id: 'cit-2', name: 'Priya Sharma', email: 'priya@example.com', role: 'citizen' as const, password: 'password123', points: 5 },
    { id: 'cit-3', name: 'Sanjay Viswanathan', email: 'sanjay@example.com', role: 'citizen' as const, password: 'password123', points: 8 }
  ];
  mockDb.users.push(...mockCitizens);
}

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
      workerId: 'wrk-1',
      statusHistory: [
        { status: 'Pending', timestamp: new Date(now.getTime() - 86400000 * 2).toISOString(), updatedBy: 'System' },
        { status: 'In Progress', timestamp: new Date(now.getTime() - 86400000).toISOString(), updatedBy: 'System Admin' }
      ],
      upvotes: ['cit-2', 'cit-3'],
      comments: [
        { id: 'c1', userId: 'cit-2', userName: 'Priya Sharma', text: 'I almost fell here yesterday! Please fix soon.', timestamp: new Date(now.getTime() - 86400000).toISOString() }
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
      upvotes: ['cit-1'],
      comments: [],
      escalated: false,
      createdAt: new Date(now.getTime() - 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 86400000).toISOString()
    },
    {
      id: 'iss-3',
      citizenId: 'cit-3',
      title: 'Small Fire in Trash Bin',
      description: 'There is smoke and small flames coming from a public trash bin near the park.',
      category: 'Fire',
      status: 'Pending',
      priority: 'High',
      location: { address: 'Anna Nagar, Chennai', lat: 13.0850, lng: 80.2101 },
      statusHistory: [{ status: 'Pending', timestamp: new Date().toISOString(), updatedBy: 'System' }],
      upvotes: [],
      comments: [],
      escalated: false,
      isSevereAlert: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  mockDb.issues.push(...mockIssues);
}

mockDb.save();