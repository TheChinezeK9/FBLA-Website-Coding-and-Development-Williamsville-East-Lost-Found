import React from 'react';
import { Bell, X } from 'lucide-react';
import { User as UserType } from '../../types';

interface ProfileNotificationsProps {
  notifications: UserType['notifications'];
  onRemoveNotification: (notificationId: string) => void;
}

export const ProfileNotifications: React.FC<ProfileNotificationsProps> = ({
  notifications,
  onRemoveNotification
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="bg-white dark:bg-[#2b2b2b] rounded-[32px] shadow-xl border border-slate-100 dark:border-[#4b5563] overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-[#4b5563] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Bell size={20} />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Notifications</h2>
        </div>
        <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">
          {unreadCount} New
        </span>
      </div>
      <div className="p-6 space-y-4 max-h-[520px] overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map(notif => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border ${
                notif.read
                  ? 'bg-slate-50 dark:bg-[#1f1f1f] border-slate-100 dark:border-[#4b5563]'
                  : 'bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'
              } transition-colors`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1">{notif.text}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {new Date(notif.date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveNotification(notif.id)}
                  className="text-slate-400 hover:text-red-500"
                >
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
  );
};
