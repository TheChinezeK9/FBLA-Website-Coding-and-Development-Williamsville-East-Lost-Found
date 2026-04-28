import React, { useEffect, useRef, useState } from 'react';
import { Mail, GraduationCap, Hash, Calendar, Bell, Heart, LogOut, Settings, X, Shield, ExternalLink } from 'lucide-react';
import { User as UserType, WishlistItem, View } from '../types';

interface ProfilePageProps {
  user: UserType;
  onLogout: () => void;
  onNavigate: (view: View) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout, onNavigate }) => {
  const [profileUser, setProfileUser] = useState<UserType>(user);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [popupText, setPopupText] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const seenNotificationIdsRef = useRef<Set<string>>(new Set((user.notifications || []).map(n => n.id)));
  const initializedRef = useRef(false);

  const load = async () => {
    try {
      const response = await fetch(`/api/users/${user.id}?email=${encodeURIComponent(user.email)}`, { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      if (data?.user) {
        const incoming = Array.isArray(data.user.notifications) ? data.user.notifications : [];
        const incomingIds = new Set(incoming.map((n: any) => n.id));
        if (initializedRef.current) {
          const newestUnseen = incoming.find((n: any) => !seenNotificationIdsRef.current.has(n.id));
          if (newestUnseen?.text) {
            setPopupText(newestUnseen.text);
            setShowPopup(true);
          }
        }
        seenNotificationIdsRef.current = incomingIds;
        initializedRef.current = true;
        setProfileUser(data.user);
      }
      if (Array.isArray(data?.wishlist)) setWishlist(data.wishlist);
    } catch {
    }
  };

  useEffect(() => {
    let cancelled = false;

    const initial = async () => {
      if (cancelled) return;
      await load();
    };

    void initial();

    const timer = window.setInterval(() => {
      if (!cancelled) void load();
    }, 1000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [user.id, user.email]);

  useEffect(() => {
    if (!showPopup) return;
    const timer = window.setTimeout(() => setShowPopup(false), 4500);
    return () => window.clearTimeout(timer);
  }, [showPopup]);

  const removeNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/users/${user.id}/notifications/${notificationId}?email=${encodeURIComponent(user.email)}`, {
        method: 'DELETE'
      });
      if (!response.ok) return;
      setProfileUser(prev => ({
        ...prev,
        notifications: prev.notifications.filter(n => n.id !== notificationId)
      }));
    } catch {
    }
  };

  const removeWish = async (wishId: string) => {
    try {
      const response = await fetch(`/api/users/${user.id}/wishlist/${wishId}?email=${encodeURIComponent(user.email)}`, {
        method: 'DELETE'
      });
      if (!response.ok) return;
      setWishlist(prev => prev.filter(w => w.id !== wishId));
    } catch {
    }
  };

  const openWishInTools = (wish: WishlistItem) => {
    sessionStorage.setItem('wcsd_focus_wish', JSON.stringify({ text: wish.text, category: wish.category }));
    onNavigate('TOOLS');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Fill in all password fields.');
      return;
    }

    if (newPassword.length < 4) {
      setPasswordError('New password must be at least 4 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch(`/api/users/${user.id}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          currentPassword,
          newPassword
        })
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setPasswordError(data?.error || 'Could not change password.');
        return;
      }

      setPasswordMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setPasswordError('Network error while changing password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      {showPopup && (
        <div className="fixed top-24 right-6 z-[250] max-w-sm bg-[#142e53] text-white rounded-2xl shadow-2xl border border-white/10 px-4 py-3 animate-fade-in-up">
          <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">New Notification</p>
          <p className="text-sm font-semibold">{popupText}</p>
        </div>
      )}
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white dark:bg-[#2b2b2b] rounded-[32px] p-8 shadow-xl border border-slate-100 dark:border-[#4b5563] flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#ab1e2f] to-[#142e53] flex items-center justify-center text-white text-5xl font-black shadow-lg">
            {profileUser.name.charAt(0)}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{profileUser.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-500 dark:text-white text-sm font-medium">
              <div className="flex items-center gap-1.5"><Mail size={16} /> {profileUser.email}</div>
              {profileUser.grade && <div className="flex items-center gap-1.5"><GraduationCap size={16} /> Grade {profileUser.grade}</div>}
              {profileUser.studentId && <div className="flex items-center gap-1.5"><Hash size={16} /> ID: {profileUser.studentId}</div>}
              <div className="flex items-center gap-1.5"><Calendar size={16} /> Joined {new Date(profileUser.joinedAt).toLocaleDateString()}</div>
            </div>
          </div>
          <button onClick={onLogout} className="px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-[#2b2b2b] rounded-[32px] shadow-xl border border-slate-100 dark:border-[#4b5563] overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-[#4b5563] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Bell size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Notifications</h2>
              </div>
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">
                {profileUser.notifications.filter(n => !n.read).length} New
              </span>
            </div>
            <div className="p-6 space-y-4 max-h-[420px] overflow-y-auto">
              {profileUser.notifications.length > 0 ? (
                profileUser.notifications.map(notif => (
                  <div key={notif.id} className={`p-4 rounded-2xl border ${notif.read ? 'bg-slate-50 dark:bg-[#1f1f1f] border-slate-100 dark:border-[#4b5563]' : 'bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'} transition-colors`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1">{notif.text}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(notif.date).toLocaleDateString()}</p>
                      </div>
                      <button type="button" onClick={() => void removeNotification(notif.id)} className="text-slate-400 hover:text-red-500">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <p className="text-slate-400 dark:text-white font-medium">No notifications yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#2b2b2b] rounded-[32px] shadow-xl border border-slate-100 dark:border-[#4b5563] overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-[#4b5563] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                  <Heart size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">I'm looking for...</h2>
              </div>
            </div>
            <div className="p-6 space-y-3 max-h-[420px] overflow-y-auto">
              {wishlist.length > 0 ? (
                wishlist.map(wish => (
                  <div key={wish.id} className="relative p-4 pr-28 min-h-[104px] bg-slate-50 dark:bg-[#1f1f1f] rounded-2xl border border-slate-100 dark:border-[#4b5563]">
                    <button
                      type="button"
                      onClick={() => void removeWish(wish.id)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                    <div className="pr-2">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{wish.text}</p>
                      <p className="text-[10px] text-slate-400 dark:text-white font-bold uppercase tracking-widest">{wish.category}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openWishInTools(wish)}
                      className="absolute bottom-3 right-3 text-xs font-bold text-[#142e53] dark:text-white hover:opacity-80"
                    >
                      Check for item -&gt;
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <p className="text-slate-400 dark:text-white font-medium">Your list is empty.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#2b2b2b] rounded-[32px] p-8 shadow-xl border border-slate-100 dark:border-[#4b5563]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#1f1f1f] text-slate-600 dark:text-white flex items-center justify-center">
              <Settings size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Account Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <form onSubmit={handleChangePassword} className="p-5 rounded-2xl border border-slate-200 dark:border-[#4b5563] bg-slate-50/70 dark:bg-[#1f1f1f] space-y-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Shield size={18} />
                <p className="text-sm font-bold">Change Password</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-white">Update your password right from your profile.</p>

              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="w-full rounded-xl border border-slate-200 dark:border-[#4b5563] bg-white dark:bg-[#1f1f1f] px-4 py-3 text-sm outline-none text-slate-900 dark:text-white"
              />
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full rounded-xl border border-slate-200 dark:border-[#4b5563] bg-white dark:bg-[#1f1f1f] px-4 py-3 text-sm outline-none text-slate-900 dark:text-white"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-xl border border-slate-200 dark:border-[#4b5563] bg-white dark:bg-[#1f1f1f] px-4 py-3 text-sm outline-none text-slate-900 dark:text-white"
              />

              {passwordError && <p className="text-xs font-semibold text-red-500">{passwordError}</p>}
              {passwordMessage && <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{passwordMessage}</p>}

              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full rounded-xl bg-[#142e53] text-white py-3 text-sm font-bold disabled:opacity-50"
              >
                {isChangingPassword ? 'Updating...' : 'Save New Password'}
              </button>
            </form>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-[#4b5563] hover:bg-slate-50 dark:hover:bg-[#1f1f1f] transition-colors space-y-4">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                <ExternalLink size={18} />
                <p className="text-sm font-bold">Policies & Accessibility</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-white">Open the documents directly from your profile page.</p>

              <div className="space-y-3">
                <a
                  href="/privacypolicy.html"
                  className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-[#4b5563] px-4 py-3 text-sm font-semibold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-[#1f1f1f] transition-colors"
                >
                  <span>Privacy Policy</span>
                  <ExternalLink size={16} />
                </a>

                <a
                  href="/termsofservice.html"
                  className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-[#4b5563] px-4 py-3 text-sm font-semibold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-[#1f1f1f] transition-colors"
                >
                  <span>Terms of Use</span>
                  <ExternalLink size={16} />
                </a>

                <a
                  href="/accessibility.html"
                  className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-[#4b5563] px-4 py-3 text-sm font-semibold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-[#1f1f1f] transition-colors"
                >
                  <span>Accessibility</span>
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
