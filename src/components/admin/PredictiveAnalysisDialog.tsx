"use client";

import React from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BrainCircuit, TrendingUp, ShieldCheck, BarChart3, ArrowUpRight, FileText, Zap } from 'lucide-react';

interface PredictiveAnalysisDialogProps {
  insight: {
    title: string;
    desc: string;
    prob: string;
    color: string;
    icon: any;
  };
  children: React.ReactNode;
}

const PredictiveAnalysisDialog: React.FC<PredictiveAnalysisDialogProps> = ({ insight, children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-[2.5rem] border-none shadow-2xl bg-slate-950 text-white p-0 overflow-hidden">
        <div className="p-10 space-y-8">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-500/20 p-2.5 rounded-2xl">
                <BrainCircuit className="w-6 h-6 text-emerald-400" />
              </div>
              <Badge className="bg-white/10 text-white border-none text-[10px] font-black px-3 py-1 tracking-widest">AI DIAGNOSTIC REPORT</Badge>
            </div>
            <DialogTitle className="text-4xl font-black tracking-tighter text-white">{insight.title}</DialogTitle>
            <DialogDescription className="text-slate-400 font-medium text-lg leading-relaxed">
              Neural network analysis of real-time sensor data and historical infrastructure patterns.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Confidence Score</p>
              <div className="flex items-end gap-2">
                <p className={`text-4xl font-black ${insight.color}`}>{insight.prob}</p>
                <TrendingUp className="w-5 h-5 text-emerald-500 mb-1" />
              </div>
            </div>
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Risk Classification</p>
              <p className="text-4xl font-black text-white">CRITICAL</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" /> Data Correlation Analysis
            </h4>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
              <p className="text-sm text-slate-300 leading-relaxed">
                Our predictive engine has identified a high-frequency vibration pattern in the sub-surface sensors that correlates with a 14% increase in heavy vehicle traffic over the last 72 hours. This specific signature has a 92% historical match with structural fatigue in similar urban sectors.
              </p>
            </div>
          </div>

          <div className="bg-emerald-500/10 p-8 rounded-[2rem] border border-emerald-500/20 space-y-4">
            <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Recommended Mitigation Strategy
            </h4>
            <ul className="text-xs text-slate-300 space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>Deploy Ground-Penetrating Radar (GPR) team for immediate sub-surface imaging.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>Implement temporary weight restrictions for vehicles exceeding 5 tons in the affected zone.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>Increase sensor polling frequency to 30-second intervals for real-time monitoring.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="p-8 bg-white/5 border-t border-white/10 flex justify-end gap-4">
          <Button variant="ghost" className="text-white hover:bg-white/10 rounded-2xl font-bold h-14 px-8">
            <FileText className="w-4 h-4 mr-2" /> Export Report
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black h-14 px-10 shadow-xl shadow-emerald-900/20">
            <Zap className="w-4 h-4 mr-2" /> Deploy Response Team
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PredictiveAnalysisDialog;