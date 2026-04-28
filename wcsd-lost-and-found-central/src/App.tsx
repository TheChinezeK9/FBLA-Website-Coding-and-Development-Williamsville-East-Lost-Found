import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { BulletinBoard } from './components/BulletinBoard';
import { ContactsPage } from './components/ContactsPage';
import { MeetMakers } from './components/MeetMakers';
import { InfoPages } from './components/InfoPages';
import { ToolsPage } from './components/ToolsPage';
import { LiveTracker } from './components/LiveTracker';
import { Footer } from './components/Footer';
import { HamsterBot } from './components/HamsterBot';
import { Login } from './components/Login';
import { ProfilePage } from './components/ProfilePage';
import { DoodleBackground } from './components/DoodleBackground';
import { View, LostItem, SchoolTheme, User, ClaimedLog } from './types';
import { INITIAL_ITEMS, ADMIN_PASSWORD, SCHOOL_THEMES } from './constants';
import { X, Lock } from 'lucide-react';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const pruneExpiredClaimLogs = (logs: ClaimedLog[]) => {
  const now = Date.now();
  return logs.filter(log => new Date(log.expiresAt).getTime() > now);
};

export default function App() {
  const eastSchool = SCHOOL_THEMES.will_east;
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('wcsd_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (!parsed || typeof parsed !== 'object') return null;
      const email = typeof parsed.email === 'string' ? parsed.email.trim().toLowerCase() : '';
      if (!email) return null;
      const id = typeof parsed.id === 'string' && parsed.id.trim() ? parsed.id.trim() : email;
      return {
        id,
        name: typeof parsed.name === 'string' ? parsed.name : 'User',
        email,
        grade: parsed.grade,
        studentId: parsed.studentId,
        joinedAt: typeof parsed.joinedAt === 'string' ? parsed.joinedAt : new Date().toISOString(),
        notifications: Array.isArray(parsed.notifications) ? parsed.notifications : []
      } as User;
    } catch {
      return null;
    }
  });
  const [isLoggedIn, setIsLoggedIn] = useState(!!user);
  const [currentView, setCurrentView] = useState<View>('HOME');
  const [selectedSchool, setSelectedSchool] = useState<SchoolTheme | null>(eastSchool);
  const [items, setItems] = useState<LostItem[]>(INITIAL_ITEMS);
  const [claimLogs, setClaimLogs] = useState<ClaimedLog[]>([]);
  const [claimIntent, setClaimIntent] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('wcsd_dark_mode') === 'true');
  const [showDoodles, setShowDoodles] = useState(() => localStorage.getItem('wcsd_show_doodles') !== 'false');
  const [neonMode, setNeonMode] = useState(() => localStorage.getItem('wcsd_neon_mode') === 'true');
  const [glassMode, setGlassMode] = useState(() => localStorage.getItem('wcsd_glass_mode') === 'true');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState(false);
  const [hasLoadedServerData, setHasLoadedServerData] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;

    const syncUser = async () => {
      try {
        const response = await fetch(`/api/users/${encodeURIComponent(user.id || user.email)}?email=${encodeURIComponent(user.email)}`, { cache: 'no-store' });
        if (!response.ok) {
          if (response.status === 404 && !cancelled) {
            setUser(null);
            setIsLoggedIn(false);
            localStorage.removeItem('wcsd_user');
          }
          return;
        }
        const data = await response.json();
        if (cancelled || !data?.user) return;
        const normalizedUser: User = {
          ...data.user,
          id: data.user.id || data.user.email,
          email: String(data.user.email || '').trim().toLowerCase(),
          notifications: Array.isArray(data.user.notifications) ? data.user.notifications : []
        };
        setUser(prev => {
          if (!prev) return normalizedUser;
          if (
            prev.id === normalizedUser.id &&
            prev.email === normalizedUser.email &&
            prev.name === normalizedUser.name &&
            prev.grade === normalizedUser.grade &&
            prev.studentId === normalizedUser.studentId &&
            prev.notifications.length === normalizedUser.notifications.length
          ) {
            return prev;
          }
          return normalizedUser;
        });
        localStorage.setItem('wcsd_user', JSON.stringify(normalizedUser));
      } catch {
      }
    };

    void syncUser();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.email]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('wcsd_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    document.documentElement.classList.toggle('neon-mode', neonMode);
    localStorage.setItem('wcsd_neon_mode', String(neonMode));
  }, [neonMode]);

  useEffect(() => {
    document.documentElement.classList.toggle('glass-mode', glassMode);
    localStorage.setItem('wcsd_glass_mode', String(glassMode));
  }, [glassMode]);

  useEffect(() => {
    localStorage.setItem('wcsd_show_doodles', String(showDoodles));
  }, [showDoodles]);
  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;

    (async () => {
      try {
        const [itemsRes, logsRes] = await Promise.all([
          fetch('/api/items'),
          fetch('/api/claim-logs')
        ]);
        const itemsData = itemsRes.ok ? await itemsRes.json() : { items: [] };
        const logsData = logsRes.ok ? await logsRes.json() : { logs: [] };
        if (cancelled) return;

        const remoteItems = Array.isArray(itemsData?.items) ? itemsData.items : [];
        const remoteLogs = Array.isArray(logsData?.logs) ? pruneExpiredClaimLogs(logsData.logs) : [];

        setItems(remoteItems.length > 0 ? remoteItems : INITIAL_ITEMS);
        setClaimLogs(remoteLogs);
      } finally {
        if (!cancelled) setHasLoadedServerData(true);
      }
    })();

    return () => {
      cancelled = true;
      setHasLoadedServerData(false);
    };
  }, [isLoggedIn]);
  useEffect(() => {
    if (!isLoggedIn || !hasLoadedServerData) return;
    const timer = window.setTimeout(async () => {
      try {
        await fetch('/api/items', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items })
        });
      } catch {
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [items, isLoggedIn, hasLoadedServerData]);

  useEffect(() => {
    if (!isLoggedIn || !hasLoadedServerData) return;
    const timer = window.setTimeout(async () => {
      try {
        await fetch('/api/claim-logs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logs: pruneExpiredClaimLogs(claimLogs) })
        });
      } catch {
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [claimLogs, isLoggedIn, hasLoadedServerData]);

  useEffect(() => {
    if (!showAdminModal) {
      setAdminPassword('');
      setAdminError(false);
    }
  }, [showAdminModal]);

  const handleLogin = (loggedInUser: User) => {
    const normalizedUser: User = {
      ...loggedInUser,
      id: loggedInUser?.id || loggedInUser?.email,
      email: String(loggedInUser?.email || '').trim().toLowerCase()
    };
    setUser(normalizedUser);
    setIsLoggedIn(true);
    localStorage.setItem('wcsd_user', JSON.stringify(normalizedUser));
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('wcsd_user');
    setCurrentView('HOME');
  };

  const navigate = (view: View) => {
    setClaimIntent(false);
    setCurrentView(view === 'SCHOOL_SELECT' ? 'BULLETIN_BOARD' : view);
    if (view === 'BULLETIN_BOARD' || view === 'SCHOOL_SELECT') setSelectedSchool(eastSchool);
    if (view !== 'BULLETIN_BOARD' && view !== 'TOOLS' && view !== 'ACCOUNT') setIsAdmin(false);
  };

  const startClaimProcess = () => {
    setClaimIntent(true);
    setSelectedSchool(eastSchool);
    setCurrentView('BULLETIN_BOARD');
  };

  const handleSchoolSelect = (_school: SchoolTheme) => {
    setSelectedSchool(eastSchool);
    setCurrentView('BULLETIN_BOARD');
  };

  const handleTrackerItemFound = (newItem: LostItem) => {
    setItems(prev => [newItem, ...prev]);
    setCurrentView('HOME');
  };

  const handleOpenMatchedItem = (item: LostItem) => {
    const targetSchool = SCHOOL_THEMES[item.schoolId] || eastSchool;
    setSelectedSchool(targetSchool);
    setClaimIntent(false);
    setCurrentView('BULLETIN_BOARD');
  };

  const handleApproveClaim = (itemId: string) => {
    setItems(prevItems => {
      const item = prevItems.find(i => i.id === itemId);
      if (!item) return prevItems;

      const now = new Date();
      const claimedLog: ClaimedLog = {
        id: Math.random().toString(36).slice(2, 11),
        itemId: item.id,
        itemName: item.name,
        schoolId: item.schoolId,
        claimedBy: item.claimantName || 'Unknown',
        claimedEmail: item.claimantEmail || '',
        claimedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + ONE_WEEK_MS).toISOString()
      };

      setClaimLogs(prevLogs => [claimedLog, ...pruneExpiredClaimLogs(prevLogs)]);
      return prevItems.filter(i => i.id !== itemId);
    });
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowAdminModal(false);
    } else {
      setAdminError(true);
      setTimeout(() => setAdminError(false), 1500);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-black dark:text-white font-sans transition-colors duration-300 relative">
      <Navbar
        onNavigate={navigate}
        currentView={currentView}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        onOpenAdminLogin={() => setShowAdminModal(true)}
        user={user}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        showDoodles={showDoodles}
        setShowDoodles={setShowDoodles}
        neonMode={neonMode}
        setNeonMode={setNeonMode}
        glassMode={glassMode}
        setGlassMode={setGlassMode}
      />

      {showDoodles && <DoodleBackground />}

      {currentView !== 'LIVE_TRACKER' && (
        <main className="relative pt-24 z-10">
          <div key={currentView} className="animate-fade-in-up w-full">
            {currentView === 'HOME' && <Home onNavigate={navigate} onStartClaim={startClaimProcess} />}
            {currentView === 'BULLETIN_BOARD' && selectedSchool && (
              <BulletinBoard
                school={selectedSchool}
                items={items}
                claimLogs={claimLogs}
                onApproveClaim={handleApproveClaim}
                setItems={setItems}
                goBack={() => navigate('HOME')}
                initialTab={claimIntent ? 'SUBMIT' : 'BOARD'}
                isAdmin={isAdmin}
                setIsAdmin={setIsAdmin}
                currentUser={user}
              />
            )}
            {currentView === 'CONTACTS' && <ContactsPage />}
            {currentView === 'MEET_MAKERS' && <MeetMakers />}
            {(currentView === 'ABOUT' || currentView === 'RULES' || currentView === 'GUIDE') && <InfoPages type={currentView} />}
            {currentView === 'TOOLS' && (
              <ToolsPage
                onNavigate={navigate}
                items={items}
                isAdmin={isAdmin}
                onOpenAdminLogin={() => setShowAdminModal(true)}
                user={user}
                onOpenMatchedItem={handleOpenMatchedItem}
              />
            )}
            {currentView === 'ACCOUNT' && user && <ProfilePage user={user} onLogout={handleLogout} onNavigate={navigate} />}
          </div>
        </main>
      )}

      {currentView === 'LIVE_TRACKER' && <LiveTracker onItemFound={handleTrackerItemFound} onCancel={() => navigate('HOME')} />}
      {currentView !== 'LIVE_TRACKER' && <Footer onNavigate={navigate} />}
      <HamsterBot />

      {showAdminModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#424242] rounded-[25px] p-8 w-full max-w-sm shadow-2xl relative border border-white/10">
            <button onClick={() => setShowAdminModal(false)} className="absolute top-5 right-5 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              <X size={22} />
            </button>
            <div className="text-center mb-7">
              <div className="w-14 h-14 bg-[#142e53] text-white rounded-[16px] flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Lock size={22} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Portal</h3>
              <p className="text-slate-500 dark:text-slate-200 text-sm mt-1">Enter your staff access code</p>
            </div>
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <input
                autoFocus
                type="password"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                className={`w-full p-4 border rounded-[14px] outline-none font-bold text-center text-2xl tracking-[0.6em] text-slate-900 dark:text-white dark:bg-[#4a4a4a] transition-all ${adminError ? 'border-red-400 bg-red-50 dark:bg-red-900/20 animate-shake' : 'border-slate-200 bg-slate-50 dark:border-slate-500'}`}
                placeholder="••••"
              />
              {adminError && <p className="text-red-500 text-center font-bold text-xs uppercase tracking-widest">Incorrect access code</p>}
              <button type="submit" className="w-full bg-[#142e53] text-white py-4 rounded-[14px] font-bold text-base shadow-lg hover:bg-[#1f3a5a] active:scale-[0.98] transition-all">
                Unlock Dashboard
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
