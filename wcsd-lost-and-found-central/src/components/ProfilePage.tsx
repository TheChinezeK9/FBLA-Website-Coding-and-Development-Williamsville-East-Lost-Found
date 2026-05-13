import React, { useEffect, useRef, useState } from 'react';
import { Mail, GraduationCap, Hash, Calendar, LogOut, Settings, Camera, RefreshCcw, Trash2, Globe, ChevronDown, Activity } from 'lucide-react';
import { User as UserType, WishlistItem, View, LostItem, ClaimedLog } from '../types';
import { ProfileOverview } from './profile/ProfileOverview';
import { ProfileNotifications } from './profile/ProfileNotifications';
import { ProfileWishlist } from './profile/ProfileWishlist';
import { ProfileEdit } from './profile/ProfileEdit';
import { FlipperStat } from './profile/FlipperStat';
import { ProfileImageCropModal } from './profile/ProfileImageCropModal';
import { useTranslationSettings } from '../translation/TranslationProvider';

interface ProfilePageProps {
  user: UserType;
  items: LostItem[];
  claimLogs: ClaimedLog[];
  onLogout: () => void;
  onNavigate: (view: View) => void;
  onUserUpdated: (user: UserType) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, items, claimLogs, onLogout, onNavigate, onUserUpdated }) => {
  const [activeSection, setActiveSection] = useState<'OVERVIEW' | 'NOTIFICATIONS' | 'WISHLIST' | 'EDIT'>('OVERVIEW');
  const [profileUser, setProfileUser] = useState<UserType>(user);
  const [profileImage, setProfileImage] = useState('');
  const [pendingProfileImage, setPendingProfileImage] = useState('');
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffsetX, setCropOffsetX] = useState(0);
  const [cropOffsetY, setCropOffsetY] = useState(0);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [popupText, setPopupText] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showNotificationDot, setShowNotificationDot] = useState(false);
  const [showWishlistDot, setShowWishlistDot] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editGrade, setEditGrade] = useState(user.grade || '');
  const [editStudentId, setEditStudentId] = useState(user.studentId || '');
  const [profileSaveMessage, setProfileSaveMessage] = useState('');
  const [profileSaveError, setProfileSaveError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isProfileDraftDirty, setIsProfileDraftDirty] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { languageCode, setLanguageCode, supportedLanguages, isLoadingLanguages, isTranslating, translationError } = useTranslationSettings();
  const normalizedUserEmail = user.email.toLowerCase();
  const currentYear = new Date().getFullYear();
  const isCurrentYearDate = (value?: string) => {
    if (!value) return false;
    const parsed = new Date(value);
    return !Number.isNaN(parsed.getTime()) && parsed.getFullYear() === currentYear;
  };
  const postedCount = items.filter(item =>
    (item.reporterUserId === user.id || item.reporterEmail?.toLowerCase() === normalizedUserEmail) &&
    isCurrentYearDate(item.date)
  ).length;
  const pendingReviewCount = items.filter(item =>
    (item.reporterUserId === user.id || item.reporterEmail?.toLowerCase() === normalizedUserEmail) &&
    item.status === 'lost' &&
    isCurrentYearDate(item.date)
  ).length;
  const pendingClaimCount = items.filter(item =>
    (item.claimantUserId === user.id || item.claimantEmail?.toLowerCase() === normalizedUserEmail) &&
    isCurrentYearDate(item.date)
  ).length;
  const claimedCount = claimLogs.filter(log =>
    log.claimedEmail?.toLowerCase() === normalizedUserEmail &&
    isCurrentYearDate(log.claimedAt)
  ).length;
  const notificationsSeenStorageKey = `wcsd_seen_notification_ts_${user.id}`;
  const notificationsPopupStorageKey = `wcsd_popped_notification_id_${user.id}`;
  const wishlistSeenStorageKey = `wcsd_seen_wishlist_ts_${user.id}`;
  const initialSeenNotificationTs =
    Number(sessionStorage.getItem(notificationsSeenStorageKey) || '') ||
    (user.notifications || []).reduce((latest, notification) => {
      const ts = Date.parse(notification.date || '');
      return Number.isNaN(ts) ? latest : Math.max(latest, ts);
    }, 0);
  const initialSeenWishlistTs = Number(sessionStorage.getItem(wishlistSeenStorageKey) || '') || 0;
  const initializedRef = useRef(false);
  const lastViewedNotificationDateRef = useRef(initialSeenNotificationTs);
  const lastPoppedNotificationIdRef = useRef<string | null>(sessionStorage.getItem(notificationsPopupStorageKey));
  const lastViewedWishlistDateRef = useRef(initialSeenWishlistTs);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const profileImageKey = `wcsd_profile_photo_${user.email.toLowerCase()}`;

  const persistSeenNotificationTimestamp = (timestamp: number) => {
    lastViewedNotificationDateRef.current = timestamp;
    sessionStorage.setItem(notificationsSeenStorageKey, String(timestamp));
  };

  const persistPoppedNotificationId = (notificationId: string | null) => {
    lastPoppedNotificationIdRef.current = notificationId;
    if (notificationId) {
      sessionStorage.setItem(notificationsPopupStorageKey, notificationId);
    } else {
      sessionStorage.removeItem(notificationsPopupStorageKey);
    }
  };

  const persistSeenWishlistTimestamp = (timestamp: number) => {
    lastViewedWishlistDateRef.current = timestamp;
    sessionStorage.setItem(wishlistSeenStorageKey, String(timestamp));
  };
  useEffect(() => {
    const saved = localStorage.getItem(profileImageKey);
    if (saved) setProfileImage(saved);
  }, [profileImageKey]);

  const load = async () => {
    try {
      const response = await fetch(`/api/users/${user.id}?email=${encodeURIComponent(user.email)}`, { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      const wasInitialized = initializedRef.current;
      if (data?.user) {
        const incoming = Array.isArray(data.user.notifications) ? data.user.notifications : [];
        const latestNotificationTimestamp = incoming.reduce((latest: number, notification: any) => {
          const ts = Date.parse(notification?.date || '');
          return Number.isNaN(ts) ? latest : Math.max(latest, ts);
        }, 0);
        if (wasInitialized) {
          const newestUnseen = incoming[0];
          if (
            newestUnseen?.text &&
            newestUnseen?.id &&
            latestNotificationTimestamp > lastViewedNotificationDateRef.current &&
            newestUnseen.id !== lastPoppedNotificationIdRef.current
          ) {
            setPopupText(newestUnseen.text);
            setShowPopup(true);
            persistPoppedNotificationId(newestUnseen.id);
          }
          if (activeSection !== 'NOTIFICATIONS' && latestNotificationTimestamp > lastViewedNotificationDateRef.current) {
            setShowNotificationDot(true);
          } else if (activeSection === 'NOTIFICATIONS') {
            setShowNotificationDot(false);
            persistSeenNotificationTimestamp(latestNotificationTimestamp);
            if (incoming[0]?.id) persistPoppedNotificationId(incoming[0].id);
          }
        } else {
          if (activeSection === 'NOTIFICATIONS') {
            persistSeenNotificationTimestamp(latestNotificationTimestamp);
          }
          if (incoming[0]?.id) persistPoppedNotificationId(incoming[0].id);
        }
        initializedRef.current = true;
        setProfileUser(data.user);
        if (!(activeSection === 'EDIT' && isProfileDraftDirty)) {
          setEditName(data.user.name || '');
          setEditEmail(data.user.email || '');
          setEditGrade(data.user.grade || '');
          setEditStudentId(data.user.studentId || '');
        }
      }
      if (Array.isArray(data?.wishlist)) {
        const latestWishlistTimestamp = data.wishlist.reduce((latest: number, wish: any) => {
          const ts = Date.parse(wish?.addedAt || '');
          return Number.isNaN(ts) ? latest : Math.max(latest, ts);
        }, 0);
        if (wasInitialized) {
          if (activeSection !== 'WISHLIST' && latestWishlistTimestamp > lastViewedWishlistDateRef.current) {
            setShowWishlistDot(true);
          } else if (activeSection === 'WISHLIST') {
            setShowWishlistDot(false);
            persistSeenWishlistTimestamp(latestWishlistTimestamp);
          }
        } else {
          if (activeSection === 'WISHLIST') {
            persistSeenWishlistTimestamp(latestWishlistTimestamp);
          }
        }
        setWishlist(data.wishlist);
      }
    } catch {
    }
  };

  useEffect(() => {
    let cancelled = false;
    const initial = async () => {
      if (!cancelled) await load();
    };
    void initial();
    const timer = window.setInterval(() => {
      if (!cancelled) void load();
    }, 1000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [user.id, user.email, activeSection]);

  useEffect(() => {
    if (!showPopup) return;
    const timer = window.setTimeout(() => setShowPopup(false), 4500);
    return () => window.clearTimeout(timer);
  }, [showPopup]);

  useEffect(() => {
    if (activeSection === 'NOTIFICATIONS') {
      setShowNotificationDot(false);
      persistSeenNotificationTimestamp(profileUser.notifications.reduce((latest, notification) => {
        const ts = Date.parse(notification.date || '');
        return Number.isNaN(ts) ? latest : Math.max(latest, ts);
      }, 0));
      if (profileUser.notifications[0]?.id) {
        persistPoppedNotificationId(profileUser.notifications[0].id);
      }
    }
    if (activeSection === 'WISHLIST') {
      setShowWishlistDot(false);
      persistSeenWishlistTimestamp(wishlist.reduce((latest, wish) => {
        const ts = Date.parse(wish.addedAt || '');
        return Number.isNaN(ts) ? latest : Math.max(latest, ts);
      }, 0));
    }
  }, [activeSection, profileUser.notifications, wishlist]);

  const removeNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/users/${user.id}/notifications/${notificationId}?email=${encodeURIComponent(user.email)}`, { method: 'DELETE' });
      if (!response.ok) return;
      setProfileUser(prev => ({ ...prev, notifications: prev.notifications.filter(n => n.id !== notificationId) }));
    } catch {
    }
  };

  const removeWish = async (wishId: string) => {
    try {
      const response = await fetch(`/api/users/${user.id}/wishlist/${wishId}?email=${encodeURIComponent(user.email)}`, { method: 'DELETE' });
      if (!response.ok) return;
      setWishlist(prev => prev.filter(w => w.id !== wishId));
    } catch {
    }
  };

  const openWishInTools = (wish: WishlistItem) => {
    sessionStorage.setItem('wcsd_focus_wish', JSON.stringify({ text: wish.text, category: wish.category }));
    onNavigate('TOOLS');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaveMessage('');
    setProfileSaveError('');

    if (!editName.trim() || !editEmail.trim()) {
      setProfileSaveError('Name and email are required.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: editName.trim(),
          nextEmail: editEmail.trim().toLowerCase(),
          grade: editGrade.trim(),
          studentId: editStudentId.trim()
        })
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.user) {
        setProfileSaveError(data?.error || 'Could not update profile.');
        return;
      }

      setProfileUser(data.user);
      onUserUpdated(data.user);
      setEditName(data.user.name || '');
      setEditEmail(data.user.email || '');
      setEditGrade(data.user.grade || '');
      setEditStudentId(data.user.studentId || '');
      setIsProfileDraftDirty(false);
      setProfileSaveMessage('Profile updated successfully.');
    } catch {
      setProfileSaveError('Network error while updating profile.');
    } finally {
      setIsSavingProfile(false);
    }
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
        body: JSON.stringify({ email: user.email, currentPassword, newPassword })
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

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) return;
      setPendingProfileImage(result);
      setCropZoom(1);
      setCropOffsetX(0);
      setCropOffsetY(0);
    };
    reader.readAsDataURL(file);
  };

  const cancelProfileImageCrop = () => {
    setPendingProfileImage('');
    setCropZoom(1);
    setCropOffsetX(0);
    setCropOffsetY(0);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const clearProfileImage = () => {
    setProfileImage('');
    localStorage.removeItem(profileImageKey);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      {showPopup && (
        <div className="fixed top-24 right-6 z-[250] max-w-sm bg-white dark:bg-[#2b2b2b] text-slate-900 dark:text-white rounded-2xl shadow-2xl border border-slate-200 dark:border-[#4b5563] px-4 py-3 animate-fade-in-up">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-white/70 mb-1">New Notification</p>
          <p className="text-sm font-semibold">{popupText}</p>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white dark:bg-[#2b2b2b] rounded-[32px] p-8 shadow-xl border border-slate-100 dark:border-[#4b5563] flex flex-col md:flex-row items-center gap-8">
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-32 h-32">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#e7a39b] to-[#f3df9b] flex items-center justify-center text-black text-5xl font-black shadow-lg overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt={`${profileUser.name} profile`} className="w-full h-full object-cover" />
                ) : (
                  profileUser.name.charAt(0)
                )}
              </div>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 z-10 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors shadow-lg"
                aria-label={profileImage ? 'Switch profile picture' : 'Upload profile picture'}
              >
                {profileImage ? <RefreshCcw size={16} /> : <Camera size={16} />}
              </button>
              {profileImage && (
                <button
                  type="button"
                  onClick={clearProfileImage}
                  className="absolute -top-1 -right-1 z-10 w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                  aria-label="Delete profile picture"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{profileUser.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-500 dark:text-white text-sm font-medium">
              <div className="flex items-center gap-1.5"><GraduationCap size={16} /> <span className="font-bold">Grade:</span> {profileUser.grade || 'N/A'}</div>
              <div className="flex items-center gap-1.5"><Hash size={16} /> <span className="font-bold">School ID:</span> {profileUser.studentId || 'N/A'}</div>
              <a href={`mailto:${profileUser.email}`} className="flex items-center gap-1.5 hover:text-[#e7a39b] transition-colors">
                <Mail size={16} /> <span className="font-bold">Email:</span> {profileUser.email}
              </a>
              <div className="flex items-center gap-1.5"><Calendar size={16} /> <span className="font-bold">Date Joined:</span> {new Date(profileUser.joinedAt).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            <button onClick={() => setActiveSection('EDIT')} className="px-6 py-3 bg-[#f3df9b] text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#f6e9b8] transition-colors">
              <Settings size={18} /> <span>Edit Profile</span>
            </button>
            <button onClick={onLogout} className="px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              <LogOut size={18} /> <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
          {[
            ['NOTIFICATIONS', 'Notifications'],
            ['WISHLIST', 'Wishlist'],
            ['OVERVIEW', 'Policy Pages']
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveSection(key as 'OVERVIEW' | 'NOTIFICATIONS' | 'WISHLIST')}
              className={`relative px-5 py-3 rounded-full font-bold transition-colors border ${activeSection === key ? 'bg-[#f3df9b] text-black border-[#f3df9b]' : 'bg-white dark:bg-[#2b2b2b] text-slate-700 dark:text-white border-slate-200 dark:border-[#4b5563]'}`}
            >
              <span>{label}</span>
              {key === 'NOTIFICATIONS' && showNotificationDot && (
                <span className="absolute -top-0.5 -right-0.5 inline-block w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.55)]" />
              )}
              {key === 'WISHLIST' && showWishlistDot && (
                <span className="absolute -top-0.5 -right-0.5 inline-block w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              )}
            </button>
          ))}
        </div>

        {activeSection === 'OVERVIEW' && <ProfileOverview />}

        {activeSection === 'NOTIFICATIONS' && (
          <ProfileNotifications
            notifications={profileUser.notifications}
            onRemoveNotification={(notificationId) => void removeNotification(notificationId)}
          />
        )}

        {activeSection === 'WISHLIST' && (
          <ProfileWishlist
            wishlist={wishlist}
            onRemoveWish={(wishId) => void removeWish(wishId)}
            onOpenWish={openWishInTools}
          />
        )}

        {activeSection === 'EDIT' && (
          <ProfileEdit
            editName={editName}
            editEmail={editEmail}
            editGrade={editGrade}
            editStudentId={editStudentId}
            currentPassword={currentPassword}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            profileSaveMessage={profileSaveMessage}
            profileSaveError={profileSaveError}
            passwordMessage={passwordMessage}
            passwordError={passwordError}
            isSavingProfile={isSavingProfile}
            isChangingPassword={isChangingPassword}
            onEditNameChange={value => { setEditName(value); setIsProfileDraftDirty(true); }}
            onEditEmailChange={value => { setEditEmail(value); setIsProfileDraftDirty(true); }}
            onEditGradeChange={value => { setEditGrade(value); setIsProfileDraftDirty(true); }}
            onEditStudentIdChange={value => { setEditStudentId(value); setIsProfileDraftDirty(true); }}
            onCurrentPasswordChange={setCurrentPassword}
            onNewPasswordChange={setNewPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onSaveProfile={handleSaveProfile}
            onChangePassword={handleChangePassword}
          />
        )}

        <div className="bg-white dark:bg-[#2b2b2b] rounded-[32px] p-8 shadow-xl border border-slate-100 dark:border-[#4b5563]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#1f1f1f] text-slate-600 dark:text-white flex items-center justify-center">
              <Globe size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Change Language</h2>
              <p className="text-sm text-slate-500 dark:text-white">Choose the language you want the site to use.</p>
            </div>
          </div>

          <div className="max-w-sm space-y-3">
            <div data-no-translate className="relative">
              <select
                value={languageCode}
                onChange={e => setLanguageCode(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-slate-200 dark:border-[#4b5563] bg-white dark:bg-[#1f1f1f] pl-4 pr-12 py-3 text-sm font-semibold text-slate-900 dark:text-white outline-none"
              >
                {supportedLanguages.map(language => (
                  <option key={language.code} value={language.code}>
                    {language.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-white"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-white">
              {isLoadingLanguages ? 'Loading languages...' : isTranslating ? 'Translating the site...' : 'Language preference is saved automatically.'}
            </p>
            {translationError && <p className="text-xs font-semibold text-red-500">{translationError}</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-[#2b2b2b] rounded-[32px] p-8 shadow-xl border border-slate-100 dark:border-[#4b5563]">
          <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#f3df9b] text-black flex items-center justify-center">
                  <Activity size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Item Activity Tracker</h2>
                  <p className="text-sm text-slate-500 dark:text-white">A snapshot of your lost and found activity this year.</p>
                </div>
              </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <FlipperStat label="Items Posted" value={postedCount} accentClass="bg-[#e7a39b]" />
            <FlipperStat label="Items Claimed" value={claimedCount} accentClass="bg-emerald-500" />
            <FlipperStat label="Posts Pending" value={pendingReviewCount} accentClass="bg-[#f3df9b]" />
            <FlipperStat label="Claims Pending" value={pendingClaimCount} accentClass="bg-sky-500" />
          </div>
        </div>
      </div>

      {pendingProfileImage && (
        <ProfileImageCropModal
          image={pendingProfileImage}
          cropZoom={cropZoom}
          cropOffsetX={cropOffsetX}
          cropOffsetY={cropOffsetY}
          onCropZoomChange={setCropZoom}
          onCropOffsetXChange={setCropOffsetX}
          onCropOffsetYChange={setCropOffsetY}
          onCancel={cancelProfileImageCrop}
          onSave={cropped => {
            setProfileImage(cropped);
            localStorage.setItem(profileImageKey, cropped);
            setPendingProfileImage('');
          }}
        />
      )}
    </div>
  );
};
