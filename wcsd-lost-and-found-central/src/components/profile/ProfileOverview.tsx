import React from 'react';
import { ExternalLink } from 'lucide-react';

export const ProfileOverview: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#2b2b2b] rounded-[32px] p-8 shadow-xl border border-slate-100 dark:border-[#4b5563]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#1f1f1f] text-slate-600 dark:text-white flex items-center justify-center">
          <ExternalLink size={20} />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Policy Pages</h2>
      </div>
      <div className="space-y-3">
        <a
          href="/privacypolicy.html"
          className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-[#4b5563] px-4 py-3 text-sm font-semibold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-[#f3f4f6]/10 transition-colors"
        >
          <span>Privacy Policy</span>
          <ExternalLink size={16} />
        </a>
        <a
          href="/termsofservice.html"
          className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-[#4b5563] px-4 py-3 text-sm font-semibold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-[#f3f4f6]/10 transition-colors"
        >
          <span>Terms of Use</span>
          <ExternalLink size={16} />
        </a>
        <a
          href="/accessibility.html"
          className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-[#4b5563] px-4 py-3 text-sm font-semibold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-[#f3f4f6]/10 transition-colors"
        >
          <span>Accessibility</span>
          <ExternalLink size={16} />
        </a>
      </div>
    </div>
  );
};
