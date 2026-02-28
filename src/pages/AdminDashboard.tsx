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
import { Shield, RefreshCw, CheckCircle, Play, Trash2, MapPin, AlertTriangle, Search, Download, Users, Map as MapIcon, ImageIcon, Activity, BarChart3, LayoutDashboard, Clock, Heart, Flag, Check, X, Megaphone, HardHat, ClipboardCheck } from 'lucide-react';
import IssueMapOverview from '@/components/IssueMapOverview';
import Footer from '@/components/Footer';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('current_user') || '{}');
    if (user.role !== 'admin') return navigate('/login');
    refreshData();
  }, []);

  const refreshData = () => {
    setStats(analyticsService.getDashboardStats());
    setIssues([...mockDb.issues].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setWorkers(mockDb.users.filter(u => u.role === 'worker'));
  };

  const handleStatusUpdate = (id: string, status: any) => {
    const admin = JSON.parse(localStorage.getItem('current_user') || '{}');
    issueService.updateStatus(id, status, admin.name);
    showSuccess(`Status updated to ${status}`);
    refreshData();
  };

  const handleAssign = (id: string, workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker) return;
    issueService.assignIssue(id, worker.department || 'General', workerId);
    showSuccess(`Assigned to ${worker.name}`);
    refreshData();
  };

  const handleVerify = (id: string) => {
    const admin = JSON.parse(localStorage.getItem('current_user') || '{}');
    issueService.updateStatus(id, 'Resolved', admin.name);
    showSuccess("Work verified and issue resolved!");
    refreshData();
  };

  const runEscalation = () => {
    const count = escalationService.runEscalationCheck();
    showSuccess(`${count} issues escalated for immediate attention.`);
    refreshData();
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || issue.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || issue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const reportedIssues = issues.filter(issue => issue.reports && issue.reports.length > 0 && issue.status !== 'Flagged');

  if (!stats) return null;
  const pieData = Object.entries(stats.byCategory).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F5F9]">
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
              <Shield className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tight">CityCare Admin</h1>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Service Command Center</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={runEscalation} variant="outline" size="sm" className="hidden md:flex rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white font-bold">
              <RefreshCw className="mr-2 w-4 h-4" /> Run Escalation
            </Button>
            <div className="h-10 w-px bg-slate-800 mx-2" />
            <Button onClick={() => { localStorage.removeItem('current_user'); navigate('/login'); }} variant="ghost" className="rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800">Logout</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 space-y-8 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Active Reports', value: stats.totalIssues, icon: Activity, color: 'text-slate-900', bg: 'bg-white' },
            { label: 'Avg Resolution', value: `${stats.avgResolutionTimeHours}h`, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Pending Action', value: stats.byStatus.Pending || 0, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Lives Impacted', value: stats.byStatus.Resolved || 0, icon: Heart, color: 'text-emerald-600', bg: 'bg-emerald-50' }
          ].map((stat, i) => (
            <Card key={i} className={`border-none shadow-sm rounded-3xl overflow-hidden ${stat.bg}`}>
              <CardContent className="p-8 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className={`text-4xl font-black ${stat.color}`}>{stat.value}</h3>
                </div>
                <div className={`p-4 rounded-2xl ${stat.color.replace('text', 'bg')}/10`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="management" className="w-full">
          <TabsList className="mb-8 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm inline-flex">
            <TabsTrigger value="management" className="rounded-xl px-8 py-3 font-black text-sm data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" /> Issue Management
            </TabsTrigger>
            <TabsTrigger value="moderation" className="rounded-xl px-8 py-3 font-black text-sm data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all flex items-center gap-2">
              <Flag className="w-4 h-4" /> Moderation {reportedIssues.length > 0 && <Badge className="ml-2 bg-red-500 text-white">{reportedIssues.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-xl px-8 py-3 font-black text-sm data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Impact Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="management" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input placeholder="Search by ID, Title or Citizen..." className="pl-12 h-14 rounded-2xl border-none shadow-sm bg-white font-medium" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <select className="bg-white border-none rounded-2xl px-6 h-14 text-sm font-black text-slate-600 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="All">All Status</option>
                <option value="Pending">Pending Action</option>
                <option value="In Progress">In Action</option>
                <option value="Completed">Worker Finished</option>
                <option value="Resolved">Resolved</option>
                <option value="Flagged">Invalid</option>
              </select>
            </div>

            <div className="grid gap-6">
              {filteredIssues.map(issue => (
                <Card key={issue.id} className="border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2.5rem] overflow-hidden bg-white group">
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                      <div className="p-10 flex-1 space-y-6">
                        <div className="flex flex-col md:flex-row justify-between gap-8">
                          <div className="space-y-4 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="font-black text-2xl text-slate-900">{issue.title}</h3>
                              <Badge className={`rounded-lg px-3 py-1 font-black text-[10px] uppercase tracking-widest ${issue.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                {issue.priority} Priority
                              </Badge>
                              <Badge className={`rounded-lg font-black text-[10px] uppercase tracking-widest ${issue.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : issue.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                {issue.status}
                              </Badge>
                            </div>
                            <p className="text-slate-500 font-medium leading-relaxed">{issue.description}</p>
                            
                            {issue.workerReport && (
                              <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 space-y-3">
                                <h4 className="font-black text-emerald-900 flex items-center gap-2 text-sm">
                                  <ClipboardCheck className="w-4 h-4" /> Worker Completion Report
                                </h4>
                                <p className="text-emerald-700 text-sm font-medium italic">"{issue.workerReport.notes}"</p>
                                <p className="text-[10px] font-bold text-emerald-600 uppercase">Submitted: {new Date(issue.workerReport.submittedAt).toLocaleString()}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-4 min-w-[280px] bg-slate-50 p-6 rounded-3xl border border-slate-100">
                            {issue.status === 'Pending' && (
                              <div className="space-y-3">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign to Worker</p>
                                <select 
                                  className="w-full h-12 rounded-xl border-slate-200 bg-white text-sm font-bold px-4 outline-none focus:ring-2 focus:ring-emerald-500"
                                  onChange={(e) => handleAssign(issue.id, e.target.value)}
                                  value={issue.workerId || ""}
                                >
                                  <option value="" disabled>Select Worker</option>
                                  {workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.department})</option>)}
                                </select>
                              </div>
                            )}

                            {issue.status === 'Completed' && (
                              <Button className="w-full rounded-xl h-12 font-black bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100" onClick={() => handleVerify(issue.id)}>
                                <CheckCircle className="mr-2 w-4 h-4" /> Verify & Resolve
                              </Button>
                            )}

                            {issue.status === 'In Progress' && (
                              <div className="text-center p-4">
                                <HardHat className="w-8 h-8 text-amber-500 mx-auto mb-2 animate-bounce" />
                                <p className="text-xs font-bold text-slate-500">Worker is currently on-site</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase mt-1">Assigned to: {workers.find(w => w.id === issue.workerId)?.name}</p>
                              </div>
                            )}

                            {issue.status !== 'Resolved' && issue.status !== 'Flagged' && (
                              <Button variant="outline" className="w-full rounded-xl h-12 font-black border-2 border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleStatusUpdate(issue.id, 'Flagged')}>
                                <Trash2 className="mr-2 w-4 h-4" /> Mark Invalid
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          {/* Other tabs remain same */}
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;