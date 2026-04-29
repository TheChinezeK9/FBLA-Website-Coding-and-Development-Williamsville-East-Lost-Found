import React, { useState, useEffect, useRef } from 'react';
import { Search, Calendar, Camera, CheckCircle, X, Shield, Check, Trash2, ArrowUp, Plus, Minus } from 'lucide-react';
import { LostItem, SchoolTheme, Category, User, ClaimedLog } from '../types';
import { CATEGORIES } from '../constants';

interface BulletinBoardProps {
  school: SchoolTheme;
  items: LostItem[];
  claimLogs?: ClaimedLog[];
  onApproveClaim?: (itemId: string) => void;
  setItems: React.Dispatch<React.SetStateAction<LostItem[]>>;
  goBack: () => void;
  initialTab?: 'BOARD' | 'SUBMIT' | 'ADMIN';
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  currentUser: User;
}

export const BulletinBoard: React.FC<BulletinBoardProps> = ({
  school,
  items,
  claimLogs = [],
  onApproveClaim,
  setItems,
  goBack,
  initialTab = 'BOARD',
  isAdmin,
  setIsAdmin,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'BOARD' | 'SUBMIT' | 'ADMIN'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [claimingItem, setClaimingItem] = useState<LostItem | null>(null);
  const [claimName, setClaimName] = useState('');
  const [claimEmail, setClaimEmail] = useState(currentUser.email || '');
  const [claimGrade, setClaimGrade] = useState((currentUser.studentId || '').replace(/\D/g, ''));
  const [claimLastSeen, setClaimLastSeen] = useState('');
  const [claimProof, setClaimProof] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemCat, setNewItemCat] = useState<Category>('Clothing');
  const [newItemImage, setNewItemImage] = useState<string | null>(null);
  const [foundLocation, setFoundLocation] = useState('');
  const [finderName, setFinderName] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [rejectingClaimItem, setRejectingClaimItem] = useState<LostItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectReasonError, setRejectReasonError] = useState(false);
  const [rejectingFoundItem, setRejectingFoundItem] = useState<LostItem | null>(null);
  const [rejectFoundReason, setRejectFoundReason] = useState('');
  const [rejectFoundReasonError, setRejectFoundReasonError] = useState(false);
  const [viewingImage, setViewingImage] = useState<{ src: string; alt: string } | null>(null);
  const [imageZoom, setImageZoom] = useState(1);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (isAdmin) setActiveTab('ADMIN');
  }, [isAdmin]);

  const filteredItems = items.filter(item => {
    if (item.schoolId !== school.id) return false;
    if (!item.name.toLowerCase().includes(searchTerm.toLowerCase()) && !item.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    return item.status === 'lost' || item.status === 'found' || item.status === 'pending_claim' || item.status === 'claimed';
  });

  const schoolClaimLogs = claimLogs
    .filter(log => log.schoolId === school.id)
    .sort((a, b) => new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime());

  const sendNotification = async ({ userId, email, text }: { userId?: string; email?: string; text: string }) => {
    const cleanedEmail = String(email || '').trim();
    if (!userId && !cleanedEmail) return;
    try {
      const primary = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email: cleanedEmail, text })
      });
      if (primary.ok) return;
      if (!userId) return;
      await fetch(`/api/users/${userId}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, email: cleanedEmail })
      });
    } catch {
    }
  };

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimingItem) return;
    setItems(prev =>
      prev.map(item =>
        item.id === claimingItem.id
          ? {
              ...item,
              status: 'pending_claim',
              claimantName: claimName.trim(),
              claimantEmail: currentUser.email,
              claimantGrade: claimGrade.trim(),
              claimantUserId: currentUser.id,
              claimantLastSeen: claimLastSeen.trim(),
              claimantProof: claimProof.trim()
            }
          : item
      )
    );
    setClaimingItem(null);
    setClaimName('');
    setClaimEmail(currentUser.email || '');
    setClaimGrade((currentUser.studentId || '').replace(/\D/g, ''));
    setClaimLastSeen('');
    setClaimProof('');
  };

  const openRejectFound = (item: LostItem) => {
    setRejectingFoundItem(item);
    setRejectFoundReason('');
    setRejectFoundReasonError(false);
  };

  const rejectFound = async () => {
    if (!rejectingFoundItem) return;
    if (!rejectFoundReason.trim()) {
      setRejectFoundReasonError(true);
      return;
    }
    await sendNotification({
      userId: rejectingFoundItem.reporterUserId,
      email: rejectingFoundItem.reporterEmail,
      text: `Your found item inquiry for "${rejectingFoundItem.name}" was rejected. Reason: ${rejectFoundReason.trim()}`
    });
    setItems(prev => prev.filter(i => i.id !== rejectingFoundItem.id));
    setRejectingFoundItem(null);
    setRejectFoundReason('');
    setRejectFoundReasonError(false);
  };

  const approveClaim = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      await sendNotification({
        userId: item.claimantUserId,
        email: item.claimantEmail,
        text: `Your claim item inquiry for "${item.name}" was accepted.`
      });
    }

    if (onApproveClaim) {
      onApproveClaim(id);
      return;
    }

    setItems(prev => prev.map(i => (i.id === id ? { ...i, status: 'claimed' } : i)));
  };

  const openRejectClaim = (item: LostItem) => {
    setRejectingClaimItem(item);
    setRejectReason('');
    setRejectReasonError(false);
  };

  const rejectClaim = async () => {
    if (!rejectingClaimItem) return;
    if (!rejectReason.trim()) {
      setRejectReasonError(true);
      return;
    }

    await sendNotification({
      userId: rejectingClaimItem.claimantUserId,
      email: rejectingClaimItem.claimantEmail,
      text: `Your claim item inquiry for "${rejectingClaimItem.name}" was rejected. Reason: ${rejectReason.trim()}`
    });

    setItems(prev =>
      prev.map(i =>
        i.id === rejectingClaimItem.id
          ? {
              ...i,
              status: 'found',
              claimantName: undefined,
              claimantEmail: undefined,
              claimantGrade: undefined,
              claimantUserId: undefined,
              claimantLastSeen: undefined,
              claimantProof: undefined
            }
          : i
      )
    );

    setRejectingClaimItem(null);
    setRejectReason('');
    setRejectReasonError(false);
  };

  const approveLostItem = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      await sendNotification({
        userId: item.reporterUserId,
        email: item.reporterEmail,
        text: `Your found item inquiry for "${item.name}" was accepted.`
      });
    }
    setItems(prev => prev.map(i => (i.id === id ? { ...i, status: 'found' } : i)));
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setNewItemImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setNewItemName('');
    setNewItemDesc('');
    setNewItemCat('Clothing');
    setNewItemImage(null);
    setFoundLocation('');
    setFinderName('');
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const handleSubmitItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newItemName.trim() ||
      !newItemDesc.trim() ||
      !newItemImage ||
      !foundLocation.trim() ||
      !finderName.trim()
    ) return;

    const newItem: LostItem = {
      id: Math.random().toString(36).slice(2, 11),
      name: newItemName.trim(),
      description: newItemDesc.trim(),
      category: newItemCat,
      schoolId: school.id,
      date: new Date().toISOString().split('T')[0],
      status: 'lost',
      imageUrl: newItemImage,
      reporterUserId: currentUser.id,
      reporterEmail: currentUser.email,
      foundLocation: foundLocation.trim(),
      finderName: finderName.trim()
    };

    setItems(prev => [newItem, ...prev]);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setActiveTab('BOARD');
      resetForm();
    }, 2500);
  };

  return (
    <div className="min-h-screen w-full text-slate-900 dark:text-white pb-20 transition-colors duration-300">
      <header
        className="pt-32 pb-16 px-6 rounded-b-[40px] shadow-lg relative overflow-hidden mb-12 text-black"
        style={{
          backgroundImage: 'linear-gradient(90deg, rgba(243, 223, 155, 0.82) 0%, rgba(255, 250, 244, 0.12) 18%, rgba(231, 163, 155, 1) 50%, rgba(255, 250, 244, 0.12) 82%, rgba(243, 223, 155, 0.82) 100%)'
        }}
      >
        <div className="absolute top-0 right-0 p-8 opacity-35 rotate-12">
          <img src={school.logo} alt="Logo" className="w-64 h-64 object-contain" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <button onClick={goBack} className="flex items-center gap-2 font-bold mb-6 opacity-90 hover:opacity-100 transition-all text-sm uppercase tracking-widest text-black">
              <ArrowUp className="-rotate-90" size={18} /> Back to Home
            </button>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 leading-none text-black drop-shadow-sm">{school.name}</h1>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => setActiveTab('SUBMIT')} className="flex items-center gap-2 px-5 py-3 rounded-[25px] font-bold text-sm uppercase tracking-wider bg-white/20 backdrop-blur-xl border border-black/15 hover:bg-white/30 text-black transition-all shadow-lg hover:-translate-y-0.5">
              <Camera size={16} /> Report Lost Item
            </button>
            {activeTab !== 'BOARD' && (
              <button onClick={() => setActiveTab('BOARD')} className="flex items-center gap-2 px-5 py-3 bg-white/30 text-black border border-black/15 rounded-[25px] font-bold text-sm uppercase tracking-wider hover:bg-white/40 transition-all">
                View Board
              </button>
            )}
            {isAdmin && (
              <button onClick={() => setActiveTab('ADMIN')} className="flex items-center gap-2 px-5 py-3 rounded-[25px] font-bold text-sm uppercase tracking-wider bg-yellow-400/25 border border-black/15 hover:bg-yellow-400/35 text-black transition-all shadow-lg">
                <Shield size={16} /> Admin Panel
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6">
        {activeTab === 'BOARD' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-[#2b2b2b] p-4 rounded-[25px] shadow-sm border border-slate-200 dark:border-[#4b5563]">
              <div className="relative flex-1 w-full md:w-auto">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 opacity-50" size={20} />
                <input type="text" placeholder="Search items..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-[#f4f6f8] dark:bg-[#1f1f1f] border border-slate-200 dark:border-[#f3df9b] py-3 pl-12 pr-6 rounded-[18px] outline-none font-medium text-slate-900 dark:text-white" />
              </div>
              <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 no-scrollbar">
                {['All', ...CATEGORIES].map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat as Category | 'All')} className="px-5 py-2.5 rounded-[18px] font-bold whitespace-nowrap transition-all border text-slate-500 dark:text-white border-slate-200 dark:border-[#e7a39b]" style={selectedCategory === cat ? { backgroundColor: school.palette.primary, color: 'white', borderColor: school.palette.primary } : {}}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map(item => (
                <div key={item.id} className="group neon-card bg-white dark:bg-[#2b2b2b] rounded-[18px] border border-slate-200 dark:border-[#4b5563] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1">
                  <div className="h-56 relative overflow-hidden bg-slate-100 dark:bg-[#1f1f1f]">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      onClick={() => {
                        setViewingImage({ src: item.imageUrl, alt: item.name });
                        setImageZoom(1);
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md ${item.status === 'found' ? 'bg-green-500 text-white' : item.status === 'pending_claim' ? 'bg-blue-500 text-white' : item.status === 'lost' ? 'bg-amber-500 text-white' : 'bg-slate-400 text-white'}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white shadow-md" style={{ color: school.palette.primary }}>{item.category}</span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1">{item.name}</h3>
                      <div className="font-bold text-xs uppercase flex items-center gap-1 shrink-0 ml-2" style={{ color: school.palette.primary, opacity: 0.82 }}>
                        <Calendar size={12} /> {item.date}
                      </div>
                    </div>
                    <p className="text-slate-500 dark:text-white text-sm font-medium leading-relaxed mb-3 line-clamp-2">{item.description}</p>
                    {item.foundLocation && <p className="text-xs text-slate-500 dark:text-white mb-1"><span className="font-bold">Location Found:</span> {item.foundLocation}</p>}
                    {item.finderName && <p className="text-xs text-slate-500 dark:text-white mb-4"><span className="font-bold">Found By:</span> {item.finderName}</p>}
                    <div className="mt-auto">
                      {item.status === 'lost' && <div className="w-full py-3 rounded-[12px] font-bold text-center bg-amber-50 text-amber-600 border border-amber-100 text-sm uppercase tracking-widest">Pending Review</div>}
                      {item.status === 'found' && (
                        <button onClick={() => setClaimingItem(item)} className="w-full py-3 rounded-[12px] font-bold text-sm uppercase tracking-widest border-2 bg-white dark:bg-[#2b2b2b] hover:opacity-80 transition-all" style={{ borderColor: school.palette.primary, color: school.palette.primary }}>
                          Claim Item
                        </button>
                      )}
                      {item.status === 'pending_claim' && <div className="w-full py-3 rounded-[12px] font-bold text-center bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-white border border-blue-100 dark:border-blue-800 text-sm uppercase tracking-widest">Pending Approval</div>}
                      {item.status === 'claimed' && <div className="w-full py-3 rounded-[12px] font-bold text-center bg-slate-100 dark:bg-[#1f1f1f] text-slate-400 border border-slate-200 dark:border-[#4b5563] text-sm uppercase tracking-widest">Claimed</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'SUBMIT' && (
          <div className="max-w-2xl mx-auto">
            {submitSuccess ? (
              <div className="flex flex-col items-center justify-center py-24 gap-6 animate-fade-in-up text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: school.palette.primary }}>
                  <CheckCircle size={40} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Report Submitted!</h2>
                <p className="text-slate-500 dark:text-white max-w-sm">Your item has been submitted for admin review.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitItem} className="bg-white dark:bg-[#2b2b2b] p-8 md:p-10 rounded-[25px] shadow-sm space-y-5" style={{ borderTop: `4px solid ${school.palette.primary}` }}>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Item Name *</label>
                  <input required value={newItemName} onChange={e => setNewItemName(e.target.value)} className="w-full bg-[#f4f6f8] dark:bg-[#1f1f1f] border border-slate-200 dark:border-[#4b5563] p-4 rounded-[14px] outline-none text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Category *</label>
                  <select required value={newItemCat} onChange={e => setNewItemCat(e.target.value as Category)} className="w-full bg-[#f4f6f8] dark:bg-[#1f1f1f] border border-slate-200 dark:border-[#4b5563] p-4 rounded-[14px] outline-none text-slate-900 dark:text-white">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Photo *</label>
                  <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  {newItemImage ? (
                    <div className="relative h-40 rounded-[14px] overflow-hidden">
                      <img src={newItemImage} className="w-full h-full object-cover" alt="Preview" />
                      <button type="button" onClick={() => setNewItemImage(null)} className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full"><X size={14} /></button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => photoInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-slate-300 dark:border-[#3a4558] rounded-[14px] flex flex-col items-center justify-center text-slate-400">
                      <Camera size={28} />
                      <span className="text-sm font-bold">Add Photo</span>
                    </button>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Location Found *</label>
                  <input
                    required
                    value={foundLocation}
                    onChange={e => setFoundLocation(e.target.value)}
                    className="w-full bg-[#f4f6f8] dark:bg-[#1f1f1f] border border-slate-200 dark:border-[#4b5563] p-4 rounded-[14px] outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Finder Name *</label>
                  <input
                    required
                    value={finderName}
                    onChange={e => setFinderName(e.target.value)}
                    className="w-full bg-[#f4f6f8] dark:bg-[#1f1f1f] border border-slate-200 dark:border-[#4b5563] p-4 rounded-[14px] outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Description *</label>
                  <textarea required rows={4} value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} className="w-full bg-[#f4f6f8] dark:bg-[#1f1f1f] border border-slate-200 dark:border-[#4b5563] p-4 rounded-[14px] outline-none text-slate-900 dark:text-white" />
                </div>
                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => setActiveTab('BOARD')} className="flex-1 py-4 rounded-[14px] font-bold text-slate-500 bg-slate-100 dark:bg-[#1f1f1f]">Cancel</button>
                  <button type="submit" className="flex-1 py-4 rounded-[14px] font-bold text-white shadow-lg" style={{ backgroundColor: school.palette.primary }}>Submit Report</button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === 'ADMIN' && (
          <div className="space-y-10">
            <div className="flex justify-between items-center bg-white dark:bg-[#2b2b2b] p-6 rounded-[25px] shadow-sm border border-slate-200 dark:border-[#4b5563]" style={{ borderLeft: `8px solid ${school.palette.primary}` }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 dark:bg-[#1f1f1f] rounded-full flex items-center justify-center" style={{ color: school.palette.primary }}><Shield size={24} /></div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h2>
                  <p className="text-slate-500 dark:text-white text-xs font-bold uppercase tracking-widest">Restricted Access</p>
                </div>
              </div>
              <button onClick={() => { setIsAdmin(false); setActiveTab('BOARD'); }} className="px-6 py-2 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-100 rounded-full font-bold text-xs uppercase tracking-widest">Logout</button>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Pending Found Item Requests</h3>
              <div className="grid gap-4">
                {items.filter(i => i.schoolId === school.id && i.status === 'lost').map(item => (
                  <div key={item.id} className="bg-white dark:bg-[#2b2b2b] border border-slate-200 dark:border-[#4b5563] p-5 rounded-[18px] shadow-sm flex items-center gap-5">
                    <img
                      src={item.imageUrl}
                      className="w-20 h-20 rounded-[12px] object-cover cursor-zoom-in"
                      alt={item.name}
                      onClick={() => {
                        setViewingImage({ src: item.imageUrl, alt: item.name });
                        setImageZoom(1);
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white">{item.name}</h4>
                      <p className="text-slate-600 dark:text-white text-sm">{item.description}</p>
                      {item.foundLocation && <p className="text-xs text-slate-500 dark:text-white mt-1"><span className="font-bold">Location Found:</span> {item.foundLocation}</p>}
                      {item.finderName && <p className="text-xs text-slate-500 dark:text-white"><span className="font-bold">Found By:</span> {item.finderName}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => approveLostItem(item.id)} className="px-5 py-2 bg-green-50 text-green-600 rounded-full font-bold text-sm flex items-center gap-1"><Check size={14} /> Approve</button>
                      <button onClick={() => openRejectFound(item)} className="px-5 py-2 bg-red-50 text-red-500 rounded-full font-bold text-sm flex items-center gap-1"><Trash2 size={14} /> Decline</button>
                    </div>
                  </div>
                ))}
                {items.filter(i => i.schoolId === school.id && i.status === 'lost').length === 0 && (
                  <div className="bg-white dark:bg-[#2b2b2b] border border-slate-200 dark:border-[#4b5563] rounded-[18px] p-6 text-sm text-slate-500 dark:text-white">No pending found item requests.</div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Pending Claim Requests</h3>
              <div className="grid gap-4">
                {items.filter(i => i.schoolId === school.id && i.status === 'pending_claim').map(item => (
                  <div key={item.id} className="bg-white dark:bg-[#2b2b2b] border border-slate-200 dark:border-[#4b5563] p-5 rounded-[18px] shadow-sm flex items-start gap-5">
                    <img
                      src={item.imageUrl}
                      className="w-20 h-20 rounded-[12px] object-cover cursor-zoom-in"
                      alt={item.name}
                      onClick={() => {
                        setViewingImage({ src: item.imageUrl, alt: item.name });
                        setImageZoom(1);
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">{item.name}</h4>
                      <p className="text-slate-600 dark:text-white text-sm mb-2">{item.description}</p>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-white">Claimant: {item.claimantName || 'Unknown'} | {item.claimantEmail || 'No email'} | ID {item.claimantGrade || '-'}</p>
                      {item.claimantLastSeen && <p className="text-xs text-slate-500 dark:text-white mt-1"><span className="font-bold">Last Seen:</span> {item.claimantLastSeen}</p>}
                      {item.claimantProof && <p className="text-xs text-slate-500 dark:text-white mt-1"><span className="font-bold">Proof of Ownership:</span> {item.claimantProof}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => approveClaim(item.id)} className="px-5 py-2 bg-green-50 text-green-600 rounded-full font-bold text-sm flex items-center gap-1"><Check size={14} /> Accept</button>
                      <button onClick={() => openRejectClaim(item)} className="px-5 py-2 bg-red-50 text-red-500 rounded-full font-bold text-sm flex items-center gap-1"><X size={14} /> Reject</button>
                    </div>
                  </div>
                ))}
                {items.filter(i => i.schoolId === school.id && i.status === 'pending_claim').length === 0 && (
                  <div className="bg-white dark:bg-[#2b2b2b] border border-slate-200 dark:border-[#4b5563] rounded-[18px] p-6 text-sm text-slate-500 dark:text-white">No pending claim requests.</div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Claimed Items Log (7 Days)</h3>
              <div className="grid gap-4">
                {schoolClaimLogs.map(log => (
                  <div key={log.id} className="bg-white dark:bg-[#2b2b2b] border border-slate-200 dark:border-[#4b5563] p-5 rounded-[18px] shadow-sm">
                    <div className="flex flex-wrap gap-3 items-center justify-between">
                      <h4 className="font-bold text-slate-900 dark:text-white">{log.itemName}</h4>
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-white">Claimed {new Date(log.claimedAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-white mt-2">By: {log.claimedBy} ({log.claimedEmail || 'no email'})</p>
                    <p className="text-xs text-slate-400 dark:text-white mt-1">Expires: {new Date(log.expiresAt).toLocaleString()}</p>
                  </div>
                ))}
                {schoolClaimLogs.length === 0 && (
                  <div className="bg-white dark:bg-[#2b2b2b] border border-slate-200 dark:border-[#4b5563] rounded-[18px] p-6 text-sm text-slate-500 dark:text-white">No claimed items logged in the last 7 days.</div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Manage All Items</h3>
              <div className="grid gap-4">
                {items.filter(i => i.schoolId === school.id).map(item => (
                  <div key={`manage-${item.id}`} className="bg-white dark:bg-[#2b2b2b] border border-slate-200 dark:border-[#4b5563] p-4 rounded-[18px] shadow-sm flex items-center gap-4">
                    <img
                      src={item.imageUrl}
                      className="w-14 h-14 rounded-[10px] object-cover cursor-zoom-in"
                      alt={item.name}
                      onClick={() => {
                        setViewingImage({ src: item.imageUrl, alt: item.name });
                        setImageZoom(1);
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                      <p className="text-xs text-slate-500 dark:text-white uppercase tracking-wider">{item.status.replace('_', ' ')}</p>
                    </div>
                    <button onClick={() => handleDelete(item.id)} className="px-4 py-2 bg-red-50 text-red-500 rounded-full font-bold text-xs uppercase tracking-widest">
                      Delete
                    </button>
                  </div>
                ))}
                {items.filter(i => i.schoolId === school.id).length === 0 && (
                  <div className="bg-white dark:bg-[#2b2b2b] border border-slate-200 dark:border-[#4b5563] rounded-[18px] p-6 text-sm text-slate-500 dark:text-white">No items available to manage.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {claimingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#2b2b2b] rounded-[25px] p-8 w-full max-w-lg shadow-2xl relative border border-slate-200 dark:border-[#4b5563]">
            <button onClick={() => setClaimingItem(null)} className="absolute top-5 right-5 text-slate-300 dark:text-white"><X size={22} /></button>
            <h3 className="text-2xl font-bold text-center mb-6 text-slate-900 dark:text-white">Claim Item</h3>
            <form onSubmit={handleClaim} className="space-y-4">
              <input required value={claimName} onChange={e => setClaimName(e.target.value)} className="w-full p-3.5 bg-[#f4f6f8] dark:bg-[#1f1f1f] border border-slate-200 dark:border-[#4b5563] rounded-[12px] text-slate-900 dark:text-white" placeholder="Full Name" />
              <input required value={claimGrade} onChange={e => setClaimGrade(e.target.value.replace(/\D/g, ''))} className="w-full p-3.5 bg-[#f4f6f8] dark:bg-[#1f1f1f] border border-slate-200 dark:border-[#4b5563] rounded-[12px] text-slate-900 dark:text-white" placeholder="Grade / ID (numbers only)" />
              <input required type="email" value={claimEmail} onChange={e => setClaimEmail(e.target.value)} className="w-full p-3.5 bg-[#f4f6f8] dark:bg-[#1f1f1f] border border-slate-200 dark:border-[#4b5563] rounded-[12px] text-slate-900 dark:text-white" placeholder="School Email" />
              <input
                required
                value={claimLastSeen}
                onChange={e => setClaimLastSeen(e.target.value)}
                className="w-full p-3.5 bg-[#f4f6f8] dark:bg-[#1f1f1f] border border-slate-200 dark:border-[#4b5563] rounded-[12px] text-slate-900 dark:text-white"
                placeholder="Location and approximate time the item was lost"
              />
              <textarea
                required
                value={claimProof}
                onChange={e => setClaimProof(e.target.value)}
                rows={3}
                className="w-full p-3.5 bg-[#f4f6f8] dark:bg-[#1f1f1f] border border-slate-200 dark:border-[#4b5563] rounded-[12px] text-slate-900 dark:text-white"
                placeholder="Proof of Ownership (i.e., information that can verify ownership, such as distinctive characteristics, contents, or identifying markings)"
              />
              <button type="submit" className="w-full text-white py-4 rounded-[14px] font-bold" style={{ backgroundColor: school.palette.primary }}>Submit Claim</button>
            </form>
          </div>
        </div>
      )}

      {rejectingClaimItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#2b2b2b] rounded-[25px] p-8 w-full max-w-lg shadow-2xl relative border border-slate-200 dark:border-[#4b5563]">
            <button onClick={() => setRejectingClaimItem(null)} className="absolute top-5 right-5 text-slate-300 dark:text-white"><X size={22} /></button>
            <h3 className="text-2xl font-bold text-center mb-2 text-slate-900 dark:text-white">Reject Claim</h3>
            <p className="text-sm text-slate-500 dark:text-white text-center mb-6">Reason is required before rejecting this claim.</p>
            <textarea value={rejectReason} onChange={e => { setRejectReason(e.target.value); if (rejectReasonError) setRejectReasonError(false); }} rows={4} className={`w-full p-3.5 bg-[#f4f6f8] dark:bg-[#1f1f1f] border rounded-[12px] text-slate-900 dark:text-white ${rejectReasonError ? 'border-red-400' : 'border-slate-200 dark:border-[#4b5563]'}`} placeholder="Enter rejection reason" />
            {rejectReasonError && <p className="text-red-500 text-xs font-bold mt-2">Please enter a reason to reject this claim.</p>}
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setRejectingClaimItem(null)} className="flex-1 py-3 rounded-[14px] font-bold text-slate-600 dark:text-white bg-slate-100 dark:bg-[#1f1f1f]">Cancel</button>
              <button type="button" onClick={rejectClaim} className="flex-1 py-3 rounded-[14px] font-bold text-white bg-red-500">Reject Claim</button>
            </div>
          </div>
        </div>
      )}

      {rejectingFoundItem && (
        <div className="fixed inset-0 z-[115] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#2b2b2b] rounded-[25px] p-8 w-full max-w-lg shadow-2xl relative border border-slate-200 dark:border-[#4b5563]">
            <button onClick={() => setRejectingFoundItem(null)} className="absolute top-5 right-5 text-slate-300 dark:text-white"><X size={22} /></button>
            <h3 className="text-2xl font-bold text-center mb-2 text-slate-900 dark:text-white">Reject Found Item Inquiry</h3>
            <p className="text-sm text-slate-500 dark:text-white text-center mb-6">Reason is required before rejecting this inquiry.</p>
            <textarea value={rejectFoundReason} onChange={e => { setRejectFoundReason(e.target.value); if (rejectFoundReasonError) setRejectFoundReasonError(false); }} rows={4} className={`w-full p-3.5 bg-[#f4f6f8] dark:bg-[#1f1f1f] border rounded-[12px] text-slate-900 dark:text-white ${rejectFoundReasonError ? 'border-red-400' : 'border-slate-200 dark:border-[#4b5563]'}`} placeholder="Enter rejection reason" />
            {rejectFoundReasonError && <p className="text-red-500 text-xs font-bold mt-2">Please enter a reason to reject this inquiry.</p>}
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setRejectingFoundItem(null)} className="flex-1 py-3 rounded-[14px] font-bold text-slate-600 dark:text-white bg-slate-100 dark:bg-[#1f1f1f]">Cancel</button>
              <button type="button" onClick={rejectFound} className="flex-1 py-3 rounded-[14px] font-bold text-white bg-red-500">Reject Inquiry</button>
            </div>
          </div>
        </div>
      )}

      {viewingImage && (
        <div
          className="fixed inset-0 z-[130] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => {
            setViewingImage(null);
            setImageZoom(1);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full h-full flex flex-col items-center justify-center"
          >
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setImageZoom((z) => Math.max(0.5, z - 0.25))}
                className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
              >
                <Minus size={18} />
              </button>
              <button
                type="button"
                onClick={() => setImageZoom((z) => Math.min(4, z + 0.25))}
                className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
              >
                <Plus size={18} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewingImage(null);
                  setImageZoom(1);
                }}
                className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            <div className="absolute top-4 left-4 z-10 text-white/80 text-sm font-bold">
              Zoom: {Math.round(imageZoom * 100)}%
            </div>

            <div className="w-full h-full overflow-auto flex items-center justify-center">
              <img
                src={viewingImage.src}
                alt={viewingImage.alt}
                onClick={(e) => e.stopPropagation()}
                className="rounded-lg shadow-2xl"
                style={{
                  transform: `scale(${imageZoom})`,
                  transformOrigin: 'center center',
                  maxWidth: imageZoom <= 1 ? '90vw' : 'none',
                  maxHeight: imageZoom <= 1 ? '85vh' : 'none'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
