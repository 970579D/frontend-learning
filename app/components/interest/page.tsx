"use client";

import { FormEvent, useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import { TIME_SLOTS, todayString } from "@/app/lib/utils";

type InterestModalProps = {
  skill: string;
  loading?: boolean;
  onSubmit: (data: { date: string; time: string }) => void | Promise<void>;
  onCancel: () => void;
};

const fieldClass =
  "w-full rounded border border-gray-700 bg-gray-800 p-2 text-sm text-gray-100 outline-none focus:border-blue-500";

export default function InterestModal({ skill, loading = false, onSubmit, onCancel }: InterestModalProps) {
  const [min] = useState(todayString);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loading, onCancel]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({ date, time });
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
        <CalendarClock className="mx-auto text-blue-400" size={44} strokeWidth={1.5} />
        <h2 className="mt-3 text-center text-xl font-semibold text-white">Interested to exam?</h2>
        <p className="mt-1 text-center text-sm text-gray-400">
          Choose the date and time you can take the exam for {skill}.
        </p>

        <div className="mt-5 flex gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm text-gray-400">
            Date
            <input
              type="date"
              min={min}
              className={fieldClass}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>

          <label className="flex w-28 flex-col gap-1 text-sm text-gray-400">
            Time
            <select
              className={fieldClass}
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            >
              <option value="">Select</option>
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
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
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}