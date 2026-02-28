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
import { 
  HardHat, MapPin, Clock, CheckCircle, Camera, LogOut, 
  ClipboardList, Navigation, Activity, ShieldCheck, 
  Wrench, Zap, AlertTriangle, Thermometer, Signal,
  Timer, BarChart3, Briefcase, UserCheck, Code2
} from 'lucide-react';
import Footer from '@/components/Footer';

const WorkerDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [reportNotes, setReportNotes] = useState('');
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [shiftTime, setShiftTime] = useState(0);
  const [safetyChecklist, setSafetyChecklist] = useState({
    ppe: false,
    areaCordoned: false,
    toolsInspected: false,
    powerIsolated: false
  });
  
  const timerRef = useRef<any>(null);
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
      showSuccess("Shift started. Stay safe out there!");
    } else {
      setIsClockedIn(false);
      if (timerRef.current) clearInterval(timerRef.current);
      showSuccess(`Shift ended. Total time: ${formatTime(shiftTime)}`);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    
    const allSafetyChecked = Object.values(safetyChecklist).every(v => v);
    if (!allSafetyChecked) {
      showError("Please complete the mandatory safety checklist first.");
      return;
    }

    issueService.submitWorkerReport(selectedTask.id, {
      submittedAt: new Date().toISOString(),
      notes: reportNotes
    });

    showSuccess("Mission accomplished! Report sent for admin verification.");
    setSelectedTask(null);
    setReportNotes('');
    setSafetyChecklist({ ppe: false, areaCordoned: false, toolsInspected: false, powerIsolated: false });
    refreshTasks(user.id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0F172A] text-slate-200">
      {/* High-Tech Header */}
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-amber-500 p-2.5 rounded-xl shadow-lg shadow-amber-500/20 animate-pulse">
              <HardHat className="text-slate-900 w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tighter text-white">CITYCARE <span className="text-amber-500">OPS</span></h1>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Terminal Active // Node: {user?.department?.toUpperCase()}</p>
              </div>
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
            
            <div className="h-10 w-px bg-slate-800" />
            
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
        {/* Left Column: Stats & Inventory */}
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
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Safety Score</span>
                  <span className="text-amber-500">88%</span>
                </div>
                <Progress value={88} className="h-1.5 bg-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50">
                  <p className="text-[10px] font-black text-slate-500 uppercase">Completed</p>
                  <p className="text-xl font-black text-white">12</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50">
                  <p className="text-[10px] font-black text-slate-500 uppercase">Pending</p>
                  <p className="text-xl font-black text-white">{tasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Wrench className="w-4 h-4 text-sky-500" /> Equipment Inventory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Standard Toolkit', status: 'Ready', icon: Wrench },
                { name: 'Safety Harness', status: 'Inspected', icon: ShieldCheck },
                { name: 'Voltage Tester', status: 'Calibrated', icon: Zap },
                { name: 'Area Cones (x6)', status: 'In Vehicle', icon: AlertTriangle }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-300">{item.name}</span>
                  </div>
                  <Badge variant="outline" className="text-[8px] border-slate-700 text-slate-500">{item.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-black text-sm uppercase tracking-tighter">Weather Advisory</span>
            </div>
            <p className="text-xs text-amber-200/70 font-medium leading-relaxed">
              High humidity detected (82%). Ensure all electrical components are properly sealed before completion.
            </p>
          </div>
        </div>

        {/* Middle Column: Task List */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-amber-500" /> Active Assignments
            </h2>
            <Badge className="bg-slate-800 text-slate-400 border-slate-700">{tasks.length} Tasks</Badge>
          </div>
          
          <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-250px)] pr-2 custom-scrollbar">
            {tasks.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/30 rounded-[2.5rem] border-2 border-dashed border-slate-800">
                <UserCheck className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">All clear! No pending tasks.</p>
              </div>
            ) : (
              tasks.map(task => (
                <Card 
                  key={task.id} 
                  className={`border-none shadow-xl rounded-3xl cursor-pointer transition-all duration-300 group ${selectedTask?.id === task.id ? 'bg-amber-500 ring-4 ring-amber-500/20' : 'bg-slate-900/80 hover:bg-slate-800'}`}
                  onClick={() => setSelectedTask(task)}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <Badge className={selectedTask?.id === task.id ? 'bg-slate-900 text-white' : task.priority === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-400'}>
                        {task.priority} PRIORITY
                      </Badge>
                      <div className="flex gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${task.status === 'In Progress' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                      </div>
                    </div>
                    <div>
                      <h3 className={`font-black text-lg leading-tight ${selectedTask?.id === task.id ? 'text-slate-900' : 'text-white'}`}>{task.title}</h3>
                      <div className={`flex items-center gap-2 text-xs font-bold mt-2 ${selectedTask?.id === task.id ? 'text-slate-800' : 'text-slate-500'}`}>
                        <MapPin className="w-3 h-3" /> {task.location.address.split(',')[0]}
                      </div>
                    </div>
                    <div className={`flex items-center justify-between pt-4 border-t ${selectedTask?.id === task.id ? 'border-slate-900/10' : 'border-slate-800'}`}>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${selectedTask?.id === task.id ? 'text-slate-800' : 'text-slate-500'}`}>ID: {task.id}</span>
                      <Navigation className={`w-4 h-4 ${selectedTask?.id === task.id ? 'text-slate-900' : 'text-slate-500'}`} />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Task Execution Terminal */}
        <div className="col-span-12 lg:col-span-5">
          {selectedTask ? (
            <Card className="bg-slate-900 border-slate-800 shadow-2xl rounded-[2.5rem] overflow-hidden h-full flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
              <CardHeader className="bg-slate-800/50 p-8 border-b border-slate-700/50">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-500 text-slate-900 font-black">TASK EXECUTION</Badge>
                      <span className="text-slate-500 font-mono text-xs">v2.4.0</span>
                    </div>
                    <CardTitle className="text-3xl font-black text-white tracking-tighter">{selectedTask.title}</CardTitle>
                    <CardDescription className="text-slate-400 font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-500" /> {selectedTask.location.address}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    className="rounded-2xl h-14 px-6 font-black border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedTask.location.lat},${selectedTask.location.lng}`)}
                  >
                    <Navigation className="mr-2 w-5 h-5 text-amber-500" /> NAVIGATE
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Mission Briefing</Label>
                      <div className="bg-slate-800/50 p-5 rounded-3xl border border-slate-700/50">
                        <p className="text-slate-300 text-sm font-medium leading-relaxed">{selectedTask.description}</p>
                      </div>
                    </div>
                    
                    {selectedTask.imageUrl && (
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Site Intelligence</Label>
                        <div className="rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl group relative">
                          <img src={selectedTask.imageUrl} alt="Issue" className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-4">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Initial Report Photo</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-slate-800/30 p-5 rounded-3xl border border-slate-700/30 space-y-4">
                      <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Mandatory Safety Protocol</Label>
                      <div className="space-y-3">
                        {[
                          { id: 'ppe', label: 'Full PPE Gear Equipped' },
                          { id: 'areaCordoned', label: 'Work Area Cordoned Off' },
                          { id: 'toolsInspected', label: 'Tools Pre-Inspection Complete' },
                          { id: 'powerIsolated', label: 'Power/Water Source Isolated' }
                        ].map((item) => (
                          <div key={item.id} className="flex items-center space-x-3">
                            <Checkbox 
                              id={item.id} 
                              checked={(safetyChecklist as any)[item.id]}
                              onCheckedChange={(checked) => setSafetyChecklist(prev => ({ ...prev, [item.id]: !!checked }))}
                              className="border-slate-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                            />
                            <label htmlFor={item.id} className="text-xs font-bold text-slate-400 cursor-pointer select-none">{item.label}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <form onSubmit={handleSubmitReport} className="space-y-6 bg-slate-800/50 p-8 rounded-[2rem] border border-slate-700/50 shadow-inner">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-white flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-emerald-500" /> MISSION REPORT
                        </h4>
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 text-[8px]">ENCRYPTED</Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Technical Notes</Label>
                        <Textarea 
                          required 
                          placeholder="Enter detailed resolution steps, parts used, and follow-up requirements..." 
                          className="min-h-[180px] rounded-2xl border-slate-700 bg-slate-900 text-white focus:ring-amber-500 placeholder:text-slate-600"
                          value={reportNotes}
                          onChange={e => setReportNotes(e.target.value)}
                          disabled={!isClockedIn}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Evidence Capture</Label>
                        <Button type="button" variant="outline" className="w-full rounded-2xl h-16 border-dashed border-2 border-slate-700 bg-slate-900/50 text-slate-500 hover:text-white hover:border-slate-500 transition-all" disabled={!isClockedIn}>
                          <Camera className="mr-2 w-5 h-5" /> UPLOAD COMPLETION PHOTO
                        </Button>
                      </div>

                      {!isClockedIn ? (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
                          <p className="text-xs font-bold text-red-400">You must CLOCK IN to submit reports.</p>
                        </div>
                      ) : (
                        <Button 
                          type="submit" 
                          className="w-full h-16 rounded-2xl font-black text-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-900/20 transition-all transform hover:-translate-y-1"
                        >
                          FINALIZE & SUBMIT MISSION
                        </Button>
                      )}
                    </form>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/30 text-center">
                        <Thermometer className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                        <p className="text-[8px] font-black text-slate-500 uppercase">Temp</p>
                        <p className="text-xs font-bold text-white">28°C</p>
                      </div>
                      <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/30 text-center">
                        <Signal className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                        <p className="text-[8px] font-black text-slate-500 uppercase">Signal</p>
                        <p className="text-xs font-bold text-white">Strong</p>
                      </div>
                      <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/30 text-center">
                        <Timer className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                        <p className="text-[8px] font-black text-slate-500 uppercase">Uptime</p>
                        <p className="text-xs font-bold text-white">99.9%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-32 bg-slate-900/30 rounded-[3rem] border-4 border-dashed border-slate-800/50">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500 blur-3xl opacity-10 animate-pulse" />
                <Briefcase className="w-24 h-24 text-slate-800 relative z-10" />
              </div>
              <h3 className="text-xl font-black text-slate-600 mt-6 uppercase tracking-[0.3em]">Awaiting Assignment</h3>
              <p className="text-slate-700 font-bold mt-2">Select a mission from the terminal to begin execution.</p>
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-slate-900/80 border-t border-slate-800 py-12 px-8 mt-auto">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Ops Status: Nominal</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-amber-500" />
              <span>Safety Protocol: Active</span>
            </div>
            <div className="flex items-center gap-2">
              <Signal className="w-3 h-3 text-amber-500" />
              <span>Field Comms: Encrypted</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-800/30 px-6 py-3 rounded-2xl border border-slate-700/30">
            <Code2 className="w-4 h-4 text-amber-500" />
            <span>Built by <span className="text-amber-500">Deploy & Pray</span></span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-600">Field Node: v4.2.0-Stable</span>
            <div className="h-4 w-px bg-slate-800" />
            <span className="text-amber-500/50">© 2024 CityCare Operations</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WorkerDashboard;