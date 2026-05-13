import React from 'react';

const FlipperDigits: React.FC<{ value: number; accentClass: string }> = ({ value, accentClass }) => {
  const digits = String(Math.max(0, value)).padStart(2, '0').split('');

  return (
    <div className="flex items-center justify-center gap-1.5">
      {digits.map((digit, index) => (
        <div
          key={`${digit}-${index}`}
          className="relative w-11 h-14 rounded-[14px] overflow-hidden border border-black/10 dark:border-white/10 bg-[#2f2f2f] shadow-[0_10px_20px_rgba(0,0,0,0.16)]"
        >
          <div className={`absolute inset-x-0 top-0 h-1.5 ${accentClass}`} />
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#4e4e4e] to-[#393939]" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-[#2f2f2f] to-[#1f1f1f]" />
          <div className="absolute inset-x-2 top-1/2 h-px -translate-y-1/2 bg-white/15" />
          <div className="absolute inset-0 flex items-center justify-center text-[1.6rem] font-black tracking-tight text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.35)]">
            {digit}
          </div>
        </div>
      ))}
    </div>
  );
};

export const FlipperStat: React.FC<{ label: string; value: number; accentClass: string }> = ({ label, value, accentClass }) => (
  <div className="rounded-[24px] border border-slate-200 dark:border-[#4b5563] bg-slate-50 dark:bg-[#1f1f1f] px-4 py-5 text-center shadow-sm">
    <FlipperDigits value={value} accentClass={accentClass} />
    <p className="mt-3 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-white">
      {label}
    </p>
  </div>
);
