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
import { Shield, RefreshCw, CheckCircle, Play, Trash2, MapPin, AlertTriangle, Search, Download, Users, Map as MapIcon, ImageIcon, Activity, BarChart3, LayoutDashboard, Clock, Heart } from 'lucide-react';
import IssueMapOverview from '@/components/IssueMapOverview';
import Footer from '@/components/Footer';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
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
  };

  const handleStatusUpdate = (id: string, status: any) => {
    const admin = JSON.parse(localStorage.getItem('current_user') || '{}');
    issueService.updateStatus(id, status, admin.name);
    showSuccess(`Status updated to ${status}`);
    if (status === 'Resolved') setStatusFilter('Resolved');
    refreshData();
  };

  const handleAssign = (id: string, dept: string) => {
    issueService.assignIssue(id, dept);
    showSuccess(`Assigned to ${dept}`);
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
            <TabsTrigger value="analytics" className="rounded-xl px-8 py-3 font-black text-sm data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Impact Analytics
            </TabsTrigger>
            <TabsTrigger value="map" className="rounded-xl px-8 py-3 font-black text-sm data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all flex items-center gap-2">
              <MapIcon className="w-4 h-4" /> Geospatial
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
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div className="grid gap-6">
              {filteredIssues.length === 0 ? (
                <div className="text-center py-32 bg-white rounded-[2.5rem] border-4 border-dashed border-slate-200">
                  <p className="text-slate-400 font-black uppercase tracking-widest">No issues found in this category</p>
                </div>
              ) : (
                filteredIssues.map(issue => (
                  <Card key={issue.id} className="border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2.5rem] overflow-hidden bg-white group">
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row">
                        {issue.imageUrl && (
                          <div className="lg:w-72 h-72 lg:h-auto shrink-0 bg-slate-100 relative">
                            <img src={issue.imageUrl} alt={issue.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button variant="secondary" size="sm" className="rounded-full font-bold"><ImageIcon className="mr-2 w-4 h-4" /> View Full</Button>
                            </div>
                          </div>
                        )}
                        <div className="p-10 flex-1 space-y-6">
                          <div className="flex flex-col md:flex-row justify-between gap-8">
                            <div className="space-y-4 flex-1">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="font-black text-2xl text-slate-900">{issue.title}</h3>
                                <Badge className={`rounded-lg px-3 py-1 font-black text-[10px] uppercase tracking-widest ${issue.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                  {issue.priority} Priority
                                </Badge>
                                {issue.escalated && <Badge className="bg-orange-100 text-orange-700 rounded-lg px-3 py-1 font-black text-[10px] uppercase tracking-widest flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Escalated</Badge>}
                              </div>
                              <p className="text-slate-500 font-medium leading-relaxed text-lg">{issue.description}</p>
                              <div className="flex flex-wrap gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500" /> {issue.location.address}</span>
                                <span className="flex items-center gap-2"><Users className="w-4 h-4 text-blue-500" /> ID: {issue.id}</span>
                                <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-amber-500" /> {issue.category}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-4 min-w-[240px] bg-slate-50 p-6 rounded-3xl border border-slate-100">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Status</p>
                                <Badge className={`rounded-lg font-black text-[10px] uppercase tracking-widest ${issue.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {issue.status}
                                </Badge>
                              </div>
                              
                              <div className="space-y-3">
                                {issue.status === 'Pending' && (
                                  <Button className="w-full rounded-xl h-12 font-black bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100" onClick={() => handleStatusUpdate(issue.id, 'In Progress')}>
                                    <Play className="mr-2 w-4 h-4" /> Start Action
                                  </Button>
                                )}
                                {issue.status === 'In Progress' && (
                                  <Button className="w-full rounded-xl h-12 font-black bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100" onClick={() => handleStatusUpdate(issue.id, 'Resolved')}>
                                    <CheckCircle className="mr-2 w-4 h-4" /> Mark Resolved
                                  </Button>
                                )}
                                <div className="space-y-1.5">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Department</p>
                                  <select className="w-full h-12 rounded-xl border-slate-200 bg-white text-sm font-bold px-4 outline-none focus:ring-2 focus:ring-emerald-500" onChange={(e) => handleAssign(issue.id, e.target.value)} value={issue.assignedTo || ""}>
                                    <option value="" disabled>Select Department</option>
                                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-50"><CardTitle className="text-xl font-black">Service Distribution</CardTitle></CardHeader>
                <CardContent className="h-[400px] p-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={8} dataKey="value">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-50"><CardTitle className="text-xl font-black">Community Growth</CardTitle></CardHeader>
                <CardContent className="h-[400px] p-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="count" fill="#10b981" radius={[10, 10, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50"><CardTitle className="text-xl font-black">High-Impact Areas</CardTitle></CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.topAreas.map((area: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-xl shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-700 truncate max-w-[150px]">{area.address}</span>
                      </div>
                      <Badge className="bg-slate-900 text-white rounded-lg px-3 py-1 font-black">{area.count} Reports</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50">
                <CardTitle className="text-2xl font-black flex items-center gap-3">
                  <MapIcon className="w-6 h-6 text-emerald-500" /> City Care Map
                </CardTitle>
                <CardDescription className="font-medium">Visual distribution of community needs across the city.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl">
                  <IssueMapOverview issues={issues} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;