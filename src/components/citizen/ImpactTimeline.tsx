"use client";

import React from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ImpactTimelineProps {
  myIssues: any[];
}

const ImpactTimeline: React.FC<ImpactTimelineProps> = ({ myIssues }) => {
  const activities = myIssues
    .flatMap(i => i.statusHistory.map((h: any) => ({ ...h, issueTitle: i.title, issueStatus: i.status })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white">
      <CardHeader className="p-8 border-b border-slate-50">
        <CardTitle className="text-2xl font-black text-slate-900">Impact Timeline</CardTitle>
        <CardDescription className="font-medium text-slate-500">Track the journey of your contributions.</CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-10 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
          {activities.map((activity, idx) => (
            <div key={idx} className="flex gap-6 relative z-10">
              <div className={`w-6 h-6 rounded-full border-4 border-white shadow-md shrink-0 mt-1 ${
                activity.status === 'Resolved' ? 'bg-emerald-500' : 
                activity.status === 'In Progress' ? 'bg-sky-500' : 
                activity.status === 'Flagged' ? 'bg-red-500' : 'bg-amber-500'
              }`} />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">
                  Report "<span className="text-emerald-600">{activity.issueTitle}</span>" moved to <span className="uppercase tracking-widest text-[10px] px-2 py-0.5 bg-slate-100 rounded-md ml-1">{activity.status}</span>
                </p>
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>{format(parseISO(activity.timestamp), 'MMM d, yyyy • HH:mm')}</span>
                  <span className="w-1 h-1 bg-slate-200 rounded-full" />
                  <span>Action by {activity.updatedBy}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImpactTimeline;