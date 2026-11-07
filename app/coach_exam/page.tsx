"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import Modal from "@/app/components/modal/page";
import { useAuth } from "@/app/lib/auth";
import { api, ExamBooking, ExamSession, isSuccess } from "@/app/lib/api";

const fmt = (iso: string) => new Date(iso).toLocaleString();

type Notice = { type: "success" | "error"; message: string } | null;

async function fetchAll(username: string) {
  const [o, m] = await Promise.all([api.exam_open(username), api.exam_my_bookings(username)]);
  return { o, m };
}

export default function CoachExamPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [open, setOpen] = useState<ExamSession[]>([]);
  const [mine, setMine] = useState<ExamBooking[]>([]);
  const [notice, setNotice] = useState<Notice>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "coach") {
      router.replace("/coach_login");
      return;
    }

    let cancelled = false;

    fetchAll(user.username).then(({ o, m }) => {
      if (cancelled) return;
      if (isSuccess(o)) setOpen(o.data ?? []);
      else setNotice({ type: "error", message: o.message });
      if (isSuccess(m)) setMine(m.data ?? []);
      else setNotice({ type: "error", message: m.message });
    });

    const onFocus = () => setTick((t) => t + 1);
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, [ready, user, router, tick]);

  async function book(sessionUuid: string) {
    if (!user) return;
    const res = await api.exam_book(user.username, sessionUuid);
    setNotice({ type: isSuccess(res) ? "success" : "error", message: res.message });
    if (isSuccess(res)) setTick((t) => t + 1);
  }

  async function checkIn(bookingUuid: string) {
    if (!user) return;
    const res = await api.exam_check_in(user.username, bookingUuid);
    setNotice({ type: isSuccess(res) ? "success" : "error", message: res.message });
    if (isSuccess(res)) setTick((t) => t + 1);
  }

  if (!ready || !user || user.role !== "coach") {
    return <p className="mt-24 text-center text-gray-400">Loading...</p>;
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-3xl px-4 pb-16">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Exams</h1>
        <button
          type="button"
          onClick={() => setTick((t) => t + 1)}
          className="flex items-center gap-1 rounded border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <h2 className="mb-3 text-sm text-gray-400">My bookings</h2>
      {mine.length === 0 ? (
        <p className="mb-8 rounded-2xl border border-gray-800 bg-gray-900 p-6 text-center text-gray-500">
          You have not booked an exam yet
        </p>
      ) : (
        <ul className="mb-8 flex flex-col gap-3">
          {mine.map((b) => (
            <li
              key={b.uuid}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-800 bg-gray-900 p-4"
            >
              <div>
                <p className="font-semibold text-white">{b.skill}</p>
                <p className="text-sm text-gray-400">{fmt(b.exam_time)}</p>
              </div>

              {b.verified ? (
                <span className="rounded-full bg-emerald-900/60 px-3 py-1 text-xs text-emerald-300">Verified</span>
              ) : b.checked_in ? (
                <span className="rounded-full bg-amber-900/50 px-3 py-1 text-xs text-amber-300">
                  Waiting for admin
                </span>
              ) : b.session_status === "finished" ? (
                <span className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-400">Finished</span>
              ) : (
                <button
                  type="button"
                  onClick={() => checkIn(b.uuid)}
                  className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-500"
                >
                  Check in
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <h2 className="mb-3 text-sm text-gray-400">Open exam sessions</h2>
      {open.length === 0 ? (
        <p className="rounded-2xl border border-gray-800 bg-gray-900 p-6 text-center text-gray-500">
          No open sessions
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {open.map((s) => (
            <li
              key={s.uuid}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-800 bg-gray-900 p-4"
            >
              <div>
                <p className="font-semibold text-white">{s.skill}</p>
                <p className="text-sm text-gray-400">{fmt(s.exam_time)}</p>
              </div>
              {s.passed ? (
                <span className="rounded-full bg-emerald-900/60 px-3 py-1 text-xs text-emerald-300">Passed</span>
              ) : (
                <button
                  type="button"
                  disabled={s.booked}
                  onClick={() => book(s.uuid)}
                  className="rounded bg-emerald-600 px-4 py-1.5 text-sm text-white hover:bg-emerald-500 disabled:opacity-40"
                >
                  {s.booked ? "Booked" : "Book"}
                </button>
              )}
            </li>
          ))}
        </ul>
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