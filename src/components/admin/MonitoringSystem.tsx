"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Cpu, Database, Server, Activity, Users, Globe, 
  Wifi, ShieldCheck, Zap, HardHat, MapPin, Clock,
  Car, Building2, Construction, AlertTriangle, TrendingUp,
  Wind, Droplets, Volume2, Lightbulb, BrainCircuit, ArrowUpRight
} from 'lucide-react';
import { mockDb } from '@/backend/db';
import UrbanInfrastructureMap from './UrbanInfrastructureMap';

interface MonitoringSystemProps {
  stats: any;
}

const MonitoringSystem: React.FC<MonitoringSystemProps> = ({ stats }) => {
  // System Metrics
  const [systemLoad, setSystemLoad] = useState(24);
  const [memoryUsage, setMemoryUsage] = useState(42);
  
  // Urban Metrics
  const [trafficFlow, setTrafficFlow] = useState(68);
  const [congestionIndex, setCongestionIndex] = useState(32);
  const [roadHealth, setRoadHealth] = useState(84);
  const [buildingCompliance, setBuildingCompliance] = useState(91);
  
  // Environmental & Utility Metrics
  const [aqi, setAqi] = useState(42);
  const [noiseLevel, setNoiseLevel] = useState(55);
  const [powerGridLoad, setPowerGridLoad] = useState(64);
  const [waterPressure, setWaterPressure] = useState(78);
  
  // Simulate live fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemLoad(prev => Math.max(10, Math.min(90, prev + (Math.random() * 10 - 5))));
      setMemoryUsage(prev => Math.max(30, Math.min(85, prev + (Math.random() * 6 - 3))));
      
      setTrafficFlow(prev => Math.max(40, Math.min(95, prev + (Math.random() * 4 - 2))));
      setCongestionIndex(prev => Math.max(10, Math.min(80, prev + (Math.random() * 6 - 3))));

      setAqi(prev => Math.max(20, Math.min(150, prev + (Math.random() * 4 - 2))));
      setNoiseLevel(prev => Math.max(40, Math.min(85, prev + (Math.random() * 2 - 1))));
      setPowerGridLoad(prev => Math.max(50, Math.min(95, prev + (Math.random() * 4 - 2))));
      setWaterPressure(prev => Math.max(60, Math.min(90, prev + (Math.random() * 2 - 1))));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const activeWorkers = mockDb.users.filter(u => u.role === 'worker');
  const activeCitizens = mockDb.users.filter(u => u.role === 'citizen');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Row: System, Urban, and Environmental Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* System Health */}
        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
          <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-500" /> System Core
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase">
                <span className="text-slate-400">CPU Load</span>
                <span className="text-slate-900 dark:text-white">{Math.round(systemLoad)}%</span>
              </div>
              <Progress value={systemLoad} className="h-1 bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase">
                <span className="text-slate-400">Memory</span>
                <span className="text-slate-900 dark:text-white">{Math.round(memoryUsage)}%</span>
              </div>
              <Progress value={memoryUsage} className="h-1 bg-slate-100 dark:bg-slate-800" />
            </div>
          </CardContent>
        </Card>

        {/* Urban Infrastructure */}
        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
          <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Car className="w-4 h-4 text-amber-500" /> Traffic & Roads
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase">
                <span className="text-slate-400">Flow Rate</span>
                <span className="text-slate-900 dark:text-white">{Math.round(trafficFlow)}%</span>
              </div>
              <Progress value={trafficFlow} className="h-1 bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase">
                <span className="text-slate-400">Congestion</span>
                <span className={congestionIndex > 60 ? 'text-red-500' : 'text-emerald-500'}>{Math.round(congestionIndex)}%</span>
              </div>
              <Progress value={congestionIndex} className="h-1 bg-slate-100 dark:bg-slate-800" />
            </div>
          </CardContent>
        </Card>

        {/* Environmental Sensors */}
        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
          <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Wind className="w-4 h-4 text-sky-500" /> Environment
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase">
                <span className="text-slate-400">Air Quality (AQI)</span>
                <span className={aqi > 100 ? 'text-amber-500' : 'text-emerald-500'}>{Math.round(aqi)}</span>
              </div>
              <Progress value={(aqi / 300) * 100} className="h-1 bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase">
                <span className="text-slate-400">Noise Level</span>
                <span className="text-slate-900 dark:text-white">{Math.round(noiseLevel)} dB</span>
              </div>
              <Progress value={noiseLevel} className="h-1 bg-slate-100 dark:bg-slate-800" />
            </div>
          </CardContent>
        </Card>

        {/* Utility Grid */}
        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
          <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" /> Utility Grid
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase">
                <span className="text-slate-400">Power Load</span>
                <span className="text-slate-900 dark:text-white">{Math.round(powerGridLoad)}%</span>
              </div>
              <Progress value={powerGridLoad} className="h-1 bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase">
                <span className="text-slate-400">Water Pressure</span>
                <span className="text-slate-900 dark:text-white">{Math.round(waterPressure)} PSI</span>
              </div>
              <Progress value={waterPressure} className="h-1 bg-slate-100 dark:bg-slate-800" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Map and Predictive Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Infrastructure Map */}
        <Card className="lg:col-span-2 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
          <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <Globe className="w-6 h-6 text-emerald-500" /> Urban Infrastructure Map
              </CardTitle>
              <p className="text-xs text-slate-500 font-medium mt-1">Real-time visualization of traffic flow and congestion zones.</p>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-600 border-none text-[10px] font-black px-3 py-1">LIVE FEED</Badge>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[400px] w-full">
              <UrbanInfrastructureMap />
            </div>
          </CardContent>
        </Card>

        {/* AI Predictive Insights */}
        <Card className="bg-slate-900 text-white border-none rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-white/10">
            <CardTitle className="text-xl font-black flex items-center gap-3">
              <BrainCircuit className="w-6 h-6 text-emerald-400" /> AI Predictive Insights
            </CardTitle>
            <p className="text-xs text-slate-400 font-medium mt-1">Machine learning forecasts for infrastructure maintenance.</p>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {[
              { 
                title: 'Road Subsidence Risk', 
                desc: 'High probability of sinkhole formation in Sector 3 due to water main vibration.', 
                prob: '84%', 
                color: 'text-rose-400',
                icon: AlertTriangle 
              },
              { 
                title: 'Grid Overload Forecast', 
                desc: 'Predicted 15% surge in power demand for Kelambakkam between 18:00-20:00.', 
                prob: '92%', 
                color: 'text-amber-400',
                icon: Zap 
              },
              { 
                title: 'Maintenance Required', 
                desc: 'Street light cluster #42 showing signs of imminent ballast failure.', 
                prob: '65%', 
                color: 'text-emerald-400',
                icon: Lightbulb 
              }
            ].map((insight, idx) => (
              <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2 group hover:bg-white/10 transition-colors cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <insight.icon className={`w-4 h-4 ${insight.color}`} />
                    <h4 className="text-sm font-black">{insight.title}</h4>
                  </div>
                  <Badge className="bg-white/10 text-white text-[10px] font-black">{insight.prob}</Badge>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{insight.desc}</p>
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400 uppercase tracking-widest pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  View Analysis <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Sessions & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Sessions */}
        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
          <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" /> Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
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
                { event: 'Utility Update: Water Pressure Stabilized', status: 'Nominal', time: '2m ago', icon: Droplets, color: 'text-blue-500' },
                { event: 'Environmental: AQI spike in Sector 7', status: 'Monitoring', time: '5m ago', icon: Wind, color: 'text-amber-500' },
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