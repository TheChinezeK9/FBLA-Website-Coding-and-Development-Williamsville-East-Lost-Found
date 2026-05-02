import React, { useEffect, useRef, useState } from 'react';
import { Mail, GraduationCap, Hash, Calendar, LogOut, Settings, X, Camera, RefreshCcw, Trash2 } from 'lucide-react';
import { User as UserType, WishlistItem, View } from '../types';
import { ProfileOverview } from './profile/ProfileOverview';
import { ProfileNotifications } from './profile/ProfileNotifications';
import { ProfileWishlist } from './profile/ProfileWishlist';
import { ProfileEdit } from './profile/ProfileEdit';

interface ProfilePageProps {
  user: UserType;
  onLogout: () => void;
  onNavigate: (view: View) => void;
  onUserUpdated: (user: UserType) => void;
}

const createCroppedProfileImage = async (src: string, zoom: number, offsetX: number, offsetY: number) => {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

  const size = 320;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create image cropper.');

  const baseScale = Math.max(size / image.width, size / image.height);
  const scale = baseScale * zoom;
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const maxOffsetX = Math.max(0, (drawWidth - size) / 2);
  const maxOffsetY = Math.max(0, (drawHeight - size) / 2);
  const drawX = (size - drawWidth) / 2 - (offsetX / 100) * maxOffsetX;
  const drawY = (size - drawHeight) / 2 - (offsetY / 100) * maxOffsetY;

  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);

  return canvas.toDataURL('image/jpeg', 0.92);
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout, onNavigate, onUserUpdated }) => {
  const [activeSection, setActiveSection] = useState<'OVERVIEW' | 'NOTIFICATIONS' | 'WISHLIST' | 'EDIT'>('OVERVIEW');
  const [profileUser, setProfileUser] = useState<UserType>(user);
  const [profileImage, setProfileImage] = useState('');
  const [pendingProfileImage, setPendingProfileImage] = useState('');
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffsetX, setCropOffsetX] = useState(0);
  const [cropOffsetY, setCropOffsetY] = useState(0);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [popupText, setPopupText] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editGrade, setEditGrade] = useState(user.grade || '');
  const [editStudentId, setEditStudentId] = useState(user.studentId || '');
  const [profileSaveMessage, setProfileSaveMessage] = useState('');
  const [profileSaveError, setProfileSaveError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const seenNotificationIdsRef = useRef<Set<string>>(new Set((user.notifications || []).map(n => n.id)));
  const initializedRef = useRef(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const profileImageKey = `wcsd_profile_photo_${user.email.toLowerCase()}`;

  useEffect(() => {
    const saved = localStorage.getItem(profileImageKey);
    if (saved) setProfileImage(saved);
  }, [profileImageKey]);

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
        setEditName(data.user.name || '');
        setEditEmail(data.user.email || '');
        setEditGrade(data.user.grade || '');
        setEditStudentId(data.user.studentId || '');
      }
      if (Array.isArray(data?.wishlist)) setWishlist(data.wishlist);
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
  }, [user.id, user.email]);

  useEffect(() => {
    if (!showPopup) return;
    const timer = window.setTimeout(() => setShowPopup(false), 4500);
    return () => window.clearTimeout(timer);
  }, [showPopup]);

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

  const saveCroppedProfileImage = async () => {
    if (!pendingProfileImage) return;
    setIsSavingPhoto(true);
    try {
      const cropped = await createCroppedProfileImage(pendingProfileImage, cropZoom, cropOffsetX, cropOffsetY);
      setProfileImage(cropped);
      localStorage.setItem(profileImageKey, cropped);
      setPendingProfileImage('');
    } catch {
    } finally {
      setIsSavingPhoto(false);
    }
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
        <div className="fixed top-24 right-6 z-[250] max-w-sm bg-[#142e53] text-white rounded-2xl shadow-2xl border border-white/10 px-4 py-3 animate-fade-in-up">
          <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">New Notification</p>
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
              <div className="flex items-center gap-1.5"><GraduationCap size={16} /> Grade {profileUser.grade || 'N/A'}</div>
              <div className="flex items-center gap-1.5"><Hash size={16} /> School ID: {profileUser.studentId || 'N/A'}</div>
              <a href={`mailto:${profileUser.email}`} className="flex items-center gap-1.5 hover:text-[#e7a39b] transition-colors">
                <Mail size={16} /> {profileUser.email}
              </a>
              <div className="flex items-center gap-1.5"><Calendar size={16} /> Joined {new Date(profileUser.joinedAt).toLocaleDateString()}</div>
            </div>
          </div>

          <button onClick={() => setActiveSection('EDIT')} className="px-6 py-3 bg-[#e7a39b] text-black rounded-2xl font-bold flex items-center gap-2 hover:bg-[#d38a83] transition-colors">
            <Settings size={18} /> Edit Profile
          </button>
        </div>

        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
          {[
            ['OVERVIEW', 'Overview'],
            ['NOTIFICATIONS', 'Notifications'],
            ['WISHLIST', 'Wishlist']
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveSection(key as 'OVERVIEW' | 'NOTIFICATIONS' | 'WISHLIST')}
              className={`px-5 py-3 rounded-full font-bold transition-colors border ${activeSection === key ? 'bg-[#f3df9b] text-black border-[#f3df9b]' : 'bg-white dark:bg-[#2b2b2b] text-slate-700 dark:text-white border-slate-200 dark:border-[#4b5563]'}`}
            >
              {label}
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
            onEditNameChange={setEditName}
            onEditEmailChange={setEditEmail}
            onEditGradeChange={setEditGrade}
            onEditStudentIdChange={setEditStudentId}
            onCurrentPasswordChange={setCurrentPassword}
            onNewPasswordChange={setNewPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onSaveProfile={handleSaveProfile}
            onChangePassword={handleChangePassword}
          />
        )}

        <div className="flex justify-center pt-2">
          <button onClick={onLogout} className="px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {pendingProfileImage && (
        <div className="fixed inset-0 z-[260] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-[#2b2b2b] rounded-[32px] border border-slate-200 dark:border-[#4b5563] shadow-2xl p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Crop Profile Picture</h2>
                <p className="text-sm text-slate-500 dark:text-white mt-1">Adjust the framing before saving your profile photo.</p>
              </div>
              <button type="button" onClick={cancelProfileImageCrop} className="text-slate-400 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="grid md:grid-cols-[320px_1fr] gap-8 items-start">
              <div className="mx-auto">
                <div className="w-72 h-72 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-[#f3df9b] shadow-xl bg-slate-100 dark:bg-[#1f1f1f]">
                  <img
                    src={pendingProfileImage}
                    alt="Profile crop preview"
                    className="w-full h-full object-cover"
                    style={{ transform: `scale(${cropZoom}) translate(${cropOffsetX}%, ${cropOffsetY}%)`, transformOrigin: 'center' }}
                  />
                </div>
              </div>

              <div className="space-y-5">
                <label className="block">
                  <span className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Zoom</span>
                  <input type="range" min="0.6" max="2.6" step="0.05" value={cropZoom} onChange={e => setCropZoom(Number(e.target.value))} className="w-full accent-[#f3df9b] transition hover:brightness-105" />
                </label>
                <label className="block">
                  <span className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Move Left / Right</span>
                  <input type="range" min="-100" max="100" step="1" value={cropOffsetX} onChange={e => setCropOffsetX(Number(e.target.value))} className="w-full accent-[#f3df9b] transition hover:brightness-105" />
                </label>
                <label className="block">
                  <span className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Move Up / Down</span>
                  <input type="range" min="-100" max="100" step="1" value={cropOffsetY} onChange={e => setCropOffsetY(Number(e.target.value))} className="w-full accent-[#f3df9b] transition hover:brightness-105" />
                </label>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button type="button" onClick={cancelProfileImageCrop} className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-[#1f1f1f] text-slate-700 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-[#333333] transition-colors">
                    Cancel
                  </button>
                  <button type="button" onClick={saveCroppedProfileImage} disabled={isSavingPhoto} className="px-5 py-3 rounded-xl bg-[#f3df9b] text-black font-bold hover:bg-[#f6e9b8] disabled:opacity-50 transition-colors">
                    {isSavingPhoto ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
