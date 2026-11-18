"use client";

import { ReactNode, useEffect } from "react";
import { GraduationCap } from "lucide-react";

type ConfirmProps = {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  loading?: boolean;
  children?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  loading = false,
  children,
  onConfirm,
  onCancel,
}: ConfirmProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={() => !loading && onCancel()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <GraduationCap className="mx-auto text-blue-400" size={48} strokeWidth={1.5} />

        <h2 className="mt-4 text-center text-xl font-semibold text-white">{title}</h2>
        {message && <p className="mt-2 text-center text-sm text-gray-300">{message}</p>}

        {children && <div className="mt-4">{children}</div>}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="w-full rounded border border-gray-700 p-2 font-medium text-gray-300 hover:bg-gray-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="w-full rounded bg-blue-600 p-2 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Sending..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}