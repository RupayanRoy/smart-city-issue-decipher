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
import { User, Bell, Shield, Palette, Settings as SettingsIcon, Save } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { mockDb } from '@/backend/db';

interface SettingsDialogProps {
  user: any;
  trigger?: React.ReactNode;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ user, trigger }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    notifications: true,
    marketing: false,
    twoFactor: false
  });

  const handleSave = () => {
    // Update mock DB
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
      <DialogContent className="max-w-2xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900">
        <div className="flex h-[500px]">
          {/* Sidebar */}
          <div className="w-48 bg-slate-50 dark:bg-slate-950 p-6 border-r border-slate-100 dark:border-slate-800">
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
                    <Input 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Email Address</Label>
                    <Input 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950" 
                    />
                  </div>
                  <div className="pt-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Role</p>
                      <p className="text-sm font-black text-emerald-600 uppercase">{user?.role}</p>
                    </div>
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
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold dark:text-white">Community Updates</Label>
                      <p className="text-[10px] text-slate-500">Monthly impact reports and city news.</p>
                    </div>
                    <Switch checked={formData.marketing} onCheckedChange={v => setFormData({...formData, marketing: v})} />
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
                  <Button variant="outline" className="w-full rounded-xl border-slate-200 dark:border-slate-800 font-bold text-xs">
                    Change Password
                  </Button>
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