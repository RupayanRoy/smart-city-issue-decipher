"use client";

import React from 'react';
import { Heart, Bell, LogOut, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PortalHeaderProps {
  user: any;
  onLogout: () => void;
}

const PortalHeader: React.FC<PortalHeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
            <Heart className="text-white w-6 h-6 fill-current" />
          </div>
          <div>
            <span className="font-black text-2xl tracking-tight text-slate-900">CityCare</span>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Citizen Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
            <div className="bg-amber-100 p-1.5 rounded-lg">
              <Trophy className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Impact Points</p>
              <p className="text-sm font-black text-slate-900">{user?.points || 0} Points</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
              <Bell className="w-5 h-5 text-slate-500" />
            </Button>
            <div className="h-10 w-px bg-slate-100" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase">Community Hero</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-red-50 hover:text-red-600" onClick={onLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PortalHeader;