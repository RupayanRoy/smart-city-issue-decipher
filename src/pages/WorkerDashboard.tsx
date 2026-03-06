"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { mockDb } from '@/backend/db';
import { issueService } from '@/backend/services/issueService';
import { supplyService } from '@/backend/services/supplyService';
import { showSuccess, showError } from '@/utils/toast';
import { ThemeToggle } from '@/components/theme-toggle';
import SettingsDialog from '@/components/SettingsDialog';
import SupplyRequestDialog from '@/components/worker/SupplyRequestDialog';
import { cn } from '@/lib/utils';
import { 
  HardHat, MapPin, Clock, CheckCircle, Camera, LogOut, 
  ClipboardList, Navigation, Activity, ShieldCheck, 
  Wrench, Zap, AlertTriangle, Thermometer, Signal,
  Timer, Briefcase, UserCheck, Code2, X, History, Package, Truck
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
  const [supplyRequests, setSupplyRequests] = useState<any[]>([]);
  const [usedSupplies, setUsedSupplies] = useState<Record<string, number>>({});
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
    
    // Get fresh user data from DB to have latest inventory
    const dbUser = mockDb.users.find(u => u.id === parsedUser.id);
    setUser(dbUser);
    refreshData(parsedUser.id);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const refreshData = (workerId: string) => {
    const myTasks = mockDb.issues.filter(i => i.workerId === workerId && i.status !== 'Resolved');
    setTasks(myTasks);
    setSupplyRequests(supplyService.getRequests().filter(r => r.workerId === workerId));
    const dbUser = mockDb.users.find(u => u.id === workerId);
    setUser(dbUser);
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

    // Process supply usage
    const itemsUsed = Object.entries(usedSupplies)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({ supplyId: id, quantity: qty }));

    // Deduct from worker inventory
    supplyService.useSupplies(user.id, itemsUsed);

    // Submit the report with usage data
    issueService.submitWorkerReport(selectedTask.id, {
      submittedAt: new Date().toISOString(),
      notes: reportNotes,
      imageUrl: completionImageUrl,
      usedSupplies: itemsUsed
    });

    showSuccess("Report sent for verification.");
    setSelectedTask(null);
    setReportNotes('');
    setCompletionImageUrl('');
    setUsedSupplies({});
    setSafetyChecklist({ ppe: false, areaCordoned: false, toolsInspected: false, powerIsolated: false });
    refreshData(user.id);
  };

  const activeTasks = tasks.filter(t => t.status === 'In Progress' || t.status === 'Pending');
  const completedTasks = tasks.filter(t => t.status === 'Completed');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-200 transition-colors duration-300">
      <header className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-amber-500 p-2.5 rounded-xl shadow-lg shadow-amber-500/20 animate-pulse">
              <HardHat className="text-white dark:text-slate-900 w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tighter text-slate-900 dark:text-white">CITYCARE <span className="text-amber-500">OPS</span></h1>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase">Shift Duration</p>
                <p className="text-xl font-mono font-bold text-amber-600 dark:text-amber-500">{formatTime(shiftTime)}</p>
              </div>
              <Button 
                onClick={handleClockToggle}
                className={`rounded-xl font-black px-6 h-12 transition-all ${isClockedIn ? 'bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
              >
                {isClockedIn ? 'CLOCK OUT' : 'CLOCK IN'}
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <SettingsDialog user={user} />
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.name}</p>
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase">{user?.department}</p>
              </div>
              <Button onClick={() => { localStorage.removeItem('current_user'); navigate('/login'); }} variant="ghost" className="rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 grid grid-cols-12 gap-6 flex-1 w-full">
        <div className="col-span-12 lg:col-span-3 space-y-6">
          {/* Personal Kit / Inventory */}
          <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-500" /> My Personal Kit
              </CardTitle>
              <SupplyRequestDialog worker={user} onSuccess={() => refreshData(user.id)} />
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {user?.inventory?.map(item => (
                  <div key={item.supplyId} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white">{item.name}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{item.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-black ${item.quantity <= 2 ? 'text-red-500' : 'text-emerald-600'}`}>
                        {item.quantity}
                      </p>
                      {item.quantity <= 2 && <Badge className="bg-red-500/10 text-red-500 text-[8px] font-black px-1 py-0">LOW</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-500" /> Refill Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {supplyRequests.length === 0 ? (
                  <p className="text-[10px] text-slate-400 font-bold text-center py-4">No active requests</p>
                ) : (
                  supplyRequests.slice(0, 5).map(req => (
                    <div key={req.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-black text-slate-900 dark:text-white">{req.supplyName}</p>
                        <p className="text-[8px] font-bold text-slate-500 uppercase">Qty: {req.quantity}</p>
                      </div>
                      <Badge className={`text-[8px] font-black ${req.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-600' : req.status === 'Rejected' ? 'bg-red-500/20 text-red-600' : 'bg-amber-500/20 text-amber-600'}`}>
                        {req.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Active Assignments Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-amber-500" /> Active Assignments
              </h2>
              <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700">{activeTasks.length}</Badge>
            </div>
            
            <div className="space-y-4 overflow-y-auto max-h-[40vh] pr-2 custom-scrollbar">
              {activeTasks.length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">No active tasks</p>
                </div>
              ) : (
                activeTasks.map(task => (
                  <Card 
                    key={task.id} 
                    className={`border-none shadow-sm dark:shadow-xl rounded-3xl cursor-pointer transition-all duration-300 group ${selectedTask?.id === task.id ? 'bg-amber-500 ring-4 ring-amber-500/20' : 'bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    onClick={() => setSelectedTask(task)}
                  >
                    <CardContent className="p-6 space-y-4">
                      <Badge className={selectedTask?.id === task.id ? 'bg-slate-900 text-white' : task.priority === 'High' ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}>
                        {task.priority} PRIORITY
                      </Badge>
                      <h3 className={`font-black text-lg leading-tight ${selectedTask?.id === task.id ? 'text-slate-900' : 'text-slate-900 dark:text-white'}`}>{task.title}</h3>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Completed Assignments Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-black text-slate-400 flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-500" /> Submitted for Verification
              </h2>
              <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700">{completedTasks.length}</Badge>
            </div>
            
            <div className="space-y-4 overflow-y-auto max-h-[40vh] pr-2 custom-scrollbar">
              {completedTasks.length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">No submitted tasks</p>
                </div>
              ) : (
                completedTasks.map(task => (
                  <Card 
                    key={task.id} 
                    className="border-none shadow-sm dark:shadow-xl rounded-3xl bg-white dark:bg-slate-900/40 opacity-70 grayscale hover:grayscale-0 transition-all duration-300"
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          SUBMITTED
                        </Badge>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-600">ID: {task.id}</span>
                      </div>
                      <h3 className="font-black text-lg leading-tight text-slate-500 dark:text-slate-400">{task.title}</h3>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5">
          {selectedTask ? (
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl rounded-[2.5rem] overflow-hidden h-full flex flex-col">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-8 border-b border-slate-200 dark:border-slate-700/50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{selectedTask.title}</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-500" /> {selectedTask.location.address}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-200 dark:border-slate-700/50">
                    <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-relaxed">{selectedTask.description}</p>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/30 space-y-4">
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
                              : "bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                          )}
                          onClick={() => setSafetyChecklist(prev => ({ ...prev, [item.id]: !(prev as any)[item.id] }))}
                        >
                          <Checkbox 
                            id={item.id} 
                            checked={(safetyChecklist as any)[item.id]}
                            onCheckedChange={(checked) => setSafetyChecklist(prev => ({ ...prev, [item.id]: !!checked }))}
                            className="border-slate-300 dark:border-slate-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 h-5 w-5 rounded-md"
                          />
                          <label 
                            htmlFor={item.id} 
                            className={cn(
                              "text-xs font-black cursor-pointer transition-colors uppercase tracking-wider",
                              (safetyChecklist as any)[item.id] ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"
                            )}
                          >
                            {item.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSubmitReport} className="space-y-6 bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700/50">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Supplies Used from Kit</Label>
                      <div className="grid grid-cols-1 gap-3">
                        {user?.inventory?.map(item => (
                          <div key={item.supplyId} className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-xs font-bold">{item.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-slate-400">Available: {item.quantity}</span>
                              <Input 
                                type="number" 
                                min="0" 
                                max={item.quantity}
                                className="w-20 h-8 rounded-lg text-xs font-bold"
                                value={usedSupplies[item.supplyId] || 0}
                                onChange={e => setUsedSupplies(prev => ({ ...prev, [item.supplyId]: parseInt(e.target.value) || 0 }))}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Textarea 
                      required 
                      placeholder="Technical Notes..." 
                      className="min-h-[120px] rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      value={reportNotes}
                      onChange={e => setReportNotes(e.target.value)}
                      disabled={!isClockedIn}
                    />
                    
                    {completionImageUrl && (
                      <div className="relative w-full h-48 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 group">
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
                        className="w-full rounded-2xl h-16 border-dashed border-2 border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:bg-amber-500/5 text-slate-600 dark:text-slate-400" 
                        disabled={!isClockedIn}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="mr-2 w-5 h-5" /> {completionImageUrl ? 'CHANGE PHOTO' : 'UPLOAD PHOTO'}
                      </Button>
                    </div>

                    <Button type="submit" className="w-full h-16 rounded-2xl font-black text-lg bg-emerald-600 hover:bg-emerald-700 text-white" disabled={!isClockedIn}>
                      SUBMIT MISSION
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900/30 rounded-[3rem] border-4 border-dashed border-slate-200 dark:border-slate-800/50">
              <Briefcase className="w-24 h-24 text-slate-200 dark:text-slate-800" />
              <h3 className="text-xl font-black text-slate-400 dark:text-slate-600 mt-6 uppercase tracking-[0.3em]">Awaiting Assignment</h3>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WorkerDashboard;