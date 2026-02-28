"use client";

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import Footer from '@/components/Footer';

const Login = () => {
  const navigate = useNavigate();

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
          // Default to citizen if no profile exists yet
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
            <CardDescription className="text-slate-400">Sign in to start making an impact</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
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
              providers={[]}
              theme="light"
            />
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Login;