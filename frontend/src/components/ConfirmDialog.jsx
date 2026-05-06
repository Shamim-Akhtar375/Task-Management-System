import React from 'react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmDanger = false }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-surface border border-borderGlass rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-textMuted mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className={confirmDanger ? "btn-danger" : "btn-primary"}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
