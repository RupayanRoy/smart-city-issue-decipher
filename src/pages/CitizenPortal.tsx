import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { mockDb } from '@/backend/db';
import { issueService } from '@/backend/services/issueService';
import { showSuccess } from '@/utils/toast';
import { Plus, MapPin, Clock, AlertCircle, LogOut } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const CitizenPortal = () => {
  const [user, setUser] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    lat: 40.7128,
    lng: -74.0060
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('current_user');
    if (!storedUser) return navigate('/login');
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setIssues(mockDb.issues.filter(i => i.citizenId === parsedUser.id));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newIssue = issueService.createIssue(user.id, {
      title: formData.title,
      description: formData.description,
      location: { address: formData.address, lat: formData.lat, lng: formData.lng }
    });
    setIssues([newIssue, ...issues]);
    setShowForm(false);
    setFormData({ title: '', description: '', address: '', lat: 40.7128, lng: -74.0060 });
    showSuccess('Issue reported successfully! AI has categorized your request.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Citizen Portal</h1>
            <p className="text-slate-500">Welcome back, {user?.name}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
              {showForm ? 'Cancel' : <><Plus className="mr-2 w-4 h-4" /> Report Issue</>}
            </Button>
            <Button variant="ghost" onClick={() => { localStorage.removeItem('current_user'); navigate('/login'); }}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {showForm && (
          <Card className="border-none shadow-lg animate-in fade-in slide-in-from-top-4">
            <CardHeader>
              <CardTitle>Report New Issue</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Issue Title</Label>
                  <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Large pothole on Main St" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe the issue in detail. AI will automatically detect category and priority." />
                </div>
                <div className="space-y-2">
                  <Label>Location Address</Label>
                  <Input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="123 Main St, Downtown" />
                </div>
                <Button type="submit" className="w-full">Submit Report</Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          <h2 className="text-xl font-semibold">Your Reported Issues</h2>
          {issues.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400">No issues reported yet.</p>
            </div>
          ) : (
            issues.map(issue => (
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
      </div>
    </div>
  );
};

export default CitizenPortal;