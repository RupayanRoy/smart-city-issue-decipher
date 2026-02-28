import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { mockDb } from '@/backend/db';
import { analyticsService } from '@/backend/services/analyticsService';
import { issueService } from '@/backend/services/issueService';
import { escalationService } from '@/backend/services/escalationService';
import { showSuccess } from '@/utils/toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  Shield, RefreshCw, CheckCircle, Play, Trash2, MapPin, AlertTriangle, 
  Search, Activity, BarChart3, LayoutDashboard, Clock, Heart, Flag, 
  Megaphone, HardHat, ClipboardCheck, Zap, Globe, Server, ShieldAlert,
  TrendingUp, Users, MessageSquare, Terminal
} from 'lucide-react';
import IssueMapOverview from '@/components/IssueMapOverview';
import Footer from '@/components/Footer';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('current_user') || '{}');
    if (user.role !== 'admin') return navigate('/login');
    refreshData();

    // Mock Live Feed
    const logs = [
      "System initialized...",
      "AI Analysis Engine: Online",
      "Geocoding Service: Active",
      "Worker Node 04: Clocked In",
      "New Report: Pothole detected in Sector 7"
    ];
    setLiveLogs(logs);

    const interval = setInterval(() => {
      const newLog = `Event: ${['Status Update', 'New Comment', 'Assignment', 'Resolution'][Math.floor(Math.random() * 4)]} at ${new Date().toLocaleTimeString()}`;
      setLiveLogs(prev => [newLog, ...prev].slice(0, 8));
    }, 5000);

    return () => clearInterval(interval);
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
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-300">
      {/* Tactical Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-[1800px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20 animate-pulse">
              <Shield className="text-slate-900 w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tighter text-white">CITYCARE <span className="text-emerald-500">COMMAND</span></h1>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Strategic Operations Center // Level 4 Clearance</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden xl:flex items-center gap-6">
              <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50">
                <Server className="w-4 h-4 text-emerald-500" />
                <div className="text-[10px] font-black">
                  <p className="text-slate-500 uppercase">System Load</p>
                  <p className="text-white">12.4%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50">
                <Zap className="w-4 h-4 text-amber-500" />
                <div className="text-[10px] font-black">
                  <p className="text-slate-500 uppercase">AI Latency</p>
                  <p className="text-white">42ms</p>
                </div>
              </div>
            </div>

            <div className="h-10 w-px bg-slate-800" />

            <div className="flex items-center gap-4">
              <Button onClick={runEscalation} variant="outline" size="sm" className="rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white font-black text-xs">
                <RefreshCw className="mr-2 w-4 h-4" /> ESCALATION PROTOCOL
              </Button>
              <Button onClick={() => { localStorage.removeItem('current_user'); navigate('/login'); }} variant="ghost" className="rounded-xl font-black text-slate-500 hover:text-white hover:bg-slate-800">LOGOUT</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto p-6 grid grid-cols-12 gap-6 flex-1 w-full">
        {/* Left Column: Global Stats & Live Feed */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {[
              { label: 'Active Reports', value: stats.totalIssues, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { label: 'Avg Resolution', value: `${stats.avgResolutionTimeHours}h`, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Pending Action', value: stats.byStatus.Pending || 0, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
              { label: 'Lives Impacted', value: stats.byStatus.Resolved || 0, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10' }
            ].map((stat, i) => (
              <Card key={i} className="bg-slate-900/50 border-slate-800 shadow-2xl rounded-3xl overflow-hidden">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                    <h3 className={`text-3xl font-black text-white`}>{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-slate-900/50 border-slate-800 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-500" /> Live Operations Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3 font-mono text-[10px]">
                {liveLogs.map((log, i) => (
                  <div key={i} className="flex gap-2 text-slate-400 border-l-2 border-slate-800 pl-3 py-1">
                    <span className="text-emerald-500 shrink-0">[{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}]</span>
                    <span className="truncate">{log}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-500" /> Departmental Load
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {['Public Works', 'Electrical Grid', 'Waste Management'].map((dept, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-400">{dept}</span>
                    <span className="text-white">{[75, 42, 91][i]}%</span>
                  </div>
                  <Progress value={[75, 42, 91][i]} className="h-1 bg-slate-800" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Middle Column: Tactical Management */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
          <Tabs defaultValue="management" className="w-full">
            <TabsList className="mb-6 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 shadow-sm inline-flex">
              <TabsTrigger value="management" className="rounded-xl px-8 py-3 font-black text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> TACTICAL OVERVIEW
              </TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-xl px-8 py-3 font-black text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> IMPACT ANALYTICS
              </TabsTrigger>
              <TabsTrigger value="moderation" className="rounded-xl px-8 py-3 font-black text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> SECURITY AUDIT
              </TabsTrigger>
            </TabsList>

            <TabsContent value="management" className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input placeholder="Search Tactical Database..." className="pl-12 h-14 rounded-2xl border-slate-800 bg-slate-900/50 text-white font-bold placeholder:text-slate-600" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <select className="bg-slate-900/50 border border-slate-800 rounded-2xl px-6 h-14 text-xs font-black text-slate-400 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="All">ALL STATUS</option>
                  <option value="Pending">PENDING</option>
                  <option value="In Progress">IN ACTION</option>
                  <option value="Completed">WORKER FINISHED</option>
                  <option value="Resolved">RESOLVED</option>
                </select>
              </div>

              <div className="grid gap-6 overflow-y-auto max-h-[calc(100vh-350px)] pr-2 custom-scrollbar">
                {filteredIssues.map(issue => (
                  <Card key={issue.id} className="bg-slate-900/80 border-slate-800 shadow-2xl rounded-[2.5rem] overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
                    <CardContent className="p-8">
                      <div className="flex flex-col xl:flex-row gap-8">
                        <div className="flex-1 space-y-6">
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge className={`rounded-lg px-3 py-1 font-black text-[10px] uppercase tracking-widest ${issue.priority === 'High' ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' : 'bg-slate-800 text-slate-400'}`}>
                              {issue.priority} PRIORITY
                            </Badge>
                            <Badge className={`rounded-lg font-black text-[10px] uppercase tracking-widest ${issue.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : issue.status === 'Completed' ? 'bg-sky-500/20 text-sky-500 border border-sky-500/30' : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'}`}>
                              {issue.status}
                            </Badge>
                            <span className="text-[10px] font-mono text-slate-600 ml-auto">ID: {issue.id}</span>
                          </div>
                          
                          <div>
                            <h3 className="font-black text-2xl text-white tracking-tight mb-2">{issue.title}</h3>
                            <p className="text-slate-400 font-medium leading-relaxed text-sm">{issue.description}</p>
                          </div>

                          <div className="flex items-center gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <div className="flex items-center gap-2"><MapPin className="w-3 h-3 text-emerald-500" /> {issue.location.address.split(',')[0]}</div>
                            <div className="flex items-center gap-2"><Clock className="w-3 h-3 text-emerald-500" /> {new Date(issue.createdAt).toLocaleDateString()}</div>
                            <div className="flex items-center gap-2"><Users className="w-3 h-3 text-emerald-500" /> {issue.upvotes?.length || 0} SUPPORTERS</div>
                          </div>

                          {issue.workerReport && (
                            <div className="bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10 space-y-3">
                              <h4 className="font-black text-emerald-500 flex items-center gap-2 text-xs uppercase tracking-widest">
                                <ClipboardCheck className="w-4 h-4" /> Field Report Received
                              </h4>
                              <p className="text-slate-300 text-sm font-medium italic">"{issue.workerReport.notes}"</p>
                            </div>
                          )}
                        </div>

                        <div className="xl:w-72 space-y-4">
                          <div className="bg-slate-800/30 p-6 rounded-3xl border border-slate-700/30 space-y-4">
                            {issue.status === 'Pending' && (
                              <div className="space-y-3">
                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Deploy Personnel</Label>
                                <select 
                                  className="w-full h-12 rounded-xl border-slate-700 bg-slate-900 text-xs font-bold px-4 text-white outline-none focus:ring-2 focus:ring-emerald-500"
                                  onChange={(e) => handleAssign(issue.id, e.target.value)}
                                  value={issue.workerId || ""}
                                >
                                  <option value="" disabled>SELECT WORKER</option>
                                  {workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.department})</option>)}
                                </select>
                              </div>
                            )}

                            {issue.status === 'Completed' && (
                              <Button className="w-full rounded-xl h-14 font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-900/20" onClick={() => handleVerify(issue.id)}>
                                <CheckCircle className="mr-2 w-5 h-5" /> VERIFY & RESOLVE
                              </Button>
                            )}

                            {issue.status === 'In Progress' && (
                              <div className="text-center py-4 space-y-3">
                                <div className="relative inline-block">
                                  <HardHat className="w-10 h-10 text-amber-500 animate-bounce" />
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personnel On-Site</p>
                                <p className="text-xs font-bold text-white">{workers.find(w => w.id === issue.workerId)?.name}</p>
                              </div>
                            )}

                            {issue.status !== 'Resolved' && issue.status !== 'Flagged' && (
                              <Button variant="outline" className="w-full rounded-xl h-12 font-black border-slate-700 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/50" onClick={() => handleStatusUpdate(issue.id, 'Flagged')}>
                                <Trash2 className="mr-2 w-4 h-4" /> INVALIDATE
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 border-slate-800 rounded-3xl p-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest">Resolution Velocity</CardTitle>
                  </CardHeader>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.monthlyTrends}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '12px' }} />
                        <Area type="monotone" dataKey="count" stroke="#10b981" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800 rounded-3xl p-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest">Category Distribution</CardTitle>
                  </CardHeader>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="moderation" className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-800 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-800">
                  <CardTitle className="text-xl font-black text-white flex items-center gap-3">
                    <ShieldAlert className="w-6 h-6 text-rose-500" /> Community Trust Audit
                  </CardTitle>
                  <CardDescription className="text-slate-500">Review flagged content and manage user credibility scores.</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  {reportedIssues.length === 0 ? (
                    <div className="text-center py-20">
                      <CheckCircle className="w-16 h-16 text-emerald-500/20 mx-auto mb-4" />
                      <p className="text-slate-500 font-bold">No security flags detected in the current cycle.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reportedIssues.map(issue => (
                        <div key={issue.id} className="flex items-center justify-between p-6 bg-slate-800/30 rounded-3xl border border-slate-700/30">
                          <div className="space-y-1">
                            <p className="font-black text-white">{issue.title}</p>
                            <p className="text-xs text-rose-500 font-bold uppercase tracking-widest">{issue.reports.length} Security Flags Raised</p>
                          </div>
                          <div className="flex gap-3">
                            <Button variant="outline" className="rounded-xl border-slate-700 text-slate-400 hover:text-white" onClick={() => issueService.dismissReports(issue.id)}>DISMISS</Button>
                            <Button className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black" onClick={() => issueService.confirmReport(issue.id, 'Admin')}>PENALIZE USER</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Global View & Top Performers */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <Card className="bg-slate-900/50 border-slate-800 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-500" /> Global Operations Map
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="rounded-2xl overflow-hidden border-2 border-slate-800 shadow-lg h-[300px]">
                <IssueMapOverview issues={issues.filter(i => i.status !== 'Flagged')} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" /> Top Community Heroes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {mockDb.users.filter(u => u.role === 'citizen').sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 5).map((u, i) => (
                <div key={u.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-black text-[10px] text-emerald-500 border border-emerald-500/20">
                      {i + 1}
                    </div>
                    <span className="font-bold text-xs text-slate-300">{u.name}</span>
                  </div>
                  <Badge variant="outline" className="font-black text-[10px] border-emerald-500/20 text-emerald-500">{u.points || 0} PTS</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-500">
              <Shield className="w-5 h-5" />
              <span className="font-black text-sm uppercase tracking-tighter">Security Status</span>
            </div>
            <p className="text-[10px] text-emerald-200/70 font-medium leading-relaxed">
              All systems operational. End-to-end encryption active. Citizen data anonymized for analytics.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;