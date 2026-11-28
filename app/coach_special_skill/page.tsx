"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, RefreshCw } from "lucide-react";
import InterestModal from "@/app/components/interest/page";
import Modal from "@/app/components/modal/page";
import { useAuth } from "@/app/lib/auth";
import { roleTheme } from "@/app/lib/theme";
import { formatDate, formatDayString } from "@/app/lib/utils";
import { api, CoachSpecial, isSuccess } from "@/app/lib/api";

type Notice = { type: "success" | "error"; message: string } | null;

export default function CoachSpecialSkillPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [items, setItems] = useState<CoachSpecial[]>([]);
  const [target, setTarget] = useState<CoachSpecial | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "coach") {
      router.replace("/coach_login");
      return;
    }

    let cancelled = false;

    api.special_coach(user.username).then((res) => {
      if (cancelled) return;
      if (isSuccess(res)) setItems(res.data ?? []);
      else setNotice({ type: "error", message: res.message });
    });

    const onFocus = () => setTick((t) => t + 1);
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, [ready, user, router, tick]);

  async function saveInterest(data: { date: string; time: string }) {
    if (!user || !target) return;

    setSaving(true);
    const res = await api.special_interest({
      username: user.username,
      request_uuid: target.uuid,
      ...data,
    });
    setSaving(false);

    if (isSuccess(res)) setTarget(null);
    setNotice({ type: isSuccess(res) ? "success" : "error", message: res.message });
    if (isSuccess(res)) setTick((t) => t + 1);
  }

  if (!ready || !user || user.role !== "coach") {
    return <p className="mt-24 text-center text-gray-400">Loading...</p>;
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-3xl px-4 pb-16">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Special skill</h1>
          <p className="mt-1 text-sm text-gray-400">
            Learners asked for these skills. Choose a date and time if you can take the exam.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setTick((t) => t + 1)}
          className="flex items-center gap-1 rounded border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center text-gray-400">
          No special skill is looking for a coach right now
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((r) => (
            <li key={r.uuid} className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">{r.skill_name}</h2>
                  <p className="text-sm text-gray-400">Category: {r.category}</p>
                </div>
                <span className="rounded-full bg-blue-900/50 px-3 py-1 text-xs text-blue-300">
                  Finding a coach
                </span>
              </div>

              {r.description && <p className="mt-3 text-sm text-gray-300">{r.description}</p>}

              <p className="mt-3 text-xs text-gray-500">
                requested {formatDate(r.create_date)} · {r.interest_count} coach
                {r.interest_count === 1 ? "" : "es"} interested
              </p>

              <div className="mt-4 flex justify-end">
                {r.interested ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-900/60 px-4 py-1.5 text-sm text-emerald-300">
                    <CalendarCheck size={14} />
                    Interested · {formatDayString(r.interest_date)} {r.interest_time}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setTarget(r)}
                    className={`inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-sm font-medium text-white transition hover:brightness-110 ${roleTheme.coach.solid}`}
                  >
                    <CalendarCheck size={14} />
                    Interested to exam
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {target && (
        <InterestModal
          key={target.uuid}
          skill={target.skill_name}
          loading={saving}
          onSubmit={saveInterest}
          onCancel={() => setTarget(null)}
        />
      )}

      <Modal
        open={!!notice}
        type={notice?.type ?? "error"}
        message={notice?.message ?? ""}
        onClose={() => setNotice(null)}
      />
    </div>
  );
}