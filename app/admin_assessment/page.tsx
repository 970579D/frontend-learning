"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/app/components/modal/page";
import { useAuth } from "@/app/lib/auth";
import { api, ExamAssessment, isSuccess } from "@/app/lib/api";

const fmt = (iso: string) => new Date(iso).toLocaleString();

type Notice = { type: "success" | "error"; message: string } | null;

export default function AdminAssessmentPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [items, setItems] = useState<ExamAssessment[]>([]);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<Notice>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "admin") {
      router.replace("/admin_login");
      return;
    }

    let cancelled = false;

    api.exam_assessments().then((res) => {
      if (cancelled) return;
      if (isSuccess(res)) setItems(res.data ?? []);
      else setNotice({ type: "error", message: res.message });
    });

    return () => {
      cancelled = true;
    };
  }, [ready, user, router, tick]);

  async function saveResult(item: ExamAssessment) {
    const score = Number(scores[item.booking_uuid]);
    if (!Number.isInteger(score) || score < 0 || score > item.total_score) {
      setNotice({ type: "error", message: `Score must be a whole number from 0 to ${item.total_score}` });
      return;
    }

    const res = await api.exam_result(item.booking_uuid, score);
    if (!isSuccess(res)) {
      setNotice({ type: "error", message: res.message });
      return;
    }

    setNotice({
      type: "success",
      message: `${res.message}: attempt ${res.data?.round_attempt}, ${res.data?.score}/${res.data?.total_score} (${res.data?.status})`,
    });
    setTick((t) => t + 1);
  }

  if (!ready || !user || user.role !== "admin") {
    return <p className="mt-24 text-center text-gray-400">Loading...</p>;
  }

  const waiting = items.filter((i) => !i.assessed);
  const done = items.filter((i) => i.assessed);

  return (
    <div className="mx-auto mt-10 w-full max-w-4xl px-4 pb-16">
      <h1 className="mb-6 text-2xl font-semibold text-white">Assessment</h1>

      <h2 className="mb-3 text-sm text-gray-400">Waiting for assessment</h2>
      {waiting.length === 0 ? (
        <p className="mb-8 rounded-2xl border border-gray-800 bg-gray-900 p-6 text-center text-gray-500">
          No coaches are waiting for a result
        </p>
      ) : (
        <ul className="mb-8 flex flex-col gap-3">
          {waiting.map((i) => (
            <li
              key={i.booking_uuid}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-800 bg-gray-900 p-4"
            >
              <div>
                <p className="font-semibold text-white">{i.username}</p>
                <p className="text-sm text-gray-400">
                  {i.skill} · {fmt(i.exam_time)} · total {i.total_score}, pass at {i.pass_score}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={i.total_score}
                  placeholder={`0-${i.total_score}`}
                  value={scores[i.booking_uuid] ?? ""}
                  onChange={(e) => setScores({ ...scores, [i.booking_uuid]: e.target.value })}
                  className="w-24 rounded border border-gray-700 bg-gray-800 p-1.5 text-sm text-gray-100"
                />
                <button
                  type="button"
                  onClick={() => saveResult(i)}
                  className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-500"
                >
                  Save result
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mb-3 text-sm text-gray-400">Assessed</h2>
      {done.length === 0 ? (
        <p className="rounded-2xl border border-gray-800 bg-gray-900 p-6 text-center text-gray-500">
          No results saved yet
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {done.map((i) => (
            <li
              key={i.booking_uuid}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-800 bg-gray-900 p-4"
            >
              <div>
                <p className="font-semibold text-white">{i.username}</p>
                <p className="text-sm text-gray-400">
                  {i.skill} · {fmt(i.exam_time)}
                </p>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-400">
                  Attempt {i.round_attempt} · {i.score}/{i.total_score}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    i.result === "pass"
                      ? "bg-emerald-900/60 text-emerald-300"
                      : "bg-red-900/50 text-red-300"
                  }`}
                >
                  {i.result === "pass" ? "Passed" : "Not passed"}
                </span>
              </div>
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