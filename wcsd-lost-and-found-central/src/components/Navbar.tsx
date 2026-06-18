import React, { useState, useEffect, useRef } from 'react';
import { Home as HomeIcon, Users, Info, Scale, BookOpen, Phone, Settings, LogOut, Lock, Wrench, User as UserIcon, Moon, Sun, Palette, Sparkles, Package, Menu, X, ChevronDown } from 'lucide-react';
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const infoMenuRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (infoMenuRef.current && !infoMenuRef.current.contains(e.target as Node)) setShowInfoMenu(false);
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setShowSettingsMenu(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) setShowMobileMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navBtnClass = (view: View) =>
    `flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ease-out border ${
      currentView === view
        ? 'bg-[#f3df9b] text-black border-[#f3df9b] shadow-none'
        : 'text-black bg-transparent border-transparent hover:text-black hover:shadow-[0_0_30px_rgba(243,223,155,0.95),0_0_64px_rgba(243,223,155,0.45),inset_0_0_18px_rgba(243,223,155,0.22)]'
    }`;

  const navigateAndClose = (view: View) => {
    onNavigate(view);
    setShowInfoMenu(false);
    setShowSettingsMenu(false);
    setShowMobileMenu(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[60]" style={{ minHeight: '82px' }}>
      <div className="flex justify-between items-center gap-2 bg-[#e7a39b] w-full min-h-[82px] px-2 sm:px-3 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-colors duration-300 border-b border-black/20">
        <div onClick={() => navigateAndClose('HOME')} className="flex items-center gap-2 cursor-pointer pl-2 sm:pl-3 pr-2 py-1 hover:scale-105 transition-all shrink-0">
          <img src="/images/east.png" alt="Williamsville East High School logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover shadow-sm bg-white p-1 shrink-0" />
          <span className="font-bold text-[16px] leading-tight tracking-tight text-black whitespace-nowrap">
            Williamsville East High School Lost &amp; Found
          </span>
        </div>
        <div className="hidden xl:flex items-center justify-center gap-1 flex-1 px-6">
          <button onClick={() => navigateAndClose('HOME')} className={navBtnClass('HOME')}><HomeIcon size={16} /><span className="text-sm font-bold">Home</span></button>
          <button onClick={() => navigateAndClose('BULLETIN_BOARD')} className={navBtnClass('BULLETIN_BOARD')}><Package size={18} strokeWidth={2.25} /><span className="text-sm font-bold whitespace-nowrap">Item Board</span></button>
          <div className="w-px h-6 bg-black/20 mx-2" />
          <div
            className="relative"
            ref={infoMenuRef}
            onMouseEnter={() => setShowInfoMenu(true)}
            onMouseLeave={() => setShowInfoMenu(false)}
          >
            <button
              onClick={() => setShowInfoMenu(v => !v)}
              onKeyDown={e => {
                if (e.key === 'Escape') {
                  setShowInfoMenu(false);
                  return;
                }
                if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowInfoMenu(true);
                }
              }}
              aria-haspopup="menu"
              aria-expanded={showInfoMenu}
              aria-controls="resources-menu"
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ease-out text-black ${
                showInfoMenu
                  ? 'bg-[#f3df9b] shadow-none'
                  : 'bg-transparent hover:text-black hover:shadow-[0_0_30px_rgba(243,223,155,0.95),0_0_64px_rgba(243,223,155,0.45),inset_0_0_18px_rgba(243,223,155,0.22)]'
              }`}
            >
              <Info size={16} />
              <span className="text-sm font-bold">Resources</span>
              <ChevronDown size={15} className={`transition-transform duration-200 ${showInfoMenu ? 'rotate-180' : 'rotate-0'}`} />
            </button>
            {showInfoMenu && (
              <div id="resources-menu" role="menu" aria-label="Resources" className="absolute top-full right-0 pt-2 w-max min-w-[220px] z-[70]">
                <div className="bg-[#e7a39b] border border-black/20 rounded-2xl p-2 shadow-xl animate-fade-in">
                {[
                  { id: 'ABOUT' as View, label: 'About Project', icon: <Info size={16} /> },
                  { id: 'RULES' as View, label: 'Safety Rules', icon: <Scale size={16} /> },
                  { id: 'GUIDE' as View, label: 'Help Guide', icon: <BookOpen size={16} /> }
                ].map(item => (
                  <button key={item.id} role="menuitem" onClick={() => navigateAndClose(item.id)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-black hover:shadow-[0_0_24px_rgba(243,223,155,0.82),0_0_42px_rgba(243,223,155,0.36)] hover:text-black text-sm font-bold transition-all duration-300 ease-out">
                    {item.icon} {item.label}
                  </button>
                ))}
                </div>
              </div>
            )}
          </div>
          <button onClick={() => navigateAndClose('CONTACTS')} className={navBtnClass('CONTACTS')}><Phone size={16} /><span className="text-sm font-bold">Contacts</span></button>
          <button onClick={() => navigateAndClose('MEET_MAKERS')} className={navBtnClass('MEET_MAKERS')}><Users size={16} /><span className="text-sm font-bold">Team</span></button>
        </div>
        <div className="flex items-center justify-end gap-1 sm:gap-2 shrink-0 ml-2">
          <div className="relative xl:hidden" ref={mobileMenuRef}>
            <button onClick={() => setShowMobileMenu(v => !v)} className={`p-2 rounded-full transition-all duration-300 ease-out border text-black ${showMobileMenu ? 'bg-[#f3df9b] border-[#f3df9b] shadow-none' : 'bg-transparent border-transparent hover:shadow-[0_0_24px_rgba(243,223,155,0.82),0_0_42px_rgba(243,223,155,0.36)]'}`} title="Menu">
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
            {showMobileMenu && (
              <div className="absolute top-full right-0 mt-2 w-[260px] max-w-[calc(100vw-24px)] bg-[#e7a39b] border border-black/20 rounded-2xl p-2 shadow-2xl animate-fade-in z-[75]">
                {[
                  { id: 'HOME' as View, label: 'Home', icon: <HomeIcon size={16} /> },
                  { id: 'BULLETIN_BOARD' as View, label: 'Item Board', icon: <Package size={18} strokeWidth={2.25} /> },
                  { id: 'CONTACTS' as View, label: 'Contacts', icon: <Phone size={16} /> },
                  { id: 'MEET_MAKERS' as View, label: 'Team', icon: <Users size={16} /> },
                  { id: 'TOOLS' as View, label: 'Tools', icon: <Wrench size={16} /> },
                  ...(user ? [{ id: 'ACCOUNT' as View, label: user.name.split(' ')[0], icon: <UserIcon size={16} /> }] : [])
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => navigateAndClose(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ease-out ${
                      currentView === item.id ? 'bg-[#f3df9b] text-black shadow-none' : 'text-black hover:shadow-[0_0_24px_rgba(243,223,155,0.82),0_0_42px_rgba(243,223,155,0.36)]'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
                <div className="h-px bg-black/15 my-2" />
                {[
                  { id: 'ABOUT' as View, label: 'About Project', icon: <Info size={16} /> },
                  { id: 'RULES' as View, label: 'Safety Rules', icon: <Scale size={16} /> },
                  { id: 'GUIDE' as View, label: 'Help Guide', icon: <BookOpen size={16} /> }
                ].map(item => (
                  <button key={item.id} onClick={() => navigateAndClose(item.id)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-black hover:shadow-[0_0_24px_rgba(243,223,155,0.82),0_0_42px_rgba(243,223,155,0.36)] text-sm font-bold transition-all duration-300 ease-out">
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {user && (
            <button
              onClick={() => navigateAndClose('ACCOUNT')}
              className={`hidden xl:flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ease-out border ${currentView === 'ACCOUNT' ? 'bg-[#f3df9b] text-black border-[#f3df9b] shadow-none' : 'bg-transparent text-black border-transparent hover:text-black hover:shadow-[0_0_30px_rgba(243,223,155,0.95),0_0_64px_rgba(243,223,155,0.45),inset_0_0_18px_rgba(243,223,155,0.22)]'}`}
            >
              <UserIcon size={18} />
              <span className="hidden md:inline font-bold text-sm">{user.name.split(' ')[0]}</span>
            </button>
          )}
          <button onClick={() => navigateAndClose('TOOLS')} className={`hidden xl:flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ease-out border ${currentView === 'TOOLS' ? 'bg-[#f3df9b] text-black border-[#f3df9b] shadow-none' : 'bg-transparent text-black border-transparent hover:text-black hover:shadow-[0_0_30px_rgba(243,223,155,0.95),0_0_64px_rgba(243,223,155,0.45),inset_0_0_18px_rgba(243,223,155,0.22)]'}`}><Wrench size={18} /><span className="hidden md:inline font-bold text-sm">Tools</span></button>

          <div className="relative" ref={settingsRef}>
            <button onClick={() => setShowSettingsMenu(v => !v)} className={`p-2 rounded-full transition-all duration-300 ease-out border text-black ${showSettingsMenu ? 'bg-[#f3df9b] border-[#f3df9b] shadow-none' : 'bg-transparent border-transparent hover:shadow-[0_0_24px_rgba(243,223,155,0.82),0_0_42px_rgba(243,223,155,0.36)]'}`} title="Settings">
              <Settings size={20} className={`transition-transform duration-300 ${showSettingsMenu ? 'rotate-45' : 'rotate-0'}`} />
            </button>
            {showSettingsMenu && (
              <div className="absolute top-full right-0 mt-2 w-64 rounded-2xl border border-slate-200 dark:border-[#4b5563] bg-white dark:bg-[#2b2b2b] p-4 shadow-2xl animate-fade-in z-[70]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-3">Settings</p>

                <div className="space-y-2 mb-4">
                  <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#3a3a3a] transition-colors group">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-blue-400/20 text-blue-400' : 'bg-[#f3df9b]/45 text-[#b88700]'}`}>{isDarkMode ? <Moon size={16} /> : <Sun size={16} />}</div>
                      <span className="flex-1 text-center text-sm font-bold text-black/80 dark:text-white group-hover:text-black dark:group-hover:text-white">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${isDarkMode ? 'bg-blue-400' : 'bg-[#f3df9b]'}`}>
                      <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${isDarkMode ? 'left-5' : 'left-1'}`} />
                    </div>
                  </button>

                  <button onClick={() => setShowDoodles(!showDoodles)} className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#3a3a3a] transition-colors group">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-1.5 rounded-lg ${showDoodles ? 'bg-pink-500/20 text-pink-600 dark:text-pink-300' : 'bg-black/10 dark:bg-white/10 text-black/80 dark:text-white'}`}><Palette size={16} /></div>
                      <span className="flex-1 text-center text-sm font-bold text-black/80 dark:text-white group-hover:text-black dark:group-hover:text-white">Doodle Background</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${showDoodles ? 'bg-pink-500' : 'bg-slate-600'}`}>
                      <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${showDoodles ? 'left-5' : 'left-1'}`} />
                    </div>
                  </button>

                  {isDarkMode && (
                    <button onClick={() => setNeonMode(!neonMode)} className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#3a3a3a] transition-colors group">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`p-1.5 rounded-lg ${neonMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-black/10 dark:bg-white/10 text-black/80 dark:text-white'}`}><Sparkles size={16} /></div>
                        <span className="flex-1 text-center text-sm font-bold text-black/80 dark:text-white group-hover:text-black dark:group-hover:text-white">Neon Accents</span>
                      </div>
                      <div className={`w-8 h-4 rounded-full relative transition-colors ${neonMode ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                        <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${neonMode ? 'left-5' : 'left-1'}`} />
                      </div>
                    </button>
                  )}

                  <button onClick={() => setGlassMode(!glassMode)} className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#3a3a3a] transition-colors group">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-1.5 rounded-lg ${glassMode ? 'bg-sky-500/20 text-sky-400' : 'bg-black/10 dark:bg-white/10 text-black/80 dark:text-white'}`}><div className="w-4 h-4 rounded-full border-2 border-current opacity-70" /></div>
                      <span className="flex-1 text-center text-sm font-bold text-black/80 dark:text-white group-hover:text-black dark:group-hover:text-white">Glassmorphism</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${glassMode ? 'bg-sky-500' : 'bg-slate-600'}`}>
                      <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${glassMode ? 'left-5' : 'left-1'}`} />
                    </div>
                  </button>
                </div>

                <div className="h-px bg-black dark:bg-white mb-3" />

                {isAdmin ? (
                  <>
                    <div className="flex items-center gap-2 px-3 py-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Admin Active</span>
                    </div>
                    <button onClick={() => { setIsAdmin(false); setShowSettingsMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 text-sm font-bold transition-colors"><LogOut size={15} /> Logout Admin</button>
                  </>
                ) : (
                  <button onClick={() => { onOpenAdminLogin(); setShowSettingsMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-black dark:text-white hover:bg-slate-100 dark:hover:bg-[#3a3a3a] hover:text-black dark:hover:text-white text-sm font-bold transition-colors"><Lock size={15} /> <span>Admin Portal</span></button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
