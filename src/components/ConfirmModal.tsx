"use client";

import { X } from "lucide-react";

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ message, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[var(--bgcard)] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex justify-end">
          <button onClick={onCancel} className="text-[var(--subText)] hover:text-[var(--text)]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-[var(--text)] font-semibold mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-full font-semibold
              bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white
              hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-full font-semibold
              bg-gradient-to-r from-red-500 to-red-700 text-white
              hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
