"use client";

import React from 'react';
import { Megaphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface SevereAlertOverlayProps {
  alert: any;
  onDismiss: () => void;
}

const SevereAlertOverlay: React.FC<SevereAlertOverlayProps> = ({ alert, onDismiss }) => {
  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-lg border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white border-t-8 border-red-600">
        <CardHeader className="bg-red-50 p-8 flex flex-row items-center gap-4">
          <div className="bg-red-600 p-3 rounded-2xl shadow-lg shadow-red-200 animate-bounce">
            <Megaphone className="text-white w-8 h-8" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black text-red-700">SEVERE COMMUNITY ALERT</CardTitle>
            <CardDescription className="text-red-600 font-bold uppercase tracking-widest text-[10px]">Immediate Attention Required</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-10 space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900">{alert.title}</h3>
            <p className="text-slate-600 font-medium leading-relaxed">{alert.description}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
            <MapPin className="text-red-600 w-5 h-5" />
            <span className="text-sm font-bold text-slate-700">{alert.location.address}</span>
          </div>
          <Button onClick={onDismiss} className="w-full py-8 text-lg font-black bg-slate-900 hover:bg-slate-800 rounded-2xl shadow-xl transition-all">
            I Understand & Will Stay Safe
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SevereAlertOverlay;