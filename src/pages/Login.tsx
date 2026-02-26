import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockDb } from '@/backend/db';
import { showSuccess, showError } from '@/utils/toast';
import { Heart, Shield, User as UserIcon, Info, Globe } from 'lucide-react';
import Footer from '@/components/Footer';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleLogin = (role: 'citizen' | 'admin') => {
    const user = mockDb.users.find(u => u.email === email && u.role === role);
    if (user) {
      localStorage.setItem('current_user', JSON.stringify(user));
      showSuccess(`Welcome back, ${user.name}!`);
      navigate(role === 'admin' ? '/admin' : '/citizen');
    } else {
      showError('Invalid credentials');
    }
  };

  const handleRegister = () => {
    if (mockDb.users.find(u => u.email === email)) {
      showError('User already exists');
      return;
    }
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role: 'citizen' as const,
      password,
      points: 0
    };
    mockDb.users.push(newUser);
    mockDb.save();
    localStorage.setItem('current_user', JSON.stringify(newUser));
    showSuccess('Welcome to the community!');
    navigate('/citizen');
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
            <CardTitle className="text-xl">Join the Movement</CardTitle>
            <CardDescription className="text-slate-400">Sign in to start making an impact</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-slate-100 rounded-xl">
                <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Login</TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold ml-1">Email Address</Label>
                  <Input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="your@email.com" 
                    className="rounded-xl border-slate-200 focus:ring-emerald-500 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold ml-1">Password</Label>
                  <Input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="rounded-xl border-slate-200 focus:ring-emerald-500 h-12"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Button onClick={() => handleLogin('citizen')} variant="outline" className="w-full rounded-xl h-12 border-2 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all">
                    <UserIcon className="mr-2 w-4 h-4" /> Citizen
                  </Button>
                  <Button onClick={() => handleLogin('admin')} className="w-full rounded-xl h-12 bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all">
                    <Shield className="mr-2 w-4 h-4" /> Admin
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="register" className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold ml-1">Full Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold ml-1">Email Address</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" className="rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold ml-1">Password</Label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="rounded-xl h-12" />
                </div>
                <Button onClick={handleRegister} className="w-full mt-4 rounded-xl h-12 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100">Create Community Account</Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="w-full max-w-md bg-white/60 backdrop-blur-sm border border-emerald-100 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <Info className="w-4 h-4" />
            Quick Access for Testing
          </div>
          <div className="grid grid-cols-2 gap-6 text-[11px]">
            <div className="space-y-1.5">
              <p className="font-bold text-slate-800 uppercase tracking-wider">Admin Portal</p>
              <p className="text-slate-500">User: <span className="font-mono font-bold text-slate-700">admin@smartcity.gov</span></p>
              <p className="text-slate-500">Pass: <span className="font-mono font-bold text-slate-700">password123</span></p>
            </div>
            <div className="space-y-1.5">
              <p className="font-bold text-slate-800 uppercase tracking-wider">Citizen Portal</p>
              <p className="text-slate-500">User: <span className="font-mono font-bold text-slate-700">rupayan@example.com</span></p>
              <p className="text-slate-500">Pass: <span className="font-mono font-bold text-slate-700">password123</span></p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;