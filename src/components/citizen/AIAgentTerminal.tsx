"use client";

import React from 'react';
import { Bot, X, Camera, Video, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AIAgentTerminalProps {
  messages: any[];
  step: string;
  input: string;
  data: any;
  isGeocoding: boolean;
  chatEndRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
  onInputChange: (val: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => void;
  onSubmit: () => void;
  onConfirm: () => void;
}

const AIAgentTerminal: React.FC<AIAgentTerminalProps> = ({
  messages, step, input, data, isGeocoding, chatEndRef, onClose, onInputChange, onFileUpload, onSubmit, onConfirm
}) => {
  return (
    <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden flex flex-col h-[600px] bg-white animate-in fade-in slide-in-from-bottom-8 duration-500">
      <CardHeader className="bg-slate-900 text-white p-6 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-xl">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-lg font-black">CityCare AI Agent</CardTitle>
            <CardDescription className="text-slate-400 text-xs">Online & Ready to help</CardDescription>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={onClose}>
          <X className="w-6 h-6" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium shadow-sm ${msg.role === 'bot' ? 'bg-white text-slate-800 rounded-tl-none' : 'bg-emerald-600 text-white rounded-tr-none'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {step === 'confirm' && (
          <div className="flex justify-start">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-emerald-100 space-y-4 max-w-[90%]">
              <p className="font-black text-slate-900 flex items-center gap-2"><CheckCircle2 className="text-emerald-500 w-5 h-5" /> Summary of Report</p>
              <div className="space-y-2 text-xs text-slate-600">
                <p><span className="font-bold text-slate-900">Issue:</span> {data.description}</p>
                <p><span className="font-bold text-slate-900">Venue:</span> {data.address}</p>
                <div className="flex gap-2 mt-2">
                  {data.imageUrl && <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border"><img src={data.imageUrl} className="w-full h-full object-cover" /></div>}
                  {data.videoUrl && <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center border"><Video className="w-6 h-6 text-slate-400" /></div>}
                </div>
              </div>
              <Button onClick={onConfirm} className="w-full bg-emerald-600 hover:bg-emerald-700 font-black rounded-xl">Confirm & File Report</Button>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </CardContent>
      <div className="p-6 bg-white border-t border-slate-100 space-y-4">
        <div className="flex items-center gap-3">
          <label className="cursor-pointer p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-emerald-600">
            <Camera className="w-6 h-6" />
            <input type="file" accept="image/*" className="hidden" onChange={(e) => onFileUpload(e, 'image')} />
          </label>
          <label className="cursor-pointer p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-emerald-600">
            <Video className="w-6 h-6" />
            <input type="file" accept="video/*" className="hidden" onChange={(e) => onFileUpload(e, 'video')} />
          </label>
          <div className="flex-1 relative">
            <Input 
              placeholder={step === 'location' ? "Type the venue/address..." : "Describe the issue..."} 
              className="rounded-2xl h-12 border-slate-200 pr-12" 
              value={input}
              onChange={e => onInputChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onSubmit()}
              disabled={step === 'confirm'}
            />
            <Button 
              size="icon" 
              className="absolute right-1 top-1 h-10 w-10 rounded-xl bg-slate-900"
              onClick={onSubmit}
              disabled={step === 'confirm'}
            >
              {isGeocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AIAgentTerminal;