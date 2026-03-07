"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Cpu, Database, Server, Activity, Users, Globe, 
  Wifi, ShieldCheck, Zap, HardHat, MapPin, Clock,
  Car, Building2, Construction, AlertTriangle, TrendingUp
} from 'lucide-react';
import { mockDb } from '@/backend/db';
import UrbanInfrastructureMap from './UrbanInfrastructureMap';

interface MonitoringSystemProps {
  stats: any;
}

const MonitoringSystem: React.FC<MonitoringSystemProps> = ({ stats }) => {
  const [systemLoad, setSystemLoad] = useState(24);
  const [memoryUsage, setMemoryUsage] = useState(42);
  const [networkTraffic, setNetworkTraffic] = useState(15);
  
  // Urban Metrics
  const [trafficFlow, setTrafficFlow] = useState(68);
  const [congestionIndex, setCongestionIndex] = useState(32);
  const [roadHealth, setRoadHealth] = useState(84);
  const [buildingCompliance, setBuildingCompliance] = useState(91);
  
  // Simulate live fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemLoad(prev => Math.max(10, Math.min(90, prev + (Math.random() * 10 - 5))));
      setMemoryUsage(prev => Math.max(30, Math.min(85, prev + (Math.random() * 6 - 3))));
      setNetworkTraffic(prev => Math.max(5, Math.min(95, prev + (Math.random() * 20 - 10))));
      
      // Urban fluctuations
      setTrafficFlow(prev => Math.max(40, Math.min(95, prev + (Math.random() * 4 - 2))));
      setCongestionIndex(prev => Math.max(10, Math.min(80, prev + (Math.random() * 6 - 3))));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const activeWorkers = mockDb.users.filter(u => u.role === 'worker');
  const activeCitizens = mockDb.users.filter(u => u.role === 'citizen');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Row: System & Urban Overview */}
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
          </CardContent>
        </Card>

        {/* Urban Infrastructure Metrics */}
        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
          <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Construction className="w-4 h-4 text-amber-500" /> Urban Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2">
                  <Car className="w-3 h-3" /> Traffic Flow
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white">{Math.round(trafficFlow)}%</span>
              </div>
              <Progress value={trafficFlow} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" /> Congestion Index
                </span>
                <span className={`text-xs font-black ${congestionIndex > 60 ? 'text-red-500' : 'text-emerald-500'}`}>{Math.round(congestionIndex)}%</span>
              </div>
              <Progress value={congestionIndex} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
            </div>
          </CardContent>
        </Card>

        {/* Building & Safety Card */}
        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
          <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500" /> Building & Safety
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3" /> Compliance Rate
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white">{buildingCompliance}%</span>
              </div>
              <Progress value={buildingCompliance} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Road Health
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white">{roadHealth}%</span>
              </div>
              <Progress value={roadHealth} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Urban Infrastructure Map */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
          <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <Globe className="w-6 h-6 text-emerald-500" /> Urban Infrastructure Map
              </CardTitle>
              <p className="text-xs text-slate-500 font-medium mt-1">Real-time visualization of traffic flow, congestion zones, and road conditions.</p>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-600 border-none text-[10px] font-black px-3 py-1">LIVE FEED</Badge>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[450px] w-full">
              <UrbanInfrastructureMap />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Sessions & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                { event: 'Traffic Alert: High Congestion at Main Gate', status: 'Alert Sent', time: 'Just now', icon: AlertTriangle, color: 'text-red-500' },
                { event: 'Building Inspection: Sector 4', status: 'Compliant', time: '2m ago', icon: Building2, color: 'text-blue-500' },
                { event: 'Road Maintenance: Kelambakkam Rd', status: 'Scheduled', time: '5m ago', icon: Construction, color: 'text-amber-500' },
                { event: 'API Request: GET /v1/traffic', status: '200 OK', time: '12m ago', icon: Zap, color: 'text-emerald-500' },
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