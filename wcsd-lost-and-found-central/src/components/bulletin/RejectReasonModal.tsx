import React from 'react';
import { X } from 'lucide-react';

interface RejectReasonModalProps {
  title: string;
  description: string;
  textareaId: string;
  value: string;
  hasError: boolean;
  errorMessage: string;
  confirmLabel: string;
  onValueChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  zIndexClass: string;
}

export const RejectReasonModal: React.FC<RejectReasonModalProps> = ({
  title,
  description,
  textareaId,
  value,
  hasError,
  errorMessage,
  confirmLabel,
  onValueChange,
  onClose,
  onConfirm,
  zIndexClass
}) => (
  <div className={`fixed inset-0 ${zIndexClass} flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm`}>
    <div className="bg-white dark:bg-[#2b2b2b] rounded-[25px] p-8 w-full max-w-lg shadow-2xl relative border border-slate-200 dark:border-[#4b5563]">
      <button onClick={onClose} className="absolute top-5 right-5 text-slate-300 dark:text-white"><X size={22} /></button>
      <h3 className="text-2xl font-bold text-center mb-2 text-slate-900 dark:text-white">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-white text-center mb-6">{description}</p>
      <label htmlFor={textareaId} className="sr-only">Enter rejection reason</label>
      <textarea
        id={textareaId}
        value={value}
        onChange={e => onValueChange(e.target.value)}
        rows={4}
        className={`w-full p-3.5 bg-[#f4f6f8] dark:bg-[#1f1f1f] border rounded-[12px] text-slate-900 dark:text-white ${hasError ? 'border-red-400' : 'border-slate-200 dark:border-[#4b5563]'}`}
        placeholder="Enter rejection reason"
      />
      {hasError && <p className="text-red-500 text-xs font-bold mt-2">{errorMessage}</p>}
      <div className="flex gap-3 mt-5">
        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-[14px] font-bold text-slate-600 dark:text-white bg-slate-100 dark:bg-[#1f1f1f]">Cancel</button>
        <button type="button" onClick={onConfirm} className="flex-1 py-3 rounded-[14px] font-bold text-white bg-red-500">{confirmLabel}</button>
      </div>
    </div>
  </div>
);
