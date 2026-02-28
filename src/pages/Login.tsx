"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart, Shield, User, HardHat } from 'lucide-react';
import Footer from '@/components/Footer';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'citizen' | 'worker'>('citizen');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          if (profile.role === 'admin') navigate('/admin');
          else if (profile.role === 'worker') navigate('/worker');
          else navigate('/citizen');
        } else {
          navigate('/citizen');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
            <CardDescription className="text-slate-400">Sign in with your Username</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
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

            <div className="auth-container">
              <Auth
                supabaseClient={supabase}
                appearance={{ 
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: '#10b981',
                        brandAccent: '#059669',
                      }
                    }
                  }
                }}
                localization={{
                  variables: {
                    sign_up: {
                      email_label: 'Username',
                      email_input_placeholder: 'Choose a username',
                    },
                    sign_in: {
                      email_label: 'Username',
                      email_input_placeholder: 'Your username',
                    }
                  }
                }}
                providers={[]}
                theme="light"
                additionalData={{
                  role: role
                }}
              />
              <p className="text-[10px] text-slate-400 mt-2 text-center italic">
                Note: For this hackathon, your username acts as your unique ID.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-700 font-black text-xs uppercase tracking-widest">
                  <Shield className="w-4 h-4" /> Hackathon Admin Access
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