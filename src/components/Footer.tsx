"use client";

import React from 'react';
import { Heart, Code2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full py-12 px-6 mt-auto border-t border-slate-100 bg-white/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 text-slate-400 font-medium">
          <Code2 className="w-4 h-4" />
          <span>Built with passion by</span>
          <span className="text-emerald-600 font-black tracking-tight">Deploy & Pray</span>
        </div>
        
        <div className="flex items-center gap-6 text-sm font-bold text-slate-400 uppercase tracking-widest">
          <a href="#" className="hover:text-emerald-600 transition-colors">Privacy</a>
          <a href="#" className="hover:text-emerald-600 transition-colors">Terms</a>
          <a href="#" className="hover:text-emerald-600 transition-colors">Contact</a>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <span className="text-xs font-bold uppercase tracking-tighter">CityCare v1.0</span>
          <Heart className="w-3 h-3 fill-current text-red-400" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;