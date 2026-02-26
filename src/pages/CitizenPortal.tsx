import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockDb } from '@/backend/db';
import { issueService } from '@/backend/services/issueService';
import { aiService } from '@/backend/services/aiService';
import { showSuccess, showError } from '@/utils/toast';
import { Plus, MapPin, Clock, AlertCircle, LogOut, Search, User as UserIcon, Bell, Map as MapIcon, Loader2, Camera, X, Trophy, Heart, Sparkles, HandHelping, ThumbsUp, MessageSquare, Send, Flag, Trash2, Video, Bot, CheckCircle2, FileText, Megaphone, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import LocationPicker from '@/components/LocationPicker';
import IssueMapOverview from '@/components/IssueMapOverview';
import Footer from '@/components/Footer';

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
  
  // Manual Form State
  const [manualData, setManualData] = useState({
    title: '',
    description: '',
    address: '',
    lat: 12.8406,
    lng: 80.1534,
    imageUrl: ''
  });

  // AI Agent State
  const [aiStep, setAiStep] = useState<'initial' | 'location' | 'confirm'>('initial');
  const [aiMessages, setAiMessages] = useState<{role: 'bot' | 'user', text: string}[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiData, setAiData] = useState({
    description: '',
    address: '',
    lat: 12.8406,
    lng: 80.1534,
    imageUrl: '',
    videoUrl: ''
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

    // Poll for severe alerts
    const alertInterval = setInterval(() => {
      const severeIssue = mockDb.issues.find(i => i.isSevereAlert && i.status !== 'Resolved');
      if (severeIssue) {
        // Only show if not already dismissed in this session
        if (!dismissedAlertIds.current.has(severeIssue.id)) {
          setActiveAlert(severeIssue);
        }
      } else {
        setActiveAlert(null);
      }
    }, 3000);

    return () => clearInterval(alertInterval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

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

  const handleDismissAlert = () => {
    if (activeAlert) {
      dismissedAlertIds.current.add(activeAlert.id);
      setActiveAlert(null);
    }
  };

  // Manual Form Logic
  const handleManualImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setManualData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualMapChange = async (lat: number, lng: number) => {
    setManualData(prev => ({ ...prev, lat, lng }));
    setIsGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data && data.display_name) {
        setManualData(prev => ({ ...prev, address: data.display_name }));
      }
    } catch (error) {} finally { setIsGeocoding(false); }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    issueService.createIssue(user.id, {
      title: manualData.title,
      description: manualData.description,
      imageUrl: manualData.imageUrl,
      location: { address: manualData.address, lat: manualData.lat, lng: manualData.lng }
    });
    refreshData(user.id);
    setShowManualForm(false);
    setManualData({ title: '', description: '', address: '', lat: 12.8406, lng: 80.1534, imageUrl: '' });
    showSuccess('Thank you for your contribution! Our team is on it.');
  };

  // AI Agent Logic
  const startAIAgent = () => {
    setShowAIAgent(true);
    setShowManualForm(false);
    setAiMessages([{ role: 'bot', text: "Hello! I'm your CityCare AI Assistant. Describe the issue you're seeing, and feel free to upload a photo or video." }]);
    setAiStep('initial');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAiData(prev => ({ ...prev, [type === 'image' ? 'imageUrl' : 'videoUrl']: reader.result as string }));
        setAiMessages(prev => [...prev, { role: 'user', text: `Uploaded a ${type}.` }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAISubmit = async () => {
    if (!aiInput.trim() && aiStep !== 'confirm') return;

    const userMsg = aiInput;
    setAiMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiInput('');

    if (aiStep === 'initial') {
      const analysis = aiService.analyzeIssue(userMsg);
      setAiData(prev => ({ ...prev, description: userMsg }));
      
      setTimeout(() => {
        const botResponse = aiService.generateResponse(analysis);
        setAiMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
        if (!analysis.hasLocation) {
          setAiStep('location');
        } else {
          setAiStep('confirm');
        }
      }, 1000);
    } else if (aiStep === 'location') {
      setIsGeocoding(true);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(userMsg)}`);
        const data = await response.json();
        if (data && data.length > 0) {
          const { lat, lon, display_name } = data[0];
          setAiData(prev => ({ ...prev, address: display_name, lat: parseFloat(lat), lng: parseFloat(lon) }));
          setAiMessages(prev => [...prev, { role: 'bot', text: `I've found the location: ${display_name}. Does everything look correct? I'm ready to submit.` }]);
          setAiStep('confirm');
        } else {
          setAiMessages(prev => [...prev, { role: 'bot', text: "I couldn't find that location. Could you try being more specific or give me a nearby landmark?" }]);
        }
      } catch (e) {
        setAiMessages(prev => [...prev, { role: 'bot', text: "Sorry, I had trouble searching for that location. Please try again." }]);
      } finally {
        setIsGeocoding(false);
      }
    }
  };

  const finalizeReport = () => {
    issueService.createIssue(user.id, {
      title: '', // AI will generate
      description: aiData.description,
      imageUrl: aiData.imageUrl,
      videoUrl: aiData.videoUrl,
      location: { address: aiData.address, lat: aiData.lat, lng: aiData.lng }
    });
    refreshData(user.id);
    setShowAIAgent(false);
    setAiMessages([]);
    setAiData({ description: '', address: '', lat: 12.8406, lng: 80.1534, imageUrl: '', videoUrl: '' });
    showSuccess('Report filed automatically! Thank you for being a hero.');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">Reviewing</Badge>;
      case 'In Progress': return <Badge className="bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-100">In Action</Badge>;
      case 'Resolved': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Resolved</Badge>;
      case 'Flagged': return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">Invalid</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredMyIssues = myIssues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || issue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Severe Alert Popup */}
      {activeAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-lg border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white border-t-8 border-red-600">
            <CardHeader className="bg-red-50 p-8 flex flex-row items-center gap-4">
              <div className="bg-red-600 p-3 rounded-2xl shadow-lg shadow-red-200 animate-bounce">
                <Megaphone className="text-white w-8 h-8" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-red-700">SEVERE COMMUNITY ALERT</CardTitle>
                <CardDescription className="text-red-600 font-bold uppercase tracking-widest text-[10px]">Immediate Attention Required</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">{activeAlert.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{activeAlert.description}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                <MapPin className="text-red-600 w-5 h-5" />
                <span className="text-sm font-bold text-slate-700">{activeAlert.location.address}</span>
              </div>
              <Button onClick={handleDismissAlert} className="w-full py-8 text-lg font-black bg-slate-900 hover:bg-slate-800 rounded-2xl shadow-xl transition-all">
                I Understand & Will Stay Safe
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
              <Heart className="text-white w-6 h-6 fill-current" />
            </div>
            <div>
              <span className="font-black text-2xl tracking-tight text-slate-900">CityCare</span>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Citizen Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
              <div className="bg-amber-100 p-1.5 rounded-lg">
                <Trophy className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Impact Points</p>
                <p className="text-sm font-black text-slate-900">{user?.points || 0} Points</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100"><Bell className="w-5 h-5 text-slate-500" /></Button>
              <div className="h-10 w-px bg-slate-100" />
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">Community Hero</p>
                </div>
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-red-50 hover:text-red-600" onClick={() => { localStorage.removeItem('current_user'); navigate('/login'); }}>
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8 flex-1">
        <div className="bg-emerald-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-emerald-200">
          <div className="relative z-10 space-y-4 max-w-2xl">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 backdrop-blur-sm px-3 py-1">Community Impact</Badge>
            <h2 className="text-4xl font-black leading-tight">Your voice shapes our city's future.</h2>
            <p className="text-emerald-100/80 text-lg font-medium">Choose how you want to report: talk to our AI agent for ease, or use the manual form for full control.</p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={startAIAgent} size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 rounded-2xl font-bold px-8 h-14 shadow-xl shadow-emerald-950/20">
                <Bot className="mr-2 w-5 h-5" /> Start AI Assistant
              </Button>
              <Button onClick={() => { setShowManualForm(!showManualForm); setShowAIAgent(false); }} variant="outline" size="lg" className="bg-emerald-800/50 border-emerald-700 text-white hover:bg-emerald-800 rounded-2xl font-bold px-8 h-14">
                <FileText className="mr-2 w-5 h-5" /> Manual Report
              </Button>
            </div>
          </div>
          <Sparkles className="absolute top-10 right-10 w-32 h-32 text-emerald-800/50 -rotate-12" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-800/30 rounded-full blur-3xl" />
        </div>

        {showAIAgent && (
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
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => setShowAIAgent(false)}>
                <X className="w-6 h-6" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {aiMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium shadow-sm ${msg.role === 'bot' ? 'bg-white text-slate-800 rounded-tl-none' : 'bg-emerald-600 text-white rounded-tr-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {aiStep === 'confirm' && (
                <div className="flex justify-start">
                  <div className="bg-white p-6 rounded-2xl shadow-md border border-emerald-100 space-y-4 max-w-[90%]">
                    <p className="font-black text-slate-900 flex items-center gap-2"><CheckCircle2 className="text-emerald-500 w-5 h-5" /> Summary of Report</p>
                    <div className="space-y-2 text-xs text-slate-600">
                      <p><span className="font-bold text-slate-900">Issue:</span> {aiData.description}</p>
                      <p><span className="font-bold text-slate-900">Venue:</span> {aiData.address}</p>
                      <div className="flex gap-2 mt-2">
                        {aiData.imageUrl && <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border"><img src={aiData.imageUrl} className="w-full h-full object-cover" /></div>}
                        {aiData.videoUrl && <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center border"><Video className="w-6 h-6 text-slate-400" /></div>}
                      </div>
                    </div>
                    <Button onClick={finalizeReport} className="w-full bg-emerald-600 hover:bg-emerald-700 font-black rounded-xl">Confirm & File Report</Button>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </CardContent>
            <div className="p-6 bg-white border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-3">
                <label className="cursor-pointer p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-emerald-600">
                  <Camera className="w-6 h-6" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />
                </label>
                <label className="cursor-pointer p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-emerald-600">
                  <Video className="w-6 h-6" />
                  <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} />
                </label>
                <div className="flex-1 relative">
                  <Input 
                    placeholder={aiStep === 'location' ? "Type the venue/address..." : "Describe the issue..."} 
                    className="rounded-2xl h-12 border-slate-200 pr-12" 
                    value={aiInput}
                    onChange={e => setAiInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAISubmit()}
                    disabled={aiStep === 'confirm'}
                  />
                  <Button 
                    size="icon" 
                    className="absolute right-1 top-1 h-10 w-10 rounded-xl bg-slate-900"
                    onClick={handleAISubmit}
                    disabled={aiStep === 'confirm'}
                  >
                    {isGeocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {showManualForm && (
          <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden animate-in fade-in slide-in-from-top-8 duration-500">
            <CardHeader className="bg-slate-50 p-8 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black text-slate-900">Manual Community Report</CardTitle>
                <CardDescription className="text-slate-500 font-medium">Fill in the details manually for full control.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setShowManualForm(false)}><X className="w-6 h-6" /></Button>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleManualSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold ml-1">What's the issue?</Label>
                      <Input required value={manualData.title} onChange={e => setManualData({...manualData, title: e.target.value})} placeholder="e.g. Broken street light on Oak Avenue" className="rounded-2xl h-14 border-slate-200 focus:ring-emerald-500" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold ml-1">Tell us more</Label>
                      <Textarea required className="min-h-[120px] rounded-2xl border-slate-200 focus:ring-emerald-500 p-4" value={manualData.description} onChange={e => setManualData({...manualData, description: e.target.value})} placeholder="Provide as much detail as possible..." />
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="text-slate-700 font-bold ml-1">Visual Evidence</Label>
                      <div className="flex items-center gap-6">
                        {manualData.imageUrl ? (
                          <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                            <img src={manualData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setManualData(prev => ({ ...prev, imageUrl: '' }))} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-all group">
                            <Camera className="w-8 h-8 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase mt-2 group-hover:text-emerald-600">Add Photo</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleManualImageUpload} />
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
                      <Input required value={manualData.address} onChange={e => setManualData({...manualData, address: e.target.value})} placeholder="Street address or landmark" className="rounded-2xl h-14 border-slate-200" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-slate-700 font-bold ml-1">Pin on Map</Label>
                    <div className="rounded-[2rem] overflow-hidden border-4 border-white shadow-xl">
                      <LocationPicker lat={manualData.lat} lng={manualData.lng} onChange={handleManualMapChange} />
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full py-8 text-xl font-black bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-xl shadow-emerald-100 transition-all transform hover:-translate-y-1">Submit Manual Report</Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="nearby" className="w-full">
          <TabsList className="mb-8 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm inline-flex">
            <TabsTrigger value="nearby" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">City Pulse</TabsTrigger>
            <TabsTrigger value="issues" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">My Contributions</TabsTrigger>
            <TabsTrigger value="activity" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="nearby" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
                  <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input placeholder="Search community reports..." className="pl-12 h-12 rounded-2xl border-slate-200 bg-white shadow-sm" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {nearbyIssues.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()) && i.status !== 'Flagged').map(issue => (
                    <Card key={issue.id} className="border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem] overflow-hidden bg-white">
                      <div className="flex flex-col md:flex-row">
                        {issue.imageUrl && (
                          <div className="md:w-64 h-64 md:h-auto shrink-0">
                            <img src={issue.imageUrl} alt={issue.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-8 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
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
                              onClick={() => handleUpvote(issue.id)}
                            >
                              <ThumbsUp className="w-4 h-4" /> {issue.upvotes?.length || 0} Support
                            </Button>
                            <Button 
                              variant={issue.reports?.includes(user?.id) ? "destructive" : "outline"} 
                              size="sm" 
                              className={`rounded-xl font-bold gap-2 ${issue.reports?.includes(user?.id) ? 'bg-red-600' : 'border-2'}`}
                              onClick={() => handleReport(issue.id)}
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
                                    <button onClick={() => handleDeleteComment(issue.id, comment.id)} className="text-slate-400 hover:text-red-500 transition-colors">
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
                                value={commentText[issue.id] || ''}
                                onChange={e => setCommentText(prev => ({ ...prev, [issue.id]: e.target.value }))}
                                onKeyDown={e => e.key === 'Enter' && handleAddComment(issue.id)}
                              />
                              <Button size="icon" className="rounded-xl h-10 w-10 bg-slate-900" onClick={() => handleAddComment(issue.id)}>
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white">
                  <CardHeader className="p-6 border-b border-slate-50">
                    <CardTitle className="text-lg font-black">City Pulse Map</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="rounded-2xl overflow-hidden border-2 border-white shadow-lg h-[300px]">
                      <IssueMapOverview issues={nearbyIssues.filter(i => i.status !== 'Flagged')} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white">
                  <CardHeader className="p-6 border-b border-slate-50">
                    <CardTitle className="text-lg font-black">Top Contributors</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {mockDb.users.filter(u => u.role === 'citizen').sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 5).map((u, i) => (
                      <div key={u.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs text-slate-500">
                            {i + 1}
                          </div>
                          <span className="font-bold text-sm text-slate-700">{u.name}</span>
                        </div>
                        <Badge variant="outline" className="font-black text-[10px]">{u.points || 0} pts</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="issues" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMyIssues.length === 0 ? (
                <div className="col-span-full text-center py-32 bg-white rounded-[2rem] border-4 border-dashed border-slate-100">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HandHelping className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">No reports yet</h3>
                  <p className="text-slate-400 font-medium max-w-xs mx-auto">Start your journey as a community hero by reporting your first issue.</p>
                </div>
              ) : (
                filteredMyIssues.map(issue => (
                  <Card key={issue.id} className="border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem] overflow-hidden group bg-white">
                    <div className="flex flex-col h-full">
                      {issue.imageUrl && (
                        <div className="h-56 overflow-hidden relative">
                          <img src={issue.imageUrl} alt={issue.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-4 right-4">
                            {getStatusBadge(issue.status)}
                          </div>
                        </div>
                      )}
                      <CardContent className="p-8 flex-1 flex flex-col">
                        {!issue.imageUrl && (
                          <div className="flex justify-between items-start mb-6">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold rounded-lg">{issue.category}</Badge>
                            {getStatusBadge(issue.status)}
                          </div>
                        )}
                        <div className="space-y-3 mb-6">
                          <h3 className="font-black text-xl text-slate-900 leading-tight">{issue.title}</h3>
                          <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed">{issue.description}</p>
                        </div>
                        <div className="mt-auto pt-6 border-t border-slate-50 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-slate-400">
                              <ThumbsUp className="w-4 h-4 text-emerald-500" />
                              <span className="text-xs font-bold">{issue.upvotes?.length || 0} Supporters</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                              <Clock className="w-4 h-4" />
                              <span className="text-xs font-bold">{format(parseISO(issue.createdAt), 'MMM d, yyyy')}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white">
              <CardHeader className="p-8 border-b border-slate-50">
                <CardTitle className="text-2xl font-black text-slate-900">Impact Timeline</CardTitle>
                <CardDescription className="font-medium text-slate-500">Track the journey of your contributions.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-10 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {myIssues.flatMap(i => i.statusHistory.map((h: any) => ({ ...h, issueTitle: i.title, issueStatus: i.status }))).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((activity, idx) => (
                    <div key={idx} className="flex gap-6 relative z-10">
                      <div className={`w-6 h-6 rounded-full border-4 border-white shadow-md shrink-0 mt-1 ${activity.status === 'Resolved' ? 'bg-emerald-500' : activity.status === 'In Progress' ? 'bg-sky-500' : activity.status === 'Flagged' ? 'bg-red-500' : 'bg-amber-500'}`} />
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
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default CitizenPortal;