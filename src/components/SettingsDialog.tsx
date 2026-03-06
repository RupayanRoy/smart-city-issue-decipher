"use client";

import React, { useState } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  User, Bell, Shield, Settings as SettingsIcon, Save, 
  Zap, Trophy, Cpu, HardHat, Activity, History, ShieldCheck 
} from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { mockDb } from '@/backend/db';
import { Badge } from '@/components/ui/badge';

interface SettingsDialogProps {
  user: any;
  trigger?: React.RefObject<HTMLButtonElement> | React.ReactNode;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ user, trigger }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    notifications: true,
    marketing: false,
    twoFactor: false,
    escalationThreshold: 3,
    publicProfile: true
  });

  const handleSave = () => {
    const dbUser = mockDb.users.find(u => u.id === user.id);
    if (dbUser) {
      dbUser.name = formData.name;
      dbUser.email = formData.email;
      mockDb.save();
      localStorage.setItem('current_user', JSON.stringify(dbUser));
      showSuccess("Settings saved successfully!");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="rounded-xl">
            <SettingsIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900">
        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-56 bg-slate-50 dark:bg-slate-950 p-6 border-r border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-8">
              <div className="bg-emerald-600 p-1.5 rounded-lg">
                <SettingsIcon className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-sm tracking-tight dark:text-white">Settings</span>
            </div>
            
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="flex flex-col bg-transparent h-auto space-y-1">
                <TabsTrigger value="profile" className="w-full justify-start gap-2 px-3 py-2 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm font-bold text-xs">
                  <User className="w-4 h-4" /> Profile
                </TabsTrigger>
                <TabsTrigger value="notifications" className="w-full justify-start gap-2 px-3 py-2 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm font-bold text-xs">
                  <Bell className="w-4 h-4" /> Alerts
                </TabsTrigger>
                <TabsTrigger value="security" className="w-full justify-start gap-2 px-3 py-2 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm font-bold text-xs">
                  <Shield className="w-4 h-4" /> Security
                </TabsTrigger>
                
                {/* Role-Specific Advanced Tabs */}
                {user?.role === 'citizen' && (
                  <TabsTrigger value="impact" className="w-full justify-start gap-2 px-3 py-2 rounded-xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-bold text-xs mt-4">
                    <Trophy className="w-4 h-4" /> Impact & Rewards
                  </TabsTrigger>
                )}
                {user?.role === 'admin' && (
                  <TabsTrigger value="system" className="w-full justify-start gap-2 px-3 py-2 rounded-xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-bold text-xs mt-4">
                    <Cpu className="w-4 h-4" /> System Control
                  </TabsTrigger>
                )}
                {user?.role === 'worker' && (
                  <TabsTrigger value="ops" className="w-full justify-start gap-2 px-3 py-2 rounded-xl data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-sm font-bold text-xs mt-4">
                    <HardHat className="w-4 h-4" /> Operations
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          </div>

          {/* Content */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            <Tabs defaultValue="profile" className="w-full">
              <TabsContent value="profile" className="mt-0 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-black dark:text-white">Profile Information</h3>
                  <p className="text-xs text-slate-500">Update your personal details and how others see you.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Full Name</Label>
                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Email Address</Label>
                    <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="mt-0 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-black dark:text-white">Notification Preferences</h3>
                  <p className="text-xs text-slate-500">Control which alerts you receive and where.</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold dark:text-white">Push Notifications</Label>
                      <p className="text-[10px] text-slate-500">Receive real-time updates on your reports.</p>
                    </div>
                    <Switch checked={formData.notifications} onCheckedChange={v => setFormData({...formData, notifications: v})} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="mt-0 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-black dark:text-white">Account Security</h3>
                  <p className="text-xs text-slate-500">Manage your password and account protection.</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold dark:text-white">Two-Factor Auth</Label>
                      <p className="text-[10px] text-slate-500">Add an extra layer of security to your account.</p>
                    </div>
                    <Switch checked={formData.twoFactor} onCheckedChange={v => setFormData({...formData, twoFactor: v})} />
                  </div>
                </div>
              </TabsContent>

              {/* Citizen Advanced: Impact */}
              <TabsContent value="impact" className="mt-0 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-black dark:text-white">Impact & Rewards</h3>
                  <p className="text-xs text-slate-500">Track your contributions to the city's well-being.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-800">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Points</p>
                    <p className="text-3xl font-black text-emerald-900 dark:text-emerald-400">{user?.points || 0}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Rank</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">#12</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Earned Badges</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 px-3 py-1">First Responder</Badge>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1">Eagle Eye</Badge>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 px-3 py-1">Community Hero</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold dark:text-white">Public Leaderboard</Label>
                    <p className="text-[10px] text-slate-500">Show your impact points to other citizens.</p>
                  </div>
                  <Switch checked={formData.publicProfile} onCheckedChange={v => setFormData({...formData, publicProfile: v})} />
                </div>
              </TabsContent>

              {/* Admin Advanced: System */}
              <TabsContent value="system" className="mt-0 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-black dark:text-white">System Control</h3>
                  <p className="text-xs text-slate-500">Configure global city operations and AI thresholds.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Escalation Threshold (Days)</Label>
                    <Input type="number" value={formData.escalationThreshold} onChange={e => setFormData({...formData, escalationThreshold: parseInt(e.target.value)})} className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950" />
                    <p className="text-[10px] text-slate-500 italic">Issues older than this will be automatically marked as High Priority.</p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold dark:text-white">Maintenance Mode</Label>
                      <p className="text-[10px] text-slate-500">Disable new report submissions temporarily.</p>
                    </div>
                    <Switch checked={false} />
                  </div>
                  <div className="bg-slate-900 p-6 rounded-3xl space-y-3">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">System Health</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Database Sync</span>
                      <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">Optimal</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">AI Engine</span>
                      <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">Active</Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Worker Advanced: Ops */}
              <TabsContent value="ops" className="mt-0 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-black dark:text-white">Operations & Safety</h3>
                  <p className="text-xs text-slate-500">Manage your field equipment and shift history.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-3xl border border-amber-100 dark:border-amber-800">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Total Hours</p>
                    <p className="text-3xl font-black text-amber-900 dark:text-amber-400">142.5</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Safety Score</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">98%</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Equipment Status</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                      <span className="text-xs font-bold flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> PPE Kit</span>
                      <Badge variant="outline" className="text-[10px] border-emerald-500/20 text-emerald-600">Certified</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                      <span className="text-xs font-bold flex items-center gap-2"><Activity className="w-4 h-4 text-blue-500" /> Service Vehicle</span>
                      <Badge variant="outline" className="text-[10px] border-blue-500/20 text-blue-600">Good</Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <Button variant="ghost" className="rounded-xl font-bold text-xs" onClick={() => {}}>Cancel</Button>
          <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black text-xs gap-2" onClick={handleSave}>
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;