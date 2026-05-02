import React from 'react';
import { Settings, Shield } from 'lucide-react';

interface ProfileEditProps {
  editName: string;
  editEmail: string;
  editGrade: string;
  editStudentId: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  profileSaveMessage: string;
  profileSaveError: string;
  passwordMessage: string;
  passwordError: string;
  isSavingProfile: boolean;
  isChangingPassword: boolean;
  onEditNameChange: (value: string) => void;
  onEditEmailChange: (value: string) => void;
  onEditGradeChange: (value: string) => void;
  onEditStudentIdChange: (value: string) => void;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSaveProfile: (e: React.FormEvent) => void;
  onChangePassword: (e: React.FormEvent) => void;
}

export const ProfileEdit: React.FC<ProfileEditProps> = ({
  editName,
  editEmail,
  editGrade,
  editStudentId,
  currentPassword,
  newPassword,
  confirmPassword,
  profileSaveMessage,
  profileSaveError,
  passwordMessage,
  passwordError,
  isSavingProfile,
  isChangingPassword,
  onEditNameChange,
  onEditEmailChange,
  onEditGradeChange,
  onEditStudentIdChange,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSaveProfile,
  onChangePassword
}) => {
  return (
    <div className="bg-white dark:bg-[#2b2b2b] rounded-[32px] p-8 shadow-xl border border-slate-100 dark:border-[#4b5563] space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#1f1f1f] text-slate-600 dark:text-white flex items-center justify-center">
          <Settings size={20} />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Edit Profile</h2>
      </div>

      <form
        onSubmit={onSaveProfile}
        className="p-5 rounded-2xl border border-slate-200 dark:border-[#4b5563] bg-slate-50/70 dark:bg-[#1f1f1f] space-y-3"
      >
        <p className="text-sm font-bold text-slate-900 dark:text-white">Basic Information</p>
        <input
          value={editName}
          onChange={e => onEditNameChange(e.target.value)}
          placeholder="Full name"
          className="w-full rounded-xl border border-slate-200 dark:border-[#4b5563] bg-white dark:bg-[#1f1f1f] px-4 py-3 text-sm outline-none text-slate-900 dark:text-slate-50"
        />
        <input
          value={editEmail}
          onChange={e => onEditEmailChange(e.target.value)}
          placeholder="Email"
          className="w-full rounded-xl border border-slate-200 dark:border-[#4b5563] bg-white dark:bg-[#1f1f1f] px-4 py-3 text-sm outline-none text-slate-900 dark:text-slate-50"
        />
        <input
          value={editGrade}
          onChange={e => onEditGradeChange(e.target.value)}
          placeholder="Grade"
          className="w-full rounded-xl border border-slate-200 dark:border-[#4b5563] bg-white dark:bg-[#1f1f1f] px-4 py-3 text-sm outline-none text-slate-900 dark:text-slate-50"
        />
        <input
          value={editStudentId}
          onChange={e => onEditStudentIdChange(e.target.value)}
          placeholder="School ID"
          className="w-full rounded-xl border border-slate-200 dark:border-[#4b5563] bg-white dark:bg-[#1f1f1f] px-4 py-3 text-sm outline-none text-slate-900 dark:text-slate-50"
        />
        {profileSaveError && <p className="text-xs font-semibold text-red-500">{profileSaveError}</p>}
        {profileSaveMessage && <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{profileSaveMessage}</p>}
        <button
          type="submit"
          disabled={isSavingProfile}
          className="w-full rounded-xl bg-[#f3df9b] text-black py-3 text-sm font-bold hover:bg-[#f6e9b8] disabled:opacity-50 transition-colors"
        >
          {isSavingProfile ? 'Saving...' : 'Save Basic Info'}
        </button>
      </form>

      <form
        onSubmit={onChangePassword}
        className="p-5 rounded-2xl border border-slate-200 dark:border-[#4b5563] bg-slate-50/70 dark:bg-[#1f1f1f] space-y-3"
      >
        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
          <Shield size={18} />
          <p className="text-sm font-bold">Change Password</p>
        </div>
        <p className="text-xs text-slate-500 dark:text-white">Update your password right from your profile.</p>
        <input
          type="password"
          value={currentPassword}
          onChange={e => onCurrentPasswordChange(e.target.value)}
          placeholder="Current password"
          className="w-full rounded-xl border border-slate-200 dark:border-[#4b5563] bg-white dark:bg-[#1f1f1f] px-4 py-3 text-sm outline-none text-slate-900 dark:text-slate-50"
        />
        <input
          type="password"
          value={newPassword}
          onChange={e => onNewPasswordChange(e.target.value)}
          placeholder="New password"
          className="w-full rounded-xl border border-slate-200 dark:border-[#4b5563] bg-white dark:bg-[#1f1f1f] px-4 py-3 text-sm outline-none text-slate-900 dark:text-slate-50"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={e => onConfirmPasswordChange(e.target.value)}
          placeholder="Confirm new password"
          className="w-full rounded-xl border border-slate-200 dark:border-[#4b5563] bg-white dark:bg-[#1f1f1f] px-4 py-3 text-sm outline-none text-slate-900 dark:text-slate-50"
        />
        {passwordError && <p className="text-xs font-semibold text-red-500">{passwordError}</p>}
        {passwordMessage && <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{passwordMessage}</p>}
        <button
          type="submit"
          disabled={isChangingPassword}
          className="w-full rounded-xl bg-[#f3df9b] text-black py-3 text-sm font-bold hover:bg-[#f6e9b8] disabled:opacity-50 transition-colors"
        >
          {isChangingPassword ? 'Updating...' : 'Save New Password'}
        </button>
      </form>
    </div>
  );
};
