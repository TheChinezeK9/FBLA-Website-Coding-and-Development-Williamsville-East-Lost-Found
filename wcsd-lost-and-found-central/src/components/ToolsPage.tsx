import React, { useState, useEffect } from 'react';
import { Camera, Bot, Shield, Lock, FileText, Users, Phone, ListChecks, Plus, X, Sparkles, Loader2, Wand2 } from 'lucide-react';
import { View, LostItem, User, WishlistItem } from '../types';
import { CATEGORIES } from '../constants';

interface ToolsPageProps {
  onNavigate: (view: View) => void;
  items: LostItem[];
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  user: User;
  onOpenMatchedItem: (item: LostItem) => void;
}

const localMatchFallback = (list: WishlistItem[], publicItems: LostItem[]) => {
  const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim();
  const fallbackMatches: any[] = [];

  for (const wish of list) {
    const wishText = normalize(wish.text);
    const wishWords = wishText.split(/\s+/).filter(Boolean);

    for (const item of publicItems) {
      const haystack = normalize(`${item.name} ${item.description} ${item.category}`);
      const wordHits = wishWords.filter(word => haystack.includes(word));
      const categoryHit = wish.category !== 'Any' && item.category.toLowerCase() === wish.category.toLowerCase();

      if (categoryHit || wordHits.length > 0) {
        const confidence = categoryHit && wordHits.length > 0 ? 'high' : (categoryHit || wordHits.length > 1 ? 'medium' : 'low');
        fallbackMatches.push({
          itemId: item.id,
          itemName: item.name,
          wishText: wish.text,
          confidence,
          reason: categoryHit
            ? `Category matches (${wish.category}) with keyword overlap.`
            : `Keyword overlap: ${wordHits.slice(0, 3).join(', ') || 'related terms'}`,
          item
        });
      }
    }
  }

  const seen = new Set<string>();
  return fallbackMatches.filter(match => {
    const key = `${match.itemId}:${match.wishText}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const ToolsPage: React.FC<ToolsPageProps> = ({ onNavigate, items, isAdmin, onOpenAdminLogin, user, onOpenMatchedItem }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [wishInput, setWishInput] = useState('');
  const [wishCat, setWishCat] = useState('Any');
  const [wishError, setWishError] = useState('');
  const [isSavingWish, setIsSavingWish] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [matchRan, setMatchRan] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('wcsd_focus_wish');
    if (!raw) {
      setWishlist([]);
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.text) {
        const focusedWish: WishlistItem = {
          id: `focus-${Date.now()}`,
          userId: user.id,
          text: String(parsed.text),
          category: String(parsed.category || 'Any'),
          addedAt: new Date().toISOString()
        };
        setWishlist([focusedWish]);
      } else {
        setWishlist([]);
      }
    } catch {
      setWishlist([]);
    } finally {
      sessionStorage.removeItem('wcsd_focus_wish');
    }
  }, [user.id]);

  useEffect(() => {
    if (wishlist.length > 0) {
      void runAiMatch(wishlist);
    } else {
      setMatches([]);
      setMatchRan(false);
    }
  }, [wishlist]);

  const addWish = async () => {
    if (!wishInput.trim()) return;
    if (!user?.id) {
      setWishError('Please log in again, then try adding to your list.');
      return;
    }
    setWishError('');
    setIsSavingWish(true);
    try {
      const response = await fetch(`/api/users/${encodeURIComponent(user.id)}/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: wishInput.trim(), category: wishCat, email: user.email })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setWishError(data?.error || 'Could not add item to wishlist.');
        return;
      }
      const data = await response.json();
      if (data?.item) {
        setWishlist(prev => [data.item, ...prev]);
        setWishInput('');
      }
    } catch {
      setWishError('Network error while adding wishlist item.');
    } finally {
      setIsSavingWish(false);
    }
  };

  const removeWish = async (id: string) => {
    if (id.startsWith('focus-')) {
      setWishlist(prev => prev.filter(w => w.id !== id));
      return;
    }
    try {
      const response = await fetch(`/api/users/${user.id}/wishlist/${id}?email=${encodeURIComponent(user.email)}`, { method: 'DELETE' });
      if (!response.ok) return;
      setWishlist(prev => prev.filter(w => w.id !== id));
    } catch {
    }
  };

  const runAiMatch = async (list: WishlistItem[]) => {
    if (list.length === 0) return;
    setIsMatching(true);
    setMatchRan(false);

    try {
      const publicItems = items.filter(i => i.status === 'found' || i.status === 'pending_claim');
      if (publicItems.length === 0) {
        setMatches([]);
        setMatchRan(true);
        setIsMatching(false);
        return;
      }

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-3-flash-preview',
          contents: [{ parts: [{ text: `Compare these wishlist items against found items and return a JSON array of match objects. Wishlist: ${JSON.stringify(list)} Found Items: ${JSON.stringify(publicItems.map(it => ({ id: it.id, name: it.name, category: it.category, description: it.description })))}` }] }],
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  itemId: { type: 'STRING' },
                  itemName: { type: 'STRING' },
                  wishText: { type: 'STRING' },
                  confidence: { type: 'STRING', enum: ['high', 'medium', 'low'] },
                  reason: { type: 'STRING' }
                },
                required: ['itemId', 'itemName', 'wishText', 'confidence', 'reason']
              }
            }
          }
        })
      });

      if (!response.ok) throw new Error('AI proxy unavailable');
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') || '[]';
      const parsed = JSON.parse(text);
      const enriched = parsed
        .map((m: any) => ({ ...m, item: publicItems.find(it => it.id === m.itemId) }))
        .filter((m: any) => m.item);

      setMatches(enriched.length > 0 ? enriched : localMatchFallback(list, publicItems));
    } catch {
      const publicItems = items.filter(i => i.status === 'found' || i.status === 'pending_claim');
      setMatches(localMatchFallback(list, publicItems));
    } finally {
      setIsMatching(false);
      setMatchRan(true);
    }
  };

  const TOOL_APPS = [
    { id: 'tracker', label: 'AI Scanner', icon: Camera, gradient: 'linear-gradient(135deg, #f3df9b 0%, #ead3a2 100%)', action: () => onNavigate('LIVE_TRACKER') },
    { id: 'chatbot', label: 'Hammy Bot', icon: Bot, gradient: 'linear-gradient(135deg, #f8efe4 0%, #f3df9b 100%)', action: () => window.dispatchEvent(new CustomEvent('open-hammy-bot', { detail: { source: 'tools-chatbot' } })) },
    { id: 'admin', label: isAdmin ? 'Admin Panel' : 'Staff Login', icon: isAdmin ? Shield : Lock, gradient: isAdmin ? 'linear-gradient(135deg, #b45309 0%, #d97706 100%)' : 'linear-gradient(135deg, #374151 0%, #4b5563 100%)', action: () => isAdmin ? onNavigate('BULLETIN_BOARD') : onOpenAdminLogin() },
    { id: 'claim', label: 'File a Claim', icon: FileText, gradient: 'linear-gradient(135deg, #e7a39b 0%, #f3df9b 100%)', action: () => onNavigate('BULLETIN_BOARD') },
    { id: 'schools', label: 'East Board', icon: Users, gradient: 'linear-gradient(135deg, #e7a39b 0%, #f3df9b 100%)', action: () => onNavigate('BULLETIN_BOARD') },
    { id: 'contacts', label: 'Contacts', icon: Phone, gradient: 'linear-gradient(135deg, #0e7490 0%, #0891b2 100%)', action: () => onNavigate('CONTACTS') }
  ];

  return (
    <div className="min-h-screen w-full transition-colors duration-300 pb-24">
      <div className="relative z-10 pt-10 pb-8 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Your Toolkit</h1>
        <p className="text-slate-500 dark:text-slate-400 text-base max-w-lg mx-auto">Everything Williamsville East needs to find, report, and track lost items.</p>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 mb-12">
        <div className="bg-white/70 dark:bg-black/20 backdrop-blur-xl rounded-[32px] p-6 border border-white/60 dark:border-white/10 shadow-xl">
          <div className="grid grid-cols-3 gap-4">
            {TOOL_APPS.map((app) => (
              <button key={app.id} onClick={app.action} className="flex flex-col items-center gap-2 group">
                <div className="w-16 h-16 rounded-[18px] flex items-center justify-center shadow-lg transition-all duration-200 group-hover:scale-110 group-active:scale-95" style={{ background: app.gradient }}>
                  {React.createElement(app.icon, { size: 26, color: '#fff' })}
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{app.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6">
        <div className="bg-white dark:bg-[#424242] rounded-[28px] shadow-xl border border-slate-100 dark:border-white/10 overflow-hidden">
          <div className="px-7 pt-7 pb-5 border-b border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-[#f3df9b] flex items-center justify-center shadow-md"><ListChecks size={18} color="#000" /></div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">I'm looking for...</h2>
            </div>
          </div>
          <div className="px-7 py-5 bg-slate-50/50 dark:bg-black/10">
            <div className="flex gap-2 mb-3">
              <input value={wishInput} onChange={e => setWishInput(e.target.value)} placeholder="What did you lose?" className="flex-1 bg-white dark:bg-[#555] border rounded-[12px] px-4 py-2.5 text-sm" />
              <select value={wishCat} onChange={e => setWishCat(e.target.value)} className="bg-white dark:bg-[#555] border rounded-[12px] px-3 py-2.5 text-sm">
                {['Any', ...CATEGORIES].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button onClick={() => void addWish()} disabled={!wishInput.trim() || isSavingWish} className="w-full py-2.5 rounded-[12px] bg-[#f3df9b] text-black text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
              <Plus size={16} /> {isSavingWish ? 'Adding...' : 'Add to List'}
            </button>
            {wishError && <p className="text-xs text-red-500 mt-2">{wishError}</p>}
          </div>
          <div className="px-7 py-4 max-h-64 overflow-y-auto">
            {wishlist.map(wish => (
              <div key={wish.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#555] rounded-[12px] mb-2 group">
                <div className="flex-1 text-sm font-semibold text-slate-800 dark:text-white truncate">{wish.text}</div>
                <button onClick={() => void removeWish(wish.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500"><X size={13} /></button>
              </div>
            ))}
          </div>
          {wishlist.length > 0 && (
            <div className="px-7 pb-7 border-t border-slate-100 dark:border-white/10 pt-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2"><Sparkles size={15} className="text-[#ab1e2f]" /><span className="text-sm font-black">AI Matches</span></div>
                <button onClick={() => void runAiMatch(wishlist)} disabled={isMatching} className="text-[#ab1e2f] text-xs font-bold flex items-center gap-1">
                  {isMatching ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />} Re-scan
                </button>
              </div>
              {matches.map((m, idx) => (
                <button key={idx} type="button" onClick={() => m.item && onOpenMatchedItem(m.item)} className="w-full text-left flex items-center gap-3 p-4 bg-slate-50 dark:bg-[#555] rounded-[16px] mb-3 border border-[#ab1e2f]/20 hover:border-[#ab1e2f] transition-colors">
                  <img src={m.item?.imageUrl} className="w-14 h-14 rounded-[10px] object-cover" alt={m.itemName} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2"><span className="text-sm font-black">{m.itemName}</span><span className="text-[10px] font-bold uppercase text-[#ab1e2f]">{m.confidence} match</span></div>
                    <p className="text-[11px] text-slate-500">{m.reason}</p>
                    <p className="text-[10px] text-[#ab1e2f] font-bold uppercase tracking-wider mt-1">Open in bulletin board</p>
                  </div>
                </button>
              ))}
              {matchRan && !isMatching && matches.length === 0 && <p className="text-xs text-slate-500">No matches found right now.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
