"use client";

import React from 'react';
import { ThumbsUp, Flag, MessageSquare, Send, Trash2, Video, Megaphone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface IssueCardProps {
  issue: any;
  user: any;
  commentText: string;
  onUpvote: (id: string) => void;
  onReport: (id: string) => void;
  onAddComment: (id: string) => void;
  onDeleteComment: (issueId: string, commentId: string) => void;
  onCommentChange: (id: string, text: string) => void;
}

const IssueCard: React.FC<IssueCardProps> = ({ 
  issue, user, commentText, onUpvote, onReport, onAddComment, onDeleteComment, onCommentChange 
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
    <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem] overflow-hidden bg-white">
      <div className="flex flex-col md:flex-row">
        {issue.imageUrl && (
          <div className="md:w-64 h-64 md:h-auto shrink-0">
            <img src={issue.imageUrl} alt={issue.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-8 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold rounded-lg">{issue.category}</Badge>
                {issue.priority === 'High' && <Badge className="bg-red-100 text-red-700 border-red-200">High Priority</Badge>}
                {issue.videoUrl && <Badge className="bg-blue-100 text-blue-700 border-blue-200 flex items-center gap-1"><Video className="w-3 h-3" /> Video</Badge>}
                {issue.isSevereAlert && <Badge className="bg-red-600 text-white flex items-center gap-1 animate-pulse"><Megaphone className="w-3 h-3" /> Severe Alert</Badge>}
              </div>
              <h3 className="font-black text-xl text-slate-900 leading-tight">{issue.title}</h3>
            </div>
            {getStatusBadge(issue.status)}
          </div>
          <p className="text-slate-500 text-sm font-medium mb-6 line-clamp-2">{issue.description}</p>
          
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant={issue.upvotes?.includes(user?.id) ? "default" : "outline"} 
              size="sm" 
              className={`rounded-xl font-bold gap-2 ${issue.upvotes?.includes(user?.id) ? 'bg-emerald-600' : 'border-2'}`}
              onClick={() => onUpvote(issue.id)}
            >
              <ThumbsUp className="w-4 h-4" /> {issue.upvotes?.length || 0} Support
            </Button>
            <Button 
              variant={issue.reports?.includes(user?.id) ? "destructive" : "outline"} 
              size="sm" 
              className={`rounded-xl font-bold gap-2 ${issue.reports?.includes(user?.id) ? 'bg-red-600' : 'border-2'}`}
              onClick={() => onReport(issue.id)}
            >
              <Flag className="w-4 h-4" /> Report
            </Button>
            <div className="flex items-center gap-2 text-slate-400 text-sm font-bold ml-auto">
              <MessageSquare className="w-4 h-4" /> {issue.comments?.length || 0} Comments
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-50">
            {issue.comments?.map((comment: any) => (
              <div key={comment.id} className="bg-slate-50 p-3 rounded-xl text-xs group/comment relative">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-black text-slate-900">{comment.userName}</p>
                  {comment.userId === user?.id && (
                    <button onClick={() => onDeleteComment(issue.id, comment.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="text-slate-600">{comment.text}</p>
              </div>
            ))}
            <div className="flex gap-2">
              <Input 
                placeholder="Add a comment..." 
                className="rounded-xl h-10 text-xs border-slate-200" 
                value={commentText}
                onChange={e => onCommentChange(issue.id, e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onAddComment(issue.id)}
              />
              <Button size="icon" className="rounded-xl h-10 w-10 bg-slate-900" onClick={() => onAddComment(issue.id)}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default IssueCard;