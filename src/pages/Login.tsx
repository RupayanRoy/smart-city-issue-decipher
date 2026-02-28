"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart, Shield, User, Lock, Info, HardHat, UserCircle } from 'lucide-react';
import Footer from '@/components/Footer';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockDb } from '@/backend/db';
import { showSuccess, showError } from '@/utils/toast';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();

    const user = mockDb.users.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem('current_user', JSON.stringify(user));
      showSuccess(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'worker') navigate('/worker');
      else navigate('/citizen');
    } else {
      showError("Invalid credentials. Click a demo account below to auto-fill.");
    }
  };

  const fillCredentials = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-sky-50">
      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-8">
        <div className="text-center space-y-2 max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200 mb-4">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">CityCare</h1>
          <p className="text-slate-500 font-medium">Empowering citizens to build a better, safer, and cleaner society together.</p>
        </div>

        <Card className="w-full max-w-md shadow-2xl shadow-emerald-100/50 border-none rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-slate-900 text-white text-center py-10">
            <CardTitle className="text-2xl font-black tracking-tight">Welcome Back</CardTitle>
            <CardDescription className="text-slate-400 font-medium">
              Sign in to access the command center
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-bold ml-1">Email Address</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input 
                    id="email"
                    type="email"
                    placeholder="name@example.com" 
                    className="pl-12 rounded-2xl h-14 border-slate-200 focus:ring-emerald-500 font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-bold ml-1">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input 
                    id="password"
                    type="password"
                    placeholder="••••••••" 
                    className="pl-12 rounded-2xl h-14 border-slate-200 focus:ring-emerald-500 font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-lg shadow-xl shadow-emerald-100 transition-all active:scale-[0.98]">
                Sign In
              </Button>
            </form>

            <div className="space-y-4 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2 text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] mb-2">
                <Info className="w-4 h-4 text-emerald-600" /> Quick Access Demo Accounts
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {/* Admin Demo */}
                <button 
                  onClick={() => fillCredentials('admin@smartcity.gov', 'password123')}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-900 p-2 rounded-xl text-white">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">System Administrator</p>
                      <p className="text-[10px] font-bold text-slate-500">admin@smartcity.gov</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">SELECT</span>
                </button>

                {/* Worker Demo */}
                <button 
                  onClick={() => fillCredentials('john@citycare.gov', 'password123')}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-500 hover:bg-amber-50/30 transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-500 p-2 rounded-xl text-slate-900">
                      <HardHat className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">Field Worker</p>
                      <p className="text-[10px] font-bold text-slate-500">john@citycare.gov</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">SELECT</span>
                </button>

                {/* Citizen Demo */}
                <button 
                  onClick={() => fillCredentials('rupayan@example.com', 'password123')}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-600 p-2 rounded-xl text-white">
                      <UserCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">Citizen Hero</p>
                      <p className="text-[10px] font-bold text-slate-500">rupayan@example.com</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">SELECT</span>
                </button>
              </div>
              <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password for all: password123</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Login;