"use client";

import React from 'react';
import { X, Camera, MapPin, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import LocationPicker from '@/components/LocationPicker';

interface ManualReportFormProps {
  data: any;
  onClose: () => void;
  onChange: (data: any) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMapChange: (lat: number, lng: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onLocate?: () => void;
}

const ManualReportForm: React.FC<ManualReportFormProps> = ({
  data, onClose, onChange, onImageUpload, onMapChange, onSubmit, onLocate
}) => {
  return (
    <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden animate-in fade-in slide-in-from-top-8 duration-500">
      <CardHeader className="bg-slate-50 p-8 border-b border-slate-100 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-black text-slate-900">Manual Community Report</CardTitle>
          <CardDescription className="text-slate-500 font-medium">Fill in the details manually for full control.</CardDescription>
        </div>
        <Button variant="ghost" size="icon" className="rounded-xl" onClick={onClose}><X className="w-6 h-6" /></Button>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={onSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold ml-1">What's the issue?</Label>
                <Input required value={data.title} onChange={e => onChange({...data, title: e.target.value})} placeholder="e.g. Broken street light on Oak Avenue" className="rounded-2xl h-14 border-slate-200 focus:ring-emerald-500" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold ml-1">Tell us more</Label>
                <Textarea required className="min-h-[120px] rounded-2xl border-slate-200 focus:ring-emerald-500 p-4" value={data.description} onChange={e => onChange({...data, description: e.target.value})} placeholder="Provide as much detail as possible..." />
              </div>
              
              <div className="space-y-3">
                <Label className="text-slate-700 font-bold ml-1">Visual Evidence</Label>
                <div className="flex items-center gap-6">
                  {data.imageUrl ? (
                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                      <img src={data.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => onChange({ ...data, imageUrl: '' })} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-all group">
                      <Camera className="w-8 h-8 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase mt-2 group-hover:text-emerald-600">Add Photo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={onImageUpload} />
                    </label>
                  )}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-bold text-slate-700">Upload a photo</p>
                    <p className="text-xs text-slate-400 leading-relaxed">Photos help our response teams understand the situation better.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-bold ml-1">Location</Label>
                <div className="flex gap-2">
                  <Input 
                    required 
                    value={data.address} 
                    onChange={e => onChange({...data, address: e.target.value})} 
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), onLocate?.())}
                    placeholder="Street address or landmark" 
                    className="rounded-2xl h-14 border-slate-200 flex-1" 
                  />
                  <Button 
                    type="button" 
                    onClick={onLocate} 
                    className="h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 px-6"
                    title="Locate on map"
                  >
                    <Search className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Label className="text-slate-700 font-bold ml-1">Pin on Map</Label>
              <div className="rounded-[2rem] overflow-hidden border-4 border-white shadow-xl">
                <LocationPicker lat={data.lat} lng={data.lng} onChange={onMapChange} />
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full py-8 text-xl font-black bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-xl shadow-emerald-100 transition-all transform hover:-translate-y-1">Submit Manual Report</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ManualReportForm;