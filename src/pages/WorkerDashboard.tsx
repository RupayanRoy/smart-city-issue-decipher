import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { mockDb } from '@/backend/db';
import { issueService } from '@/backend/services/issueService';
import { showSuccess } from '@/utils/toast';
import { HardHat, MapPin, Clock, CheckCircle, Camera, LogOut, ClipboardList, Navigation } from 'lucide-react';
import Footer from '@/components/Footer';

const WorkerDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [reportNotes, setReportNotes] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('current_user');
    if (!storedUser) return navigate('/login');
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'worker') return navigate('/login');
    setUser(parsedUser);
    refreshTasks(parsedUser.id);
  }, []);

  const refreshTasks = (workerId: string) => {
    const myTasks = mockDb.issues.filter(i => i.workerId === workerId && i.status !== 'Resolved');
    setTasks(myTasks);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    issueService.submitWorkerReport(selectedTask.id, {
      submittedAt: new Date().toISOString(),
      notes: reportNotes
    });

    showSuccess("Report submitted! Waiting for admin verification.");
    setSelectedTask(null);
    setReportNotes('');
    refreshTasks(user.id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-amber-500 p-2.5 rounded-xl">
              <HardHat className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tight">CityCare Field</h1>
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Worker Terminal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold">{user?.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{user?.department}</p>
            </div>
            <Button onClick={() => { localStorage.removeItem('current_user'); navigate('/login'); }} variant="ghost" className="rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 space-y-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-amber-500" /> My Active Tasks
            </h2>
            <div className="space-y-4">
              {tasks.length === 0 ? (
                <Card className="border-none shadow-sm rounded-3xl p-8 text-center">
                  <p className="text-slate-400 font-bold">No active tasks assigned.</p>
                </Card>
              ) : (
                tasks.map(task => (
                  <Card 
                    key={task.id} 
                    className={`border-none shadow-sm rounded-3xl cursor-pointer transition-all hover:scale-[1.02] ${selectedTask?.id === task.id ? 'ring-2 ring-amber-500 bg-amber-50' : 'bg-white'}`}
                    onClick={() => setSelectedTask(task)}
                  >
                    <CardContent className="p-6 space-y-3">
                      <div className="flex justify-between items-start">
                        <Badge className={task.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}>
                          {task.priority}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] uppercase font-black">
                          {task.status}
                        </Badge>
                      </div>
                      <h3 className="font-black text-slate-900">{task.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                        <MapPin className="w-3 h-3" /> {task.location.address.split(',')[0]}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedTask ? (
              <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white animate-in fade-in slide-in-from-right-8 duration-500">
                <CardHeader className="bg-slate-50 p-8 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl font-black text-slate-900">{selectedTask.title}</CardTitle>
                      <CardDescription className="font-medium mt-1">{selectedTask.location.address}</CardDescription>
                    </div>
                    <Button variant="outline" className="rounded-xl font-bold" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedTask.location.lat},${selectedTask.location.lng}`)}>
                      <Navigation className="mr-2 w-4 h-4" /> Navigate
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Label className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Issue Description</Label>
                      <p className="text-slate-600 font-medium leading-relaxed">{selectedTask.description}</p>
                      {selectedTask.imageUrl && (
                        <div className="rounded-2xl overflow-hidden border-4 border-slate-50 shadow-lg">
                          <img src={selectedTask.imageUrl} alt="Issue" className="w-full h-48 object-cover" />
                        </div>
                      )}
                    </div>
                    
                    <form onSubmit={handleSubmitReport} className="space-y-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <h4 className="font-black text-slate-900 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500" /> Completion Report
                      </h4>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500">Work Notes</Label>
                        <Textarea 
                          required 
                          placeholder="Describe what was fixed and any follow-up needed..." 
                          className="min-h-[120px] rounded-2xl border-slate-200 bg-white"
                          value={reportNotes}
                          onChange={e => setReportNotes(e.target.value)}
                          disabled={selectedTask.status === 'Completed'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500">Proof of Work (Optional)</Label>
                        <div className="flex items-center gap-4">
                          <Button type="button" variant="outline" className="w-full rounded-xl h-12 border-dashed border-2" disabled={selectedTask.status === 'Completed'}>
                            <Camera className="mr-2 w-4 h-4" /> Upload Photo
                          </Button>
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full h-14 rounded-2xl font-black bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100"
                        disabled={selectedTask.status === 'Completed'}
                      >
                        {selectedTask.status === 'Completed' ? 'Report Submitted' : 'Submit for Verification'}
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border-4 border-dashed border-slate-200">
                <ClipboardList className="w-16 h-16 text-slate-200 mb-4" />
                <p className="text-slate-400 font-black uppercase tracking-widest">Select a task to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WorkerDashboard;