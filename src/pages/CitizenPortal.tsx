import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockDb } from '@/backend/db';
import { issueService } from '@/backend/services/issueService';
import { aiService, ChatMessage } from '@/backend/services/aiService';
import { showSuccess } from '@/utils/toast';
import { Search, HandHelping, Loader2 } from 'lucide-react';
import IssueMapOverview from '@/components/IssueMapOverview';
import Footer from '@/components/Footer';

// Modular Components
import PortalHeader from '@/components/citizen/PortalHeader';
import HeroSection from '@/components/citizen/HeroSection';
import AIAgentTerminal from '@/components/citizen/AIAgentTerminal';
import ManualReportForm from '@/components/citizen/ManualReportForm';
import IssueCard from '@/components/citizen/IssueCard';
import ImpactTimeline from '@/components/citizen/ImpactTimeline';
import SevereAlertOverlay from '@/components/citizen/SevereAlertOverlay';
import DuplicateDetectionDialog from '@/components/citizen/DuplicateDetectionDialog';

const CitizenPortal = () => {
  const [user, setUser] = useState<any>(null);
  const [myIssues, setMyIssues] = useState<any[]>([]);
  const [nearbyIssues, setNearbyIssues] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAIAgent, setShowAIAgent] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [activeAlert, setActiveAlert] = useState<any>(null);
  const dismissedAlertIds = useRef<Set<string>>(new Set());
  
  const [similarIssues, setSimilarIssues] = useState<any[]>([]);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<any>(null);

  const [manualData, setManualData] = useState({
    title: '', description: '', address: '', lat: 12.8406, lng: 80.1534, imageUrl: ''
  });

  const [aiStep, setAiStep] = useState<'initial' | 'location' | 'confirm'>('initial');
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiData, setAiData] = useState({
    description: '', address: '', lat: 12.8406, lng: 80.1534, imageUrl: '', videoUrl: ''
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('current_user');
    if (!storedUser) return navigate('/login');
    const parsedUser = JSON.parse(storedUser);
    const dbUser = mockDb.users.find(u => u.id === parsedUser.id);
    setUser(dbUser || parsedUser);
    refreshData(parsedUser.id);
    checkNotifications(parsedUser.id);

    const alertInterval = setInterval(() => {
      const severeIssue = mockDb.issues.find(i => i.isSevereAlert && i.status !== 'Resolved');
      if (severeIssue && !dismissedAlertIds.current.has(severeIssue.id)) {
        setActiveAlert(severeIssue);
      } else {
        setActiveAlert(null);
      }
    }, 3000);

    return () => clearInterval(alertInterval);
  }, []);

  const checkNotifications = (userId: string) => {
    const resolvedUnnotified = mockDb.issues.filter(i => i.citizenId === userId && i.status === 'Resolved' && !i.notified);
    resolvedUnnotified.forEach(issue => {
      showSuccess(`Heroic Work! Your report "${issue.title}" has been resolved. You've earned 10 Impact Points! 🏆`);
      issueService.markAsNotified(issue.id);
    });
  };

  const refreshData = (userId: string) => {
    setMyIssues(mockDb.issues.filter(i => i.citizenId === userId));
    const nearby = issueService.getIssuesByRadius(12.8406, 80.1534, 5);
    setNearbyIssues(nearby.sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0)));
    const dbUser = mockDb.users.find(u => u.id === userId);
    if (dbUser) setUser(dbUser);
  };

  const handleUpvote = (issueId: string) => {
    issueService.toggleUpvote(issueId, user.id);
    refreshData(user.id);
  };

  const handleReport = (issueId: string) => {
    issueService.toggleReport(issueId, user.id);
    refreshData(user.id);
    showSuccess("Report submitted for admin review.");
  };

  const handleAddComment = (issueId: string) => {
    const text = commentText[issueId];
    if (!text?.trim()) return;
    issueService.addComment(issueId, user.id, user.name, text);
    setCommentText(prev => ({ ...prev, [issueId]: '' }));
    refreshData(user.id);
    showSuccess("Comment added!");
  };

  const handleDeleteComment = (issueId: string, commentId: string) => {
    issueService.deleteComment(issueId, commentId);
    refreshData(user.id);
    showSuccess("Comment deleted.");
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const similar = issueService.findSimilarIssues(manualData.description, { lat: manualData.lat, lng: manualData.lng });
    if (similar.length > 0) {
      setSimilarIssues(similar);
      setPendingSubmission({ type: 'manual', data: { ...manualData } });
      setShowDuplicateDialog(true);
    } else {
      finalizeManualSubmission(manualData);
    }
  };

  const finalizeManualSubmission = (data: any) => {
    issueService.createIssue(user.id, {
      title: data.title, description: data.description, imageUrl: data.imageUrl,
      location: { address: data.address, lat: data.lat, lng: data.lng }
    });
    refreshData(user.id);
    setShowManualForm(false);
    setManualData({ title: '', description: '', address: '', lat: 12.8406, lng: 80.1534, imageUrl: '' });
    showSuccess('Thank you for your contribution! Our team is on it.');
  };

  const handleAISubmit = async () => {
    if (!aiInput.trim() && aiStep !== 'confirm') return;
    const userMsg = aiInput;
    const newMessages: ChatMessage[] = [...aiMessages, { role: 'user', text: userMsg }];
    setAiMessages(newMessages);
    setAiInput('');

    if (aiStep === 'initial' || aiStep === 'location') {
      const analysis = aiService.analyzeConversation(newMessages);
      if (aiStep === 'initial') setAiData(prev => ({ ...prev, description: userMsg }));

      if (aiStep === 'location' || (!analysis.hasLocation && aiStep === 'initial')) {
        setIsGeocoding(true);
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(userMsg)}`);
          const data = await response.json();
          if (data && data.length > 0) {
            const { lat, lon, display_name } = data[0];
            setAiData(prev => ({ ...prev, address: display_name, lat: parseFloat(lat), lng: parseFloat(lon) }));
            setAiMessages(prev => [...prev, { role: 'bot', text: `I've found the location: ${display_name}. Does everything look correct? I'm ready to submit.` }]);
            setAiStep('confirm');
            setIsGeocoding(false);
            return;
          }
        } catch (e) {}
        setIsGeocoding(false);
      }

      setTimeout(() => {
        const botResponse = aiService.generateResponse(analysis, newMessages);
        setAiMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
        setAiStep(analysis.hasLocation ? 'confirm' : 'location');
      }, 1000);
    }
  };

  const handleAIConfirm = () => {
    const similar = issueService.findSimilarIssues(aiData.description, { lat: aiData.lat, lng: aiData.lng });
    if (similar.length > 0) {
      setSimilarIssues(similar);
      setPendingSubmission({ type: 'ai', data: { ...aiData } });
      setShowDuplicateDialog(true);
    } else {
      finalizeAISubmission(aiData);
    }
  };

  const finalizeAISubmission = (data: any) => {
    issueService.createIssue(user.id, {
      title: '', description: data.description, imageUrl: data.imageUrl, videoUrl: data.videoUrl,
      location: { address: data.address, lat: data.lat, lng: data.lng }
    });
    refreshData(user.id);
    setShowAIAgent(false);
    setAiMessages([]);
    setAiData({ description: '', address: '', lat: 12.8406, lng: 80.1534, imageUrl: '', videoUrl: '' });
    showSuccess('Report filed automatically! Thank you for being a hero.');
  };

  const handleMatchFound = (existingIssueId: string) => {
    issueService.toggleUpvote(existingIssueId, user.id);
    showSuccess("Thank you! We've added your support to the existing report.");
    setShowDuplicateDialog(false);
    setPendingSubmission(null);
    setShowManualForm(false);
    setShowAIAgent(false);
    refreshData(user.id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <DuplicateDetectionDialog 
        open={showDuplicateDialog} 
        onOpenChange={setShowDuplicateDialog}
        similarIssues={similarIssues}
        onMatchFound={handleMatchFound}
        onNoMatch={() => {
          if (pendingSubmission.type === 'manual') finalizeManualSubmission(pendingSubmission.data);
          else finalizeAISubmission(pendingSubmission.data);
          setShowDuplicateDialog(false);
          setPendingSubmission(null);
        }}
      />

      <SevereAlertOverlay 
        alert={activeAlert} 
        onDismiss={() => { dismissedAlertIds.current.add(activeAlert.id); setActiveAlert(null); }} 
      />

      <PortalHeader user={user} onLogout={() => { localStorage.removeItem('current_user'); navigate('/login'); }} />

      <main className="max-w-6xl mx-auto p-6 space-y-8 flex-1">
        <HeroSection 
          onStartAI={() => { setShowAIAgent(true); setShowManualForm(false); setAiMessages([{ role: 'bot', text: "Hello! I'm your CityCare AI Assistant. Describe the issue you're seeing." }]); setAiStep('initial'); }}
          onToggleManual={() => { setShowManualForm(!showManualForm); setShowAIAgent(false); }}
        />

        {showAIAgent && (
          <AIAgentTerminal 
            messages={aiMessages} step={aiStep} input={aiInput} data={aiData} isGeocoding={isGeocoding} chatEndRef={chatEndRef}
            onClose={() => setShowAIAgent(false)} onInputChange={setAiInput} onSubmit={handleAISubmit} onConfirm={handleAIConfirm}
            onFileUpload={(e, type) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setAiData(prev => ({ ...prev, [type === 'image' ? 'imageUrl' : 'videoUrl']: reader.result as string }));
                  setAiMessages(prev => [...prev, { role: 'user', text: `Uploaded a ${type}.` }]);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        )}

        {showManualForm && (
          <ManualReportForm 
            data={manualData} onClose={() => setShowManualForm(false)} onChange={setManualData} onSubmit={handleManualSubmit}
            onImageUpload={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setManualData(prev => ({ ...prev, imageUrl: reader.result as string }));
                reader.readAsDataURL(file);
              }
            }}
            onMapChange={async (lat, lng) => {
              setManualData(prev => ({ ...prev, lat, lng }));
              setIsGeocoding(true);
              try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                const data = await response.json();
                if (data?.display_name) setManualData(prev => ({ ...prev, address: data.display_name }));
              } catch (e) {} finally { setIsGeocoding(false); }
            }}
          />
        )}

        <Tabs defaultValue="nearby" className="w-full">
          <TabsList className="mb-8 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm inline-flex">
            <TabsTrigger value="nearby" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white">City Pulse</TabsTrigger>
            <TabsTrigger value="issues" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white">My Contributions</TabsTrigger>
            <TabsTrigger value="activity" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="nearby" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input placeholder="Search community reports..." className="pl-12 h-12 rounded-2xl border-slate-200 bg-white shadow-sm" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {nearbyIssues.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()) && i.status !== 'Flagged').map(issue => (
                    <IssueCard 
                      key={issue.id} issue={issue} user={user} commentText={commentText[issue.id] || ''}
                      onUpvote={handleUpvote} onReport={handleReport} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment}
                      onCommentChange={(id, text) => setCommentText(prev => ({ ...prev, [id]: text }))}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white">
                  <CardHeader className="p-6 border-b border-slate-50"><CardTitle className="text-lg font-black">City Pulse Map</CardTitle></CardHeader>
                  <CardContent className="p-4"><div className="rounded-2xl overflow-hidden border-2 border-white shadow-lg h-[300px]"><IssueMapOverview issues={nearbyIssues.filter(i => i.status !== 'Flagged')} /></div></CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="issues" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myIssues.length === 0 ? (
                <div className="col-span-full text-center py-32 bg-white rounded-[2rem] border-4 border-dashed border-slate-100">
                  <HandHelping className="w-10 h-10 text-slate-300 mx-auto mb-6" />
                  <h3 className="text-xl font-black text-slate-900 mb-2">No reports yet</h3>
                </div>
              ) : (
                myIssues.map(issue => (
                  <IssueCard 
                    key={issue.id} issue={issue} user={user} commentText={commentText[issue.id] || ''}
                    onUpvote={handleUpvote} onReport={handleReport} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment}
                    onCommentChange={(id, text) => setCommentText(prev => ({ ...prev, [id]: text }))}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <ImpactTimeline myIssues={myIssues} />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default CitizenPortal;