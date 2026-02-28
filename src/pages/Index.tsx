"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Shield, Zap, Users, ArrowRight, Globe, CheckCircle2 } from 'lucide-react';
import Footer from '@/components/Footer';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto w-full px-6 h-24 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <Heart className="text-white w-6 h-6 fill-current" />
          </div>
          <span className="font-black text-2xl tracking-tight text-slate-900">CityCare</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="font-bold text-slate-600" onClick={() => navigate('/login')}>Login</Button>
          <Button className="bg-slate-900 hover:bg-slate-800 rounded-xl font-bold px-6" onClick={() => navigate('/login')}>Get Started</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Live in 12 Cities</span>
            </div>
            <h1 className="text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tighter">
              Build a <span className="text-emerald-600">Smarter</span> City Together.
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
              The ultimate community platform for reporting issues, tracking resolutions, and making a real impact in your neighborhood.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 h-16 px-10 rounded-2xl font-black text-lg shadow-2xl shadow-emerald-200 group" onClick={() => navigate('/login')}>
                Join the Movement <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <div className="flex -space-x-3 items-center ml-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-100 overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" />
                  </div>
                ))}
                <div className="pl-6">
                  <p className="text-sm font-black text-slate-900">2.4k+ Citizens</p>
                  <p className="text-xs text-slate-400 font-bold">Active this week</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-emerald-500/10 blur-3xl rounded-full" />
            <div className="relative bg-slate-900 rounded-[3rem] p-8 shadow-2xl border border-slate-800 transform lg:rotate-3 hover:rotate-0 transition-transform duration-700">
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">System Online</Badge>
              </div>
              <div className="space-y-6">
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-white">Pothole Reported</h3>
                    <span className="text-[10px] font-black text-emerald-500">JUST NOW</span>
                  </div>
                  <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-1/3 animate-pulse" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Resolved</p>
                    <p className="text-2xl font-black text-white">1,242</p>
                  </div>
                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Active</p>
                    <p className="text-2xl font-black text-white">84</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Engineered for Impact.</h2>
            <p className="text-slate-500 font-medium">We've built the most advanced tools for community management and rapid response.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'AI Analysis', desc: 'Our AI automatically categorizes and prioritizes reports for faster response.', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
              { title: 'Tactical Dispatch', desc: 'Direct connection to city workers for immediate field action.', icon: Shield, color: 'text-blue-500', bg: 'bg-blue-50' },
              { title: 'Community Driven', desc: 'Upvote issues to show urgency and earn impact points.', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50' }
            ].map((f, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-transform duration-500">
                <div className={`${f.bg} w-16 h-16 rounded-2xl flex items-center justify-center mb-8`}>
                  <f.icon className={`w-8 h-8 ${f.color}`} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">{f.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center space-y-12">
          <div className="flex items-center gap-2 text-emerald-600 font-black uppercase tracking-widest text-sm">
            <Globe className="w-5 h-5" /> Global Network
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 w-full opacity-40 grayscale">
            <div className="font-black text-3xl text-slate-900">METRO</div>
            <div className="font-black text-3xl text-slate-900">URBAN</div>
            <div className="font-black text-3xl text-slate-900">CIVIC</div>
            <div className="font-black text-3xl text-slate-900">GOV.TECH</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-32 px-6">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight">Ready to make a difference?</h2>
            <p className="text-slate-400 text-lg font-medium max-w-xl mx-auto">Join thousands of citizens already working to build a better future for our cities.</p>
            <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 h-16 px-12 rounded-2xl font-black text-lg" onClick={() => navigate('/login')}>
              Create Your Account
            </Button>
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/20 to-transparent pointer-events-none" />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;