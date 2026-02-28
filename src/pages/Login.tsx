"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart, Shield, User, HardHat, Lock, UserCircle, Loader2 } from 'lucide-react';
import Footer from '@/components/Footer';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/utils/toast';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'citizen' | 'worker'>('citizen');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Internally map username to an email format for Supabase
    const email = username.includes('@') ? username : `${username}@citycare.com`;

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Fetch profile to determine redirect
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role === 'admin') navigate('/admin');
        else if (profile?.role === 'worker') navigate('/worker');
        else navigate('/citizen');
        
        showSuccess("Welcome back!");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || username,
              role: role,
            }
          }
        });
        if (error) throw error;
        
        showSuccess("Account created! You can now log in.");
        setIsLogin(true);
      }
    } catch (error: any) {
      showError(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminBypass = () => {
    // For hackathon demo purposes: directly navigate if credentials match
    // In a real app, this would still go through auth
    if (username === 'admin@smartcity.gov' && password === 'password123') {
      showSuccess("Admin Access Granted (Demo Mode)");
      navigate('/admin');
    } else {
      showError("Invalid Admin Credentials");
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
              {isLogin ? 'Sign in with your username' : 'Create your citizen or worker account'}
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
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                      id="fullName"
                      placeholder="Your Name" 
                      className="pl-10 rounded-xl h-12"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input 
                    id="username"
                    placeholder="e.g. rupayan" 
                    className="pl-10 rounded-xl h-12"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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

              <Button type="submit" className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-lg" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
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
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-700 font-black text-xs uppercase tracking-widest">
                    <Shield className="w-4 h-4" /> Hackathon Admin Access
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-[10px] font-black bg-amber-200/50 hover:bg-amber-200 text-amber-800 rounded-lg"
                    onClick={handleAdminBypass}
                  >
                    QUICK LOGIN
                  </Button>
                </div>
                <div className="text-sm space-y-1">
                  <p className="text-slate-600 font-medium">Username: <span className="font-bold text-slate-900">admin@smartcity.gov</span></p>
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