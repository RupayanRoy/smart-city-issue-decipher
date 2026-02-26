import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockDb } from '@/backend/db';
import { issueService } from '@/backend/services/issueService';
import { showSuccess } from '@/utils/toast';
import { Plus, MapPin, Clock, AlertCircle, LogOut, Search, User as UserIcon, Bell } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import LocationPicker from '@/components/LocationPicker';

const CitizenPortal = () => {
  const [user, setUser] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    lat: 12.8406,
    lng: 80.1534
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('current_user');
    if (!storedUser) return navigate('/login');
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    refreshIssues(parsedUser.id);
  }, []);

  const refreshIssues = (userId: string) => {
    setIssues(mockDb.issues.filter(i => i.citizenId === userId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newIssue = issueService.createIssue(user.id, {
      title: formData.title,
      description: formData.description,
      location: { address: formData.address, lat: formData.lat, lng: formData.lng }
    });
    refreshIssues(user.id);
    setShowForm(false);
    setFormData({ title: '', description: '', address: '', lat: 12.8406, lng: 80.1534 });
    showSuccess('Issue reported successfully! AI has categorized your request.');
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         issue.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || issue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary w-8 h-8 rounded-lg flex items-center justify-center">
              <Plus className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl">SmartCity</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon"><Bell className="w-5 h-5 text-slate-500" /></Button>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-slate-500">Citizen Account</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { localStorage.removeItem('current_user'); navigate('/login'); }}>
                <LogOut className="w-5 h-5 text-slate-500" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <Tabs defaultValue="issues" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="issues">My Issues</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="issues" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Search your issues..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <select 
                  className="bg-white border rounded-md px-3 text-sm"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <Button onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cancel' : <><Plus className="mr-2 w-4 h-4" /> Report New Issue</>}
              </Button>
            </div>

            {showForm && (
              <Card className="border-none shadow-lg animate-in fade-in slide-in-from-top-4">
                <CardHeader>
                  <CardTitle>Report New Issue</CardTitle>
                  <CardDescription>Pin the exact location on the map and provide details.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Issue Title</Label>
                          <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Large pothole on Main St" />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea required className="min-h-[120px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe the issue in detail..." />
                        </div>
                        <div className="space-y-2">
                          <Label>Location Address</Label>
                          <Input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="123 Main St, Downtown" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Pin Location on Map</Label>
                        <LocationPicker 
                          lat={formData.lat} 
                          lng={formData.lng} 
                          onChange={(lat, lng) => setFormData({...formData, lat, lng})} 
                        />
                        <p className="text-xs text-slate-400">Coordinates: {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}</p>
                      </div>
                    </div>
                    <Button type="submit" className="w-full py-6 text-lg">Submit Report</Button>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {filteredIssues.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400">No issues found matching your criteria.</p>
                </div>
              ) : (
                filteredIssues.map(issue => (
                  <Card key={issue.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg">{issue.title}</h3>
                            <Badge variant="secondary">{issue.category}</Badge>
                            {issue.escalated && <Badge className="bg-red-100 text-red-800 border-none">Escalated</Badge>}
                          </div>
                          <p className="text-slate-600 text-sm line-clamp-2">{issue.description}</p>
                        </div>
                        <Badge className={getStatusColor(issue.status)}>{issue.status}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" /> {issue.location.address}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> {format(parseISO(issue.createdAt), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertCircle className={`w-4 h-4 ${issue.priority === 'High' ? 'text-red-500' : 'text-slate-400'}`} /> 
                          Priority: {issue.priority}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="border-none shadow-sm">
              <CardHeader><CardTitle>Recent Updates</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {issues.flatMap(i => i.statusHistory.map((h: any) => ({ ...h, issueTitle: i.title }))).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((activity, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">
                          Issue "<span className="text-primary">{activity.issueTitle}</span>" marked as <span className="font-bold">{activity.status}</span>
                        </p>
                        <p className="text-xs text-slate-500">{format(parseISO(activity.timestamp), 'MMM d, yyyy HH:mm')} • Updated by {activity.updatedBy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="border-none shadow-sm max-w-2xl">
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your personal information and account security.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{user?.name}</h4>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                  </div>
                </div>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input defaultValue={user?.name} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input defaultValue={user?.email} disabled />
                  </div>
                  <Button className="w-fit">Update Profile</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CitizenPortal;