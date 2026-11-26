"use client";

import { FormEvent, useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";

export const OTHER_CATEGORY = "Other";

export type SpecialRequestForm = {
  skill_name: string;
  category: string;
  description: string;
};

type SpecialRequestModalProps = {
  open: boolean;
  categories: string[];
  loading?: boolean;
  onSubmit: (data: SpecialRequestForm) => void | Promise<void>;
  onCancel: () => void;
};

const fieldClass =
  "w-full rounded border border-gray-700 bg-gray-800 p-2 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-blue-500";

const EMPTY: SpecialRequestForm = { skill_name: "", category: "", description: "" };

export default function SpecialRequestModal({
  open,
  categories,
  loading = false,
  onSubmit,
  onCancel,
}: SpecialRequestModalProps) {
  const [form, setForm] = useState<SpecialRequestForm>(EMPTY);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      skill_name: form.skill_name.trim(),
      category: form.category,
      description: form.description.trim(),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={() => !loading && onCancel()}
    >
      <form
        role="dialog"
        aria-modal="true"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-xl shadow-black/50"
      >
        <Lightbulb className="mx-auto text-blue-400" size={44} strokeWidth={1.5} />
        <h2 className="mt-3 text-center text-xl font-semibold text-white">Request a special skill</h2>
        <p className="mt-1 text-center text-sm text-gray-400">
          The admin will review your request.
        </p>

        <div className="mt-5 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-gray-400">
            Skill to learn
            <input
              className={fieldClass}
              value={form.skill_name}
              maxLength={100}
              placeholder="e.g. Photography"
              onChange={(e) => setForm({ ...form, skill_name: e.target.value })}
              autoFocus
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-400">
            Category
            <select
              className={fieldClass}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              <option value="">Choose a category</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value={OTHER_CATEGORY}>{OTHER_CATEGORY}</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-400">
            Description
            <textarea
              className={`${fieldClass} resize-none`}
              rows={3}
              value={form.description}
              maxLength={500}
              placeholder="What do you want to learn? (optional)"
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
        </div>

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
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 p-2 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send request"}
          </button>
        </div>
      </form>
    </div>
  );
}