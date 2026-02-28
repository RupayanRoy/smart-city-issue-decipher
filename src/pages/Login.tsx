"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart, Shield, User, HardHat, Lock, UserCircle } from 'lucide-react';
import Footer from '@/components/Footer';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockDb } from '@/backend/db';
import { showSuccess, showError } from '@/utils/toast';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'citizen' | 'worker'>('citizen');
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      const user = mockDb.users.find(u => u.email === email && u.password === password);
      if (user) {
        localStorage.setItem('current_user', JSON.stringify(user));
        showSuccess(`Welcome back, ${user.name}!`);
        if (user.role === 'admin') navigate('/admin');
        else if (user.role === 'worker') navigate('/worker');
        else navigate('/citizen');
      } else {
        showError("Invalid credentials. Try admin@smartcity.gov / password123");
      }
    } else {
      const newUser = {
        id: `u-${Date.now()}`,
        name,
        email,
        password,
        role,
        points: 0
      };
      mockDb.users.push(newUser);
      mockDb.save();
      localStorage.setItem('current_user', JSON.stringify(newUser));
      showSuccess("Account created successfully!");
      navigate(role === 'worker' ? '/worker' : '/citizen');
    }
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

        <Card className="w-full max-w-md shadow-2xl shadow-emerald-100/50 border-none rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-900 text-white text-center py-8">
            <CardTitle className="text-xl">{isLogin ? 'Welcome Back' : 'Join the Movement'}</CardTitle>
            <CardDescription className="text-slate-400">
              {isLogin ? 'Sign in to your account' : 'Create your citizen or worker account'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-4 mb-6">
                  <Label className="text-sm font-bold text-slate-700">I am registering as a:</Label>
                  <RadioGroup 
                    defaultValue="citizen" 
                    onValueChange={(v) => setRole(v as 'citizen' | 'worker')}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-xl border border-slate-100 flex-1 cursor-pointer hover:bg-emerald-50 transition-colors">
                      <RadioGroupItem value="citizen" id="citizen" />
                      <Label htmlFor="citizen" className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                        <User className="w-4 h-4" /> Citizen
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-xl border border-slate-100 flex-1 cursor-pointer hover:bg-amber-50 transition-colors">
                      <RadioGroupItem value="worker" id="worker" />
                      <Label htmlFor="worker" className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                        <HardHat className="w-4 h-4" /> Worker
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                      id="name"
                      placeholder="Your Name" 
                      className="pl-10 rounded-xl h-12"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input 
                    id="email"
                    type="email"
                    placeholder="name@example.com" 
                    className="pl-10 rounded-xl h-12"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input 
                    id="password"
                    type="password"
                    placeholder="••••••••" 
                    className="pl-10 rounded-xl h-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-lg">
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-sm font-bold text-emerald-600 hover:underline"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-700 font-black text-xs uppercase tracking-widest">
                  <Shield className="w-4 h-4" /> Hackathon Admin Access
                </div>
                <div className="text-sm space-y-1">
                  <p className="text-slate-600 font-medium">Email: <span className="font-bold text-slate-900">admin@smartcity.gov</span></p>
                  <p className="text-slate-600 font-medium">Password: <span className="font-bold text-slate-900">password123</span></p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Login;