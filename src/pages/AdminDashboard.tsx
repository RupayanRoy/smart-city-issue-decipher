import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockDb } from '@/backend/db';
import { analyticsService } from '@/backend/services/analyticsService';
import { issueService } from '@/backend/services/issueService';
import { escalationService } from '@/backend/services/escalationService';
import { DEPARTMENTS } from '@/backend/types';
import { showSuccess } from '@/utils/toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Shield, RefreshCw, CheckCircle, Play, Trash2, MapPin, AlertTriangle, Search, Download, Users, Map as MapIcon } from 'lucide-react';
import IssueMapOverview from '@/components/IssueMapOverview';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('current_user') || '{}');
    if (user.role !== 'admin') return navigate('/login');
    refreshData();
  }, []);

  const refreshData = () => {
    setStats(analyticsService.getDashboardStats());
    setIssues([...mockDb.issues].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const handleStatusUpdate = (id: string, status: any) => {
    const admin = JSON.parse(localStorage.getItem('current_user') || '{}');
    issueService.updateStatus(id, status, admin.name);
    showSuccess(`Issue marked as ${status}`);
    refreshData();
  };

  const handleAssign = (id: string, dept: string) => {
    issueService.assignIssue(id, dept);
    showSuccess(`Assigned to ${dept}`);
    refreshData();
  };

  const runEscalation = () => {
    const count = escalationService.runEscalationCheck();
    showSuccess(`${count} issues escalated based on age.`);
    refreshData();
  };

  const handleExport = () => {
    showSuccess('Exporting data to CSV... (Mock)');
  };

  const filteredIssues = issues.filter(issue => 
    issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    issue.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!stats) return null;

  const pieData = Object.entries(stats.byCategory).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-1.5 rounded-lg">
              <Shield className="text-white w-5 h-5" />
            </div>
            <h1 className="font-bold text-xl">Admin Command Center</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={runEscalation} variant="outline" size="sm" className="hidden md:flex">
              <RefreshCw className="mr-2 w-4 h-4" /> Run Escalation
            </Button>
            <Button onClick={handleExport} variant="outline" size="sm" className="hidden md:flex">
              <Download className="mr-2 w-4 h-4" /> Export
            </Button>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <Button onClick={() => { localStorage.removeItem('current_user'); navigate('/login'); }} variant="ghost" size="sm">Logout</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Issues', value: stats.totalIssues, color: 'text-slate-900' },
            { label: 'Avg Resolution', value: `${stats.avgResolutionTimeHours}h`, color: 'text-blue-600' },
            { label: 'Pending', value: stats.byStatus.Pending || 0, color: 'text-yellow-600' },
            { label: 'Resolved', value: stats.byStatus.Resolved || 0, color: 'text-green-600' }
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <h3 className={`text-3xl font-bold ${stat.color}`}>{stat.value}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
            <TabsTrigger value="map">Geospatial Overview</TabsTrigger>
            <TabsTrigger value="management">Issue Management</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm">
                <CardHeader><CardTitle>Issues by Category</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm">
                <CardHeader><CardTitle>Monthly Trends</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <Card className="border-none shadow-sm">
              <CardHeader><CardTitle>Top Complaint Areas</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topAreas.map((area: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MapPin className="text-slate-400 w-4 h-4" />
                        <span className="font-medium">{area.address}</span>
                      </div>
                      <Badge variant="secondary">{area.count} Issues</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapIcon className="w-5 h-5 text-primary" /> City-wide Issue Map
                </CardTitle>
                <CardDescription>Visual distribution of all reported issues across the city.</CardDescription>
              </CardHeader>
              <CardContent>
                <IssueMapOverview issues={issues} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="management" className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search by ID or Title..." 
                className="pl-10"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              {filteredIssues.map(issue => (
                <Card key={issue.id} className="border-none shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{issue.title}</h3>
                          <Badge className={issue.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}>
                            {issue.priority}
                          </Badge>
                          {issue.escalated && <AlertTriangle className="text-orange-500 w-5 h-5" />}
                        </div>
                        <p className="text-slate-600 text-sm">{issue.description}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                          <span>ID: {issue.id}</span>
                          <span>Category: {issue.category}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {issue.location.address}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3 min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <Badge className={issue.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {issue.status}
                          </Badge>
                          {issue.assignedTo && <Badge variant="outline">Assigned: {issue.assignedTo}</Badge>}
                        </div>
                        
                        <div className="flex gap-2">
                          {issue.status === 'Pending' && (
                            <Button size="sm" className="flex-1" onClick={() => handleStatusUpdate(issue.id, 'In Progress')}>
                              <Play className="mr-2 w-4 h-4" /> Start
                            </Button>
                          )}
                          {issue.status === 'In Progress' && (
                            <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(issue.id, 'Resolved')}>
                              <CheckCircle className="mr-2 w-4 h-4" /> Resolve
                            </Button>
                          )}
                          <select 
                            className="text-xs border rounded px-2 bg-white"
                            onChange={(e) => handleAssign(issue.id, e.target.value)}
                            value={issue.assignedTo || ""}
                          >
                            <option value="" disabled>Assign Dept</option>
                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="departments">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DEPARTMENTS.map(dept => (
                <Card key={dept} className="border-none shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" /> {dept}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-500">
                      {issues.filter(i => i.assignedTo === dept).length} Active Issues
                    </p>
                    <Button variant="link" className="px-0 text-xs">View Department Team</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;