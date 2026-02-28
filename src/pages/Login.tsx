import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockDb } from '@/backend/db';
import { showSuccess, showError } from '@/utils/toast';
import { Heart, Shield, User as UserIcon, Info, HardHat } from 'lucide-react';
import Footer from '@/components/Footer';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleLogin = (role: 'citizen' | 'admin' | 'worker') => {
    const user = mockDb.users.find(u => u.email === email && u.role === role);
    if (user) {
      localStorage.setItem('current_user', JSON.stringify(user));
      showSuccess(`Welcome back, ${user.name}!`);
      if (role === 'admin') navigate('/admin');
      else if (role === 'worker') navigate('/worker');
      else navigate('/citizen');
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
                <div className="grid grid-cols-3 gap-2 pt-4">
                  <Button onClick={() => handleLogin('citizen')} variant="outline" className="w-full rounded-xl h-12 border-2 text-[10px] px-1">
                    <UserIcon className="mr-1 w-3 h-3" /> Citizen
                  </Button>
                  <Button onClick={() => handleLogin('worker')} variant="outline" className="w-full rounded-xl h-12 border-2 text-[10px] px-1">
                    <HardHat className="mr-1 w-3 h-3" /> Worker
                  </Button>
                  <Button onClick={() => handleLogin('admin')} className="w-full rounded-xl h-12 bg-slate-900 hover:bg-slate-800 text-[10px] px-1">
                    <Shield className="mr-1 w-3 h-3" /> Admin
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
          <div className="grid grid-cols-3 gap-4 text-[10px]">
            <div className="space-y-1">
              <p className="font-bold text-slate-800 uppercase">Admin</p>
              <p className="text-slate-500">admin@smartcity.gov</p>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-slate-800 uppercase">Worker</p>
              <p className="text-slate-500">john@citycare.gov</p>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-slate-800 uppercase">Citizen</p>
              <p className="text-slate-500">rupayan@example.com</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;