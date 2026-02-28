"use client";

import React from 'react';
import { Sparkles, Bot, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeroSectionProps {
  onStartAI: () => void;
  onToggleManual: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onStartAI, onToggleManual }) => {
  return (
    <div className="bg-emerald-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-emerald-200">
      <div className="relative z-10 space-y-4 max-w-2xl">
        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 backdrop-blur-sm px-3 py-1">Community Impact</Badge>
        <h2 className="text-4xl font-black leading-tight">Your voice shapes our city's future.</h2>
        <p className="text-emerald-100/80 text-lg font-medium">Choose how you want to report: talk to our AI agent for ease, or use the manual form for full control.</p>
        <div className="flex flex-wrap gap-4">
          <Button onClick={onStartAI} size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 rounded-2xl font-bold px-8 h-14 shadow-xl shadow-emerald-950/20">
            <Bot className="mr-2 w-5 h-5" /> Start AI Assistant
          </Button>
          <Button onClick={onToggleManual} variant="outline" size="lg" className="bg-emerald-800/50 border-emerald-700 text-white hover:bg-emerald-800 rounded-2xl font-bold px-8 h-14">
            <FileText className="mr-2 w-5 h-5" /> Manual Report
          </Button>
        </div>
      </div>
      <Sparkles className="absolute top-10 right-10 w-32 h-32 text-emerald-800/50 -rotate-12" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-800/30 rounded-full blur-3xl" />
    </div>
  );
};

export default HeroSection;