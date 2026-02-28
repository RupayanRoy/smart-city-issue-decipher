"use client";

import React from 'react';
import { AlertTriangle, ThumbsUp, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DuplicateDetectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  similarIssues: any[];
  onMatchFound: (id: string) => void;
  onNoMatch: () => void;
}

const DuplicateDetectionDialog: React.FC<DuplicateDetectionDialogProps> = ({ 
  open, onOpenChange, similarIssues, onMatchFound, onNoMatch 
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Reviewing</Badge>;
      case 'In Progress': return <Badge className="bg-sky-100 text-sky-700 border-sky-200">In Action</Badge>;
      case 'Resolved': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Resolved</Badge>;
      case 'Flagged': return <Badge className="bg-red-100 text-red-700 border-red-200">Invalid</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[2rem] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <AlertTriangle className="text-amber-500 w-6 h-6" /> Similar Issues Found
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            We found some existing reports in this area that look similar to yours. Is your issue one of these?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 my-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {similarIssues.map(issue => (
            <Card key={issue.id} className="border-2 border-slate-100 hover:border-emerald-500 transition-all cursor-pointer group" onClick={() => onMatchFound(issue.id)}>
              <CardContent className="p-6 flex gap-4">
                {issue.imageUrl && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    <img src={issue.imageUrl} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{issue.title}</h4>
                    {getStatusBadge(issue.status)}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{issue.description}</p>
                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" /> {issue.upvotes?.length || 0} Supporters
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {issue.location.address.split(',')[0]}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button variant="ghost" className="rounded-xl font-bold text-slate-500" onClick={onNoMatch}>
            None of these, submit my report
          </Button>
          <p className="text-[10px] text-slate-400 text-center sm:text-left italic">
            * Selecting an existing issue will upvote it and notify authorities of increased urgency.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DuplicateDetectionDialog;