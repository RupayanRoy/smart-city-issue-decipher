"use client";

import React, { useState } from 'react';
import { Search, Clock, CheckCircle2, AlertCircle, MapPin, ArrowRight, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format, parseISO } from 'date-fns';
import { mockDb } from '@/backend/db';

interface StatusTrackerProps {
  myIssues: any[];
}

const StatusTracker: React.FC<StatusTrackerProps> = ({ myIssues }) => {
  const [searchId, setSearchId] = useState('');
  const [foundIssue, setFoundIssue] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = () => {
    setError('');
    const issue = mockDb.issues.find(i => i.id.toLowerCase() === searchId.toLowerCase().trim());
    if (issue) {
      setFoundIssue(issue);
    } else {
      setFoundIssue(null);
      setError('No report found with that ID. Please check and try again.');
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'Pending': return 25;
      case 'In Progress': return 50;
      case 'Completed': return 75;
      case 'Resolved': return 100;
      default: return 0;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Reviewing</Badge>;
      case 'In Progress': return <Badge className="bg-sky-100 text-sky-700 border-sky-200">In Action</Badge>;
      case 'Completed': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Work Finished</Badge>;
      case 'Resolved': return <Badge className="bg-emerald-600 text-white">Resolved</Badge>;
      case 'Flagged': return <Badge className="bg-red-100 text-red-700 border-red-200">Invalid</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white">
        <CardHeader className="p-8 bg-slate-900 text-white">
          <CardTitle className="text-2xl font-black">Track Your Report</CardTitle>
          <CardDescription className="text-slate-400 font-medium">Enter your Report ID to see real-time updates and resolution progress.</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Enter Report ID (e.g. iss-1)..." 
                className="pl-12 h-14 rounded-2xl border-slate-200 bg-slate-50 font-bold"
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} className="h-14 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-lg shadow-lg shadow-emerald-100">
              Track Progress
            </Button>
          </div>
          {error && <p className="text-red-500 text-sm font-bold mt-4 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</p>}
        </CardContent>
      </Card>

      {foundIssue && (
        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold">{foundIssue.category}</Badge>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">ID: {foundIssue.id}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">{foundIssue.title}</h3>
            </div>
            {getStatusBadge(foundIssue.status)}
          </div>
          
          <CardContent className="p-8 space-y-10">
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-black text-slate-500 uppercase tracking-widest">
                <span>Report Filed</span>
                <span>In Review</span>
                <span>In Action</span>
                <span>Resolved</span>
              </div>
              <Progress value={getStatusStep(foundIssue.status)} className="h-3 bg-slate-100" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h4 className="font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest text-xs">
                  <ClipboardList className="w-4 h-4 text-emerald-600" /> Resolution Timeline
                </h4>
                <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {foundIssue.statusHistory.map((history: any, idx: number) => (
                    <div key={idx} className="flex gap-6 relative z-10">
                      <div className={`w-6 h-6 rounded-full border-4 border-white shadow-md shrink-0 mt-1 ${
                        history.status === 'Resolved' ? 'bg-emerald-500' : 
                        history.status === 'In Progress' ? 'bg-sky-500' : 'bg-amber-500'
                      }`} />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900">
                          Status updated to <span className="text-emerald-600">{history.status}</span>
                        </p>
                        <p className="text-xs text-slate-500 font-medium">{history.note || 'System update'}</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <span>{format(parseISO(history.timestamp), 'MMM d, yyyy • HH:mm')}</span>
                          <span className="w-1 h-1 bg-slate-200 rounded-full" />
                          <span>By {history.updatedBy}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest text-xs">
                  <MapPin className="w-4 h-4 text-emerald-600" /> Location Details
                </h4>
                <div className="bg-slate-50 p-6 rounded-[2rem] space-y-4">
                  <p className="text-sm font-bold text-slate-700">{foundIssue.location.address}</p>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                    <span>Lat: {foundIssue.location.lat.toFixed(4)}</span>
                    <span>Lng: {foundIssue.location.lng.toFixed(4)}</span>
                  </div>
                </div>
                {foundIssue.assignedTo && (
                  <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Assigned Department</p>
                    <p className="text-lg font-black text-emerald-900">{foundIssue.assignedTo}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!foundIssue && myIssues.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs ml-2">Your Recent Reports</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myIssues.slice(0, 4).map(issue => (
              <Card key={issue.id} className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer bg-white rounded-2xl overflow-hidden group" onClick={() => { setSearchId(issue.id); handleSearch(); }}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {issue.id}</p>
                    <h5 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{issue.title}</h5>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusTracker;