"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Cpu, Database, Server, Activity, Users, Globe, 
  Wifi, ShieldCheck, Zap, HardHat, MapPin, Clock
} from 'lucide-react';
import { mockDb } from '@/backend/db';

interface MonitoringSystemProps {
  stats: any;
}

const MonitoringSystem: React.FC<MonitoringSystemProps> = ({ stats }) => {
  const [systemLoad, setSystemLoad] = useState(24);
  const [memoryUsage, setMemoryUsage] = useState(42);
  const [networkTraffic, setNetworkTraffic] = useState(15);
  
  // Simulate live fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemLoad(prev => Math.max(10, Math.min(90, prev + (Math.random() * 10 - 5))));
      setMemoryUsage(prev => Math.max(30, Math.min(85, prev + (Math.random() * 6 - 3))));
      setNetworkTraffic(prev => Math.max(5, Math.min(95, prev + (Math.random() * 20 - 10))));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const activeWorkers = mockDb.users.filter(u => u.role === 'worker');
  const activeCitizens = mockDb.users.filter(u => u.role === 'citizen');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* System Health Card */}
        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
          <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-500" /> Core Infrastructure
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2">
                  <Server className="w-3 h-3" /> CPU Load
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white">{Math.round(systemLoad)}%</span>
              </div>
              <Progress value={systemLoad} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2">
                  <Database className="w-3 h-3" /> Memory Usage
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white">{Math.round(memoryUsage)}%</span>
              </div>
              <Progress value={memoryUsage} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2">
                  <Wifi className="w-3 h-3" /> Network Traffic
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white">{Math.round(networkTraffic)} Mb/s</span>
              </div>
              <Progress value={networkTraffic} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions Card */}
        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
          <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" /> Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/10 p-2 rounded-xl">
                  <HardHat className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Field Personnel</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{activeWorkers.length}</p>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-600 border-none text-[8px] font-black">ONLINE</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 p-2 rounded-xl">
                  <Users className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Active Citizens</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{activeCitizens.length}</p>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-600 border-none text-[8px] font-black">ONLINE</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Security & Compliance Card */}
        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
          <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" /> Security Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>SSL Encryption: Active (TLS 1.3)</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Firewall: Filtering Active</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Database Integrity: Verified</span>
            </div>
            <div className="pt-4">
              <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Last Security Audit</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Completed 14 minutes ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic Hotspots */}
        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
          <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-500" /> Geographic Hotspots
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {stats.topAreas.map((area: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-200 dark:bg-slate-700 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white">{area.address.split(',')[0]}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Active Reports</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-emerald-600">{area.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live System Events */}
        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
          <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500" /> Real-time Event Stream
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[
                { event: 'API Request: GET /v1/issues', status: '200 OK', time: 'Just now', icon: Zap, color: 'text-emerald-500' },
                { event: 'Worker Clock-in: John Technician', status: 'Success', time: '2m ago', icon: HardHat, color: 'text-blue-500' },
                { event: 'New Report: Pothole Detected', status: 'AI Processed', time: '5m ago', icon: MapPin, color: 'text-amber-500' },
                { event: 'Database Backup', status: 'Completed', time: '12m ago', icon: Database, color: 'text-purple-500' },
                { event: 'System Health Check', status: 'Nominal', time: '15m ago', icon: ShieldCheck, color: 'text-emerald-500' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border-b border-slate-50 dark:border-slate-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{item.event}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{item.status}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonitoringSystem;