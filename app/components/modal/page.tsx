"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

type ModalProps = {
  open: boolean;
  type: "success" | "error";
  message: string;
  onClose: () => void;
};

export default function Modal({ open, type, message, onClose }: ModalProps) {
  // close with the Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isSuccess = type === "success";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900 p-6 text-center shadow-xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}   // clicking inside must not close it
      >
        {isSuccess ? (
          <CheckCircle2 className="mx-auto text-emerald-400" size={56} strokeWidth={1.5} />
        ) : (
          <XCircle className="mx-auto text-red-400" size={56} strokeWidth={1.5} />
        )}

        <h2 className="mt-4 text-xl font-semibold text-white">
          {isSuccess ? "Success" : "Error"}
        </h2>
        <p className="mt-2 text-sm text-gray-300">{message}</p>

        <button
          autoFocus
          onClick={onClose}
          className={`mt-6 w-full rounded p-2 font-medium text-white ${
            isSuccess ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500"
          }`}
        >
          {isSuccess ? "Continue" : "Close"}
        </button>
      </div>
    </div>
  );
}