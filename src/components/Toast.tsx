import React, { useEffect } from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type?: 'success' | 'info';
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="flex items-center gap-2.5 px-4 py-3 bg-[#1C1917] text-white rounded-xl shadow-xl border border-stone-800 text-xs font-medium">
        {toast.type === 'info' ? (
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        )}
        <span>{toast.message}</span>
        <button
          onClick={onDismiss}
          className="ml-2 text-stone-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
