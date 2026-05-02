import React, { useState, useEffect, useRef } from 'react';
import { Home as HomeIcon, Users, Info, Scale, BookOpen, Phone, Settings, LogOut, Lock, Wrench, User as UserIcon, Moon, Sun, Palette, Sparkles } from 'lucide-react';
import { View, User } from '../types';

interface NavbarProps {
  onNavigate: (view: View) => void;
  currentView: View;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  onOpenAdminLogin: () => void;
  user: User | null;
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
  showDoodles: boolean;
  setShowDoodles: (v: boolean) => void;
  neonMode: boolean;
  setNeonMode: (v: boolean) => void;
  glassMode: boolean;
  setGlassMode: (v: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  currentView,
  isAdmin,
  setIsAdmin,
  onOpenAdminLogin,
  user,
  isDarkMode,
  setIsDarkMode,
  showDoodles,
  setShowDoodles,
  neonMode,
  setNeonMode,
  glassMode,
  setGlassMode
}) => {
  const [showInfoMenu, setShowInfoMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setShowSettingsMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navBtnClass = (view: View) =>
    `flex items-center gap-2 px-4 py-2 rounded-full transition-all border ${
      currentView === view ? 'bg-[#f3df9b] text-black border-[#f3df9b]' : 'text-black bg-transparent border-transparent hover:text-black'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[60]" style={{ height: 'calc(1.4 * 64px)' }}>
      <div className="flex justify-between items-center bg-[#e7a39b] w-full h-full p-3 shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-colors duration-300 border-b border-black/20">
        <div onClick={() => onNavigate('HOME')} className="flex items-center gap-2 cursor-pointer px-4 py-2 hover:scale-105 transition-all">
          <img src="/images/east.png" alt="Williamsville East High School logo" className="w-12 h-12 rounded-lg object-cover shadow-sm bg-white p-1" />
          <span className="font-bold text-xl tracking-tight text-black">East High School Lost &amp; Found</span>
        </div>
        <div className="hidden lg:flex items-center gap-1">
          <button onClick={() => onNavigate('HOME')} className={navBtnClass('HOME')}><HomeIcon size={16} /><span className="text-sm font-bold">Home</span></button>
          <button onClick={() => onNavigate('BULLETIN_BOARD')} className={navBtnClass('BULLETIN_BOARD')}><Users size={16} /><span className="text-sm font-bold">Item Board</span></button>
          <div className="w-px h-6 bg-black/20 mx-2" />
          <div className="relative">
            <button onMouseEnter={() => setShowInfoMenu(true)} className="flex items-center gap-2 px-4 py-2 rounded-full transition-all text-black hover:text-black"><Info size={16} /><span className="text-sm font-bold">Resources</span></button>
            {showInfoMenu && (
              <div onMouseLeave={() => setShowInfoMenu(false)} className="absolute top-full right-0 mt-2 w-max min-w-[220px] bg-[#e7a39b] border border-black/20 rounded-2xl p-2 shadow-xl animate-fade-in z-[70]">
                {[
                  { id: 'ABOUT' as View, label: 'About Project', icon: <Info size={16} /> },
                  { id: 'RULES' as View, label: 'Safety Rules', icon: <Scale size={16} /> },
                  { id: 'GUIDE' as View, label: 'Help Guide', icon: <BookOpen size={16} /> }
                ].map(item => (
                  <button key={item.id} onClick={() => { onNavigate(item.id); setShowInfoMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-black hover:bg-[#f3df9b] hover:text-black text-sm font-bold transition-colors">
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => onNavigate('CONTACTS')} className={navBtnClass('CONTACTS')}><Phone size={16} /><span className="text-sm font-bold">Contacts</span></button>
          <button onClick={() => onNavigate('MEET_MAKERS')} className={navBtnClass('MEET_MAKERS')}><span className="text-sm font-bold">Team</span></button>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <button
              onClick={() => onNavigate('ACCOUNT')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border ${currentView === 'ACCOUNT' ? 'bg-[#f3df9b] text-black border-[#f3df9b]' : 'bg-transparent text-black border-transparent hover:text-black'}`}
            >
              <UserIcon size={18} />
              <span className="hidden md:inline font-bold text-sm">{user.name.split(' ')[0]}</span>
            </button>
          )}
          <button onClick={() => onNavigate('TOOLS')} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border ${currentView === 'TOOLS' ? 'bg-[#f3df9b] text-black border-[#f3df9b]' : 'bg-transparent text-black border-transparent hover:text-black'}`}><Wrench size={18} /><span className="hidden md:inline font-bold text-sm">Tools</span></button>

          <div className="relative" ref={settingsRef}>
            <button onClick={() => setShowSettingsMenu(v => !v)} className="p-2 rounded-full transition-all border border-transparent hover:bg-[#f3df9b] text-black" title="Settings"><Settings size={20} /></button>
            {showSettingsMenu && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-[#f3df9b] border border-black/20 rounded-2xl p-4 shadow-2xl animate-fade-in z-[70]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black mb-3">Settings</p>

                <div className="space-y-2 mb-4">
                  <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#e7a39b] transition-colors group">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-[#142e53]/20 text-[#142e53]' : 'bg-[#e7a39b]/25 text-[#c7776f]'}`}>{isDarkMode ? <Moon size={16} /> : <Sun size={16} />}</div>
                      <span className="flex-1 text-center text-sm font-bold text-black/80 group-hover:text-black">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${isDarkMode ? 'bg-[#142e53]' : 'bg-slate-600'}`}>
                      <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${isDarkMode ? 'left-5' : 'left-1'}`} />
                    </div>
                  </button>

                  <button onClick={() => setShowDoodles(!showDoodles)} className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#e7a39b] transition-colors group">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-1.5 rounded-lg ${showDoodles ? 'bg-pink-500/20 text-pink-600' : 'bg-black/10 text-black/80'}`}><Palette size={16} /></div>
                      <span className="flex-1 text-center text-sm font-bold text-black/80 group-hover:text-black">Doodle Background</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${showDoodles ? 'bg-pink-500' : 'bg-slate-600'}`}>
                      <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${showDoodles ? 'left-5' : 'left-1'}`} />
                    </div>
                  </button>

                  {isDarkMode && (
                    <button onClick={() => setNeonMode(!neonMode)} className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#e7a39b] transition-colors group">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`p-1.5 rounded-lg ${neonMode ? 'bg-emerald-500/20 text-emerald-600' : 'bg-black/10 text-black/80'}`}><Sparkles size={16} /></div>
                        <span className="flex-1 text-center text-sm font-bold text-black/80 group-hover:text-black">Neon Accents</span>
                      </div>
                      <div className={`w-8 h-4 rounded-full relative transition-colors ${neonMode ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                        <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${neonMode ? 'left-5' : 'left-1'}`} />
                      </div>
                    </button>
                  )}

                  <button onClick={() => setGlassMode(!glassMode)} className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#e7a39b] transition-colors group">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-1.5 rounded-lg ${glassMode ? 'bg-sky-500/20 text-sky-600' : 'bg-black/10 text-black/80'}`}><div className="w-4 h-4 rounded-full border-2 border-current opacity-70" /></div>
                      <span className="flex-1 text-center text-sm font-bold text-black/80 group-hover:text-black">Glassmorphism</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${glassMode ? 'bg-sky-500' : 'bg-slate-600'}`}>
                      <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${glassMode ? 'left-5' : 'left-1'}`} />
                    </div>
                  </button>
                </div>

                <div className="h-px bg-black mb-3" />

                {isAdmin ? (
                  <>
                    <div className="flex items-center gap-2 px-3 py-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Admin Active</span>
                    </div>
                    <button onClick={() => { setIsAdmin(false); setShowSettingsMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 text-sm font-bold transition-colors"><LogOut size={15} /> Logout Admin</button>
                  </>
                ) : (
                  <button onClick={() => { onOpenAdminLogin(); setShowSettingsMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-black hover:bg-[#e7a39b] hover:text-black text-sm font-bold transition-colors"><Lock size={15} /> Admin Portal</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
