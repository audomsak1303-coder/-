import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-5">
          <div className="flex items-start gap-3.5">
            <div className={`p-2.5 rounded-xl shrink-0 ${
              confirmVariant === 'danger' 
                ? 'bg-rose-50 text-rose-600' 
                : 'bg-orange-50 text-orange-600'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-zinc-900">{title}</h3>
              <p className="mt-1.5 text-xs text-zinc-600 leading-relaxed">{message}</p>
            </div>
            <button
              onClick={onCancel}
              className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-5 py-3.5 bg-zinc-50 flex items-center justify-end gap-2.5 border-t border-zinc-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 text-xs font-semibold text-zinc-600 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition shadow-2xs cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => onConfirm()}
            className={`px-4 py-1.5 text-xs font-semibold text-white rounded-xl transition shadow-xs cursor-pointer ${
              confirmVariant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                : 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700 shadow-orange-500/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
