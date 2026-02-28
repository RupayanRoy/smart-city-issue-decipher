import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockDb } from '@/backend/db';
import { issueService } from '@/backend/services/issueService';
import { aiService, ChatMessage } from '@/backend/services/aiService';
import { notificationService } from '@/backend/services/notificationService';
import { showSuccess, showError } from '@/utils/toast';
import { Search, HandHelping, Loader2, Mail, RefreshCw, CheckCircle2, AlertTriangle, MapPin } from 'lucide-react';
import IssueMapOverview from '@/components/IssueMapOverview';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  const [showAIAgent, setShowAIAgent] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [activeAlert, setActiveAlert] = useState<any>(null);
  const dismissedAlertIds = useRef<Set<string>>(new Set());
  
  const [similarIssues, setSimilarIssues] = useState<any[]>([]);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<any>(null);

  // Map state
  const [mapCenter, setMapCenter] = useState<[number, number]>([12.8406, 80.1534]);

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

  const refreshData = (userId: string) => {
    const allIssues = [...mockDb.issues].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setNearbyIssues(allIssues);
    setMyIssues(mockDb.issues.filter(i => i.citizenId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    
    if (allIssues.length > 0) {
      setMapCenter([allIssues[0].location.lat, allIssues[0].location.lng]);
    }
    
    const dbUser = mockDb.users.find(u => u.id === userId);
    if (dbUser) setUser(dbUser);
  };

  const handleManualGeocode = async () => {
    if (!manualData.address.trim()) return;
    setIsGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualData.address)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        setManualData(prev => ({ ...prev, address: display_name, lat: newLat, lng: newLng }));
        setMapCenter([newLat, newLng]);
        showSuccess("Location found and pinned on map.");
      } else {
        showError("Could not find that location. Please try a different address.");
      }
    } catch (e) {
      showError("Geocoding service unavailable.");
    } finally {
      setIsGeocoding(false);
    }
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

  const handleReissue = (issueId: string) => {
    issueService.reissueIssue(issueId, user.id, "Citizen reported that the issue persists after resolution.");
    showSuccess("Issue re-issued with High Priority. Authorities have been notified.");
    refreshData(user.id);
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
            const newLat = parseFloat(lat);
            const newLng = parseFloat(lon);
            setAiData(prev => ({ ...prev, address: display_name, lat: newLat, lng: newLng }));
            setMapCenter([newLat, newLng]);
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

  const handleMarkRead = (notifId: string) => {
    notificationService.markAsRead(user.id, notifId);
    refreshData(user.id);
  };

  const filteredNearbyIssues = nearbyIssues.filter(i => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      i.title.toLowerCase().includes(query) || 
      i.description.toLowerCase().includes(query) || 
      i.category.toLowerCase().includes(query) ||
      i.location.address.toLowerCase().includes(query);
    
    return matchesSearch && i.status !== 'Flagged';
  });

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
            data={manualData} 
            onClose={() => setShowManualForm(false)} 
            onChange={setManualData} 
            onSubmit={handleManualSubmit}
            onLocate={handleManualGeocode}
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
              setMapCenter([lat, lng]);
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
            <TabsTrigger value="messages" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white flex items-center gap-2">
              Messages {notificationService.getUnreadCount(user?.id) > 0 && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="nearby" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input placeholder="Search by title, category, or description..." className="pl-12 h-12 rounded-2xl border-slate-200 bg-white shadow-sm" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {filteredNearbyIssues.map(issue => (
                    <IssueCard 
                      key={issue.id} issue={issue} user={user} commentText={commentText[issue.id] || ''}
                      onUpvote={handleUpvote} onReport={handleReport} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment}
                      onCommentChange={(id, text) => setCommentText(prev => ({ ...prev, [id]: text }))}
                    />
                  ))}
                  {filteredNearbyIssues.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                      <p className="text-slate-400 font-bold">No reports found matching your search.</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-6">
                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white">
                  <CardHeader className="p-6 border-b border-slate-50"><CardTitle className="text-lg font-black">City Pulse Map</CardTitle></CardHeader>
                  <CardContent className="p-4">
                    <div className="rounded-2xl overflow-hidden border-2 border-white shadow-lg h-[300px]">
                      <IssueMapOverview issues={filteredNearbyIssues} center={mapCenter} />
                    </div>
                  </CardContent>
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

          <TabsContent value="messages" className="space-y-6">
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="p-8 border-b border-slate-50">
                <CardTitle className="text-2xl font-black text-slate-900">Official Communications</CardTitle>
                <CardDescription className="font-medium text-slate-500">Updates regarding your filed reports and community alerts.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {!user?.notifications || user.notifications.length === 0 ? (
                  <div className="text-center py-20">
                    <Mail className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">No messages yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {user.notifications.map((notif: any) => (
                      <div 
                        key={notif.id} 
                        className={`p-6 rounded-3xl border-2 transition-all ${notif.isRead ? 'bg-slate-50 border-slate-100' : 'bg-white border-emerald-100 shadow-md'}`}
                        onClick={() => handleMarkRead(notif.id)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${notif.type === 'resolution' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                              {notif.type === 'resolution' ? <CheckCircle2 className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                            </div>
                            <div>
                              <h4 className="font-black text-slate-900">{notif.title}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(notif.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                          {!notif.isRead && <Badge className="bg-emerald-600">New</Badge>}
                        </div>
                        <p className="text-slate-600 text-sm font-medium mb-6 leading-relaxed">{notif.message}</p>
                        
                        {notif.type === 'resolution' && (
                          <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
                            <Button 
                              variant="outline" 
                              className="rounded-xl font-bold border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                              onClick={(e) => { e.stopPropagation(); showSuccess("Thank you for confirming!"); handleMarkRead(notif.id); }}
                            >
                              Confirm Resolution
                            </Button>
                            <Button 
                              variant="outline" 
                              className="rounded-xl font-bold border-2 border-red-600 text-red-600 hover:bg-red-50"
                              onClick={(e) => { e.stopPropagation(); handleReissue(notif.issueId); handleMarkRead(notif.id); }}
                            >
                              <RefreshCw className="mr-2 w-4 h-4" /> Re-issue (Problem Persists)
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
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