import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockDb } from '@/backend/db';
import { showSuccess, showError } from '@/utils/toast';
import { Shield, User as UserIcon } from 'lucide-react';

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
      password
    };
    mockDb.users.push(newUser);
    mockDb.save();
    localStorage.setItem('current_user', JSON.stringify(newUser));
    showSuccess('Registration successful!');
    navigate('/citizen');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <Shield className="text-primary w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold">SmartCity Connect</CardTitle>
          <CardDescription>Citizen Issue Processing System</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@smartcity.gov" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <Button onClick={() => handleLogin('citizen')} variant="outline" className="w-full">
                  <UserIcon className="mr-2 w-4 h-4" /> Citizen
                </Button>
                <Button onClick={() => handleLogin('admin')} className="w-full">
                  <Shield className="mr-2 w-4 h-4" /> Admin
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <Button onClick={handleRegister} className="w-full mt-2">Create Account</Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;