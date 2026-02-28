import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { mockDb } from '@/backend/db';
import { issueService } from '@/backend/services/issueService';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { 
  HardHat, MapPin, Clock, CheckCircle, Camera, LogOut, 
  ClipboardList, Navigation, Activity, ShieldCheck, 
  Wrench, Zap, AlertTriangle, Thermometer, Signal,
  Timer, Briefcase, UserCheck, Code2, X
} from 'lucide-react';
import Footer from '@/components/Footer';

const WorkerDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [reportNotes, setReportNotes] = useState('');
  const [completionImageUrl, setCompletionImageUrl] = useState('');
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [shiftTime, setShiftTime] = useState(0);
  const [safetyChecklist, setSafetyChecklist] = useState({
    ppe: false,
    areaCordoned: false,
    toolsInspected: false,
    powerIsolated: false
  });
  
  const timerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('current_user');
    if (!storedUser) return navigate('/login');
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'worker') return navigate('/login');
    setUser(parsedUser);
    refreshTasks(parsedUser.id);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const refreshTasks = (workerId: string) => {
    const myTasks = mockDb.issues.filter(i => i.workerId === workerId && i.status !== 'Resolved');
    setTasks(myTasks);
  };

  const handleClockToggle = () => {
    if (!isClockedIn) {
      setIsClockedIn(true);
      timerRef.current = setInterval(() => {
        setShiftTime(prev => prev + 1);
      }, 1000);
      showSuccess("Shift started.");
    } else {
      setIsClockedIn(false);
      if (timerRef.current) clearInterval(timerRef.current);
      showSuccess(`Shift ended.`);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompletionImageUrl(reader.result as string);
        showSuccess("Photo attached successfully.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    
    const allSafetyChecked = Object.values(safetyChecklist).every(v => v);
    if (!allSafetyChecked) {
      showError("Please complete the safety checklist.");
      return;
    }

    issueService.submitWorkerReport(selectedTask.id, {
      submittedAt: new Date().toISOString(),
      notes: reportNotes,
      imageUrl: completionImageUrl
    });

    showSuccess("Report sent for verification.");
    setSelectedTask(null);
    setReportNotes('');
    setCompletionImageUrl('');
    setSafetyChecklist({ ppe: false, areaCordoned: false, toolsInspected: false, powerIsolated: false });
    refreshTasks(user.id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0F172A] text-slate-200">
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-amber-500 p-2.5 rounded-xl shadow-lg shadow-amber-500/20 animate-pulse">
              <HardHat className="text-slate-900 w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tighter text-white">CITYCARE <span className="text-amber-500">OPS</span></h1>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase">Shift Duration</p>
                <p className="text-xl font-mono font-bold text-amber-500">{formatTime(shiftTime)}</p>
              </div>
              <Button 
                onClick={handleClockToggle}
                className={`rounded-xl font-black px-6 h-12 transition-all ${isClockedIn ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
              >
                {isClockedIn ? 'CLOCK OUT' : 'CLOCK IN'}
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white">{user?.name}</p>
                <p className="text-[10px] font-bold text-amber-500 uppercase">{user?.department}</p>
              </div>
              <Button onClick={() => { localStorage.removeItem('current_user'); navigate('/login'); }} variant="ghost" className="rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 grid grid-cols-12 gap-6 flex-1 w-full">
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <Card className="bg-slate-900/50 border-slate-800 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" /> Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Efficiency Rating</span>
                  <span className="text-emerald-500">94%</span>
                </div>
                <Progress value={94} className="h-1.5 bg-slate-800" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-amber-500" /> Active Assignments
            </h2>
            <Badge className="bg-slate-800 text-slate-400 border-slate-700">{tasks.length} Tasks</Badge>
          </div>
          
          <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-250px)] pr-2 custom-scrollbar">
            {tasks.map(task => (
              <Card 
                key={task.id} 
                className={`border-none shadow-xl rounded-3xl cursor-pointer transition-all duration-300 group ${selectedTask?.id === task.id ? 'bg-amber-500 ring-4 ring-amber-500/20' : 'bg-slate-900/80 hover:bg-slate-800'}`}
                onClick={() => setSelectedTask(task)}
              >
                <CardContent className="p-6 space-y-4">
                  <Badge className={selectedTask?.id === task.id ? 'bg-slate-900 text-white' : task.priority === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-400'}>
                    {task.priority} PRIORITY
                  </Badge>
                  <h3 className={`font-black text-lg leading-tight ${selectedTask?.id === task.id ? 'text-slate-900' : 'text-white'}`}>{task.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5">
          {selectedTask ? (
            <Card className="bg-slate-900 border-slate-800 shadow-2xl rounded-[2.5rem] overflow-hidden h-full flex flex-col">
              <CardHeader className="bg-slate-800/50 p-8 border-b border-slate-700/50">
                <CardTitle className="text-3xl font-black text-white tracking-tighter">{selectedTask.title}</CardTitle>
                <CardDescription className="text-slate-400 font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500" /> {selectedTask.location.address}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                  <div className="bg-slate-800/50 p-5 rounded-3xl border border-slate-700/50">
                    <p className="text-slate-300 text-sm font-medium leading-relaxed">{selectedTask.description}</p>
                  </div>
                  
                  <div className="bg-slate-800/30 p-6 rounded-3xl border border-slate-700/30 space-y-4">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Safety Protocol Checklist</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'ppe', label: 'Personal Protective Equipment' },
                        { id: 'areaCordoned', label: 'Area Cordoned Off' },
                        { id: 'toolsInspected', label: 'Tools & Equipment Inspected' },
                        { id: 'powerIsolated', label: 'Power/Utility Isolated' }
                      ].map((item) => (
                        <div 
                          key={item.id} 
                          className={cn(
                            "flex items-center space-x-3 p-4 rounded-2xl border transition-all cursor-pointer",
                            (safetyChecklist as any)[item.id] 
                              ? "bg-emerald-500/10 border-emerald-500/50" 
                              : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                          )}
                          onClick={() => setSafetyChecklist(prev => ({ ...prev, [item.id]: !(prev as any)[item.id] }))}
                        >
                          <Checkbox 
                            id={item.id} 
                            checked={(safetyChecklist as any)[item.id]}
                            onCheckedChange={(checked) => setSafetyChecklist(prev => ({ ...prev, [item.id]: !!checked }))}
                            className="border-slate-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 h-5 w-5 rounded-md"
                          />
                          <label 
                            htmlFor={item.id} 
                            className={cn(
                              "text-xs font-black cursor-pointer transition-colors uppercase tracking-wider",
                              (safetyChecklist as any)[item.id] ? "text-emerald-400" : "text-slate-400"
                            )}
                          >
                            {item.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSubmitReport} className="space-y-6 bg-slate-800/50 p-8 rounded-[2rem] border border-slate-700/50">
                    <Textarea 
                      required 
                      placeholder="Technical Notes..." 
                      className="min-h-[180px] rounded-2xl border-slate-700 bg-slate-900 text-white"
                      value={reportNotes}
                      onChange={e => setReportNotes(e.target.value)}
                      disabled={!isClockedIn}
                    />
                    
                    {completionImageUrl && (
                      <div className="relative w-full h-48 rounded-2xl overflow-hidden border-2 border-slate-700 group">
                        <img src={completionImageUrl} alt="Completion" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setCompletionImageUrl('')}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleImageUpload} 
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full rounded-2xl h-16 border-dashed border-2 border-slate-700 hover:border-amber-500 hover:bg-amber-500/5" 
                        disabled={!isClockedIn}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="mr-2 w-5 h-5" /> {completionImageUrl ? 'CHANGE PHOTO' : 'UPLOAD PHOTO'}
                      </Button>
                    </div>

                    <Button type="submit" className="w-full h-16 rounded-2xl font-black text-lg bg-emerald-600 hover:bg-emerald-700" disabled={!isClockedIn}>
                      SUBMIT MISSION
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-32 bg-slate-900/30 rounded-[3rem] border-4 border-dashed border-slate-800/50">
              <Briefcase className="w-24 h-24 text-slate-800" />
              <h3 className="text-xl font-black text-slate-600 mt-6 uppercase tracking-[0.3em]">Awaiting Assignment</h3>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WorkerDashboard;