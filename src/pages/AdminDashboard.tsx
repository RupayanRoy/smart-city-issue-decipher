import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockDb } from '@/backend/db';
import { analyticsService } from '@/backend/services/analyticsService';
import { issueService } from '@/backend/services/issueService';
import { escalationService } from '@/backend/services/escalationService';
import { showSuccess } from '@/utils/toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Shield, RefreshCw, CheckCircle, Play, Trash2, MapPin, AlertTriangle } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
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

  const runEscalation = () => {
    const count = escalationService.runEscalationCheck();
    showSuccess(`${count} issues escalated based on age.`);
    refreshData();
  };

  if (!stats) return null;

  const pieData = Object.entries(stats.byCategory).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Shield className="text-white w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Command Center</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={runEscalation} variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
              <RefreshCw className="mr-2 w-4 h-4" /> Run Escalation Check
            </Button>
            <Button onClick={() => { localStorage.removeItem('current_user'); navigate('/login'); }} variant="ghost">Logout</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 font-medium">Total Issues</p>
              <h3 className="text-3xl font-bold">{stats.totalIssues}</h3>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 font-medium">Avg Resolution Time</p>
              <h3 className="text-3xl font-bold">{stats.avgResolutionTimeHours}h</h3>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 font-medium">Pending</p>
              <h3 className="text-3xl font-bold text-yellow-600">{stats.byStatus.Pending || 0}</h3>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 font-medium">Resolved</p>
              <h3 className="text-3xl font-bold text-green-600">{stats.byStatus.Resolved || 0}</h3>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
            <TabsTrigger value="management">Issue Management</TabsTrigger>
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

          <TabsContent value="management">
            <div className="space-y-4">
              {issues.map(issue => (
                <Card key={issue.id} className="border-none shadow-sm">
                  <CardContent className="p-6 flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{issue.title}</h3>
                        <Badge className={issue.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}>
                          {issue.priority}
                        </Badge>
                        {issue.escalated && <AlertTriangle className="text-orange-500 w-5 h-5" />}
                      </div>
                      <p className="text-slate-600 text-sm">{issue.description}</p>
                      <div className="flex gap-4 text-xs text-slate-400">
                        <span>ID: {issue.id}</span>
                        <span>Category: {issue.category}</span>
                        <span>Location: {issue.location.address}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {issue.status === 'Pending' && (
                        <Button size="sm" onClick={() => handleStatusUpdate(issue.id, 'In Progress')}>
                          <Play className="mr-2 w-4 h-4" /> Start Work
                        </Button>
                      )}
                      {issue.status === 'In Progress' && (
                        <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(issue.id, 'Resolved')}>
                          <CheckCircle className="mr-2 w-4 h-4" /> Resolve
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;