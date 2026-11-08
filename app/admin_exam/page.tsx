"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import Modal from "@/app/components/modal/page";
import { useAuth } from "@/app/lib/auth";
import { api, ApiResponse, ExamBooking, ExamSession, isSuccess, SkillData } from "@/app/lib/api";

const inputClass =
  "rounded border border-gray-700 bg-gray-800 p-2 text-gray-100 outline-none focus:border-blue-500";
const fmt = (iso: string) => new Date(iso).toLocaleString();
const statusCls = {
  open: "bg-emerald-900/60 text-emerald-300",
  closed: "bg-gray-800 text-gray-300",
  finished: "bg-blue-900/60 text-blue-300",
} as const;

type Notice = { type: "success" | "error"; message: string } | null;

export default function AdminExamPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [form, setForm] = useState({ skill: "", exam_time: "", total_score: "100" });
  const [openUuid, setOpenUuid] = useState<string | null>(null);
  const [bookings, setBookings] = useState<ExamBooking[]>([]);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "admin") {
      router.replace("/admin_login");
      return;
    }
    Promise.all([api.exam_sessions(), api.catalog_skills()]).then(([s, k]) => {
      if (isSuccess(s)) setSessions(s.data ?? []);
      if (isSuccess(k)) setSkills(k.data ?? []);
    });
  }, [ready, user, router]);

  const showError = (res: ApiResponse<unknown>) =>
    setNotice({ type: "error", message: res.message });

  async function refreshSessions() {
    const res = await api.exam_sessions();
    if (isSuccess(res)) setSessions(res.data ?? []);
  }

  async function loadBookings(uuid: string) {
    const res = await api.exam_session_bookings(uuid);
    setBookings(isSuccess(res) ? res.data ?? [] : []);
  }

  async function createSession(e: FormEvent) {
    e.preventDefault();
    const res = await api.exam_create_session({
      skill: form.skill,
      exam_time: new Date(form.exam_time).toISOString(),
      total_score: Number(form.total_score),
    });
    if (!isSuccess(res)) return showError(res);

    setNotice({ type: "success", message: res.message });
    setForm({ ...form, exam_time: "" });
    await refreshSessions();
  }

  async function toggle(uuid: string) {
    if (openUuid === uuid) {
      setOpenUuid(null);
      return;
    }
    setOpenUuid(uuid);
    setBookings([]);
    await loadBookings(uuid);
  }

  async function changeStatus(uuid: string, status: ExamSession["status"]) {
    const res = await api.exam_set_status(uuid, status);
    if (!isSuccess(res)) return showError(res);
    await refreshSessions();
  }

  async function verify(b: ExamBooking) {
    const res = await api.exam_verify(b.uuid, !b.verified);
    if (!isSuccess(res)) return showError(res);
    await loadBookings(b.session_uuid);
  }

  if (!ready || !user || user.role !== "admin") {
    return <p className="mt-24 text-center text-gray-400">Loading...</p>;
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-4xl px-4 pb-16">
      <h1 className="mb-6 text-2xl font-semibold text-white">Exam sessions</h1>

      <form
        onSubmit={createSession}
        className="mb-8 flex flex-col gap-3 rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:flex-row sm:items-end"
      >
        <label className="flex flex-1 flex-col gap-1 text-sm text-gray-400">
          Skill
          <select
            className={inputClass}
            value={form.skill}
            onChange={(e) => setForm({ ...form, skill: e.target.value })}
            required
          >
            <option value="">Choose a skill</option>
            {skills.map((s) => (
              <option key={s.id} value={s.skill_name}>
                {s.skill_name} ({s.category_name})
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-1 flex-col gap-1 text-sm text-gray-400">
          Exam time
          <input
            type="datetime-local"
            className={inputClass}
            value={form.exam_time}
            onChange={(e) => setForm({ ...form, exam_time: e.target.value })}
            required
          />
        </label>

        <label className="flex w-32 flex-col gap-1 text-sm text-gray-400">
          Total score
          <input
            type="number"
            min={1}
            max={1000}
            className={inputClass}
            value={form.total_score}
            onChange={(e) => setForm({ ...form, total_score: e.target.value })}
            required
          />
        </label>

        <button className="rounded bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-500">
          Create
        </button>
      </form>

      {sessions.length === 0 ? (
        <p className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center text-gray-400">
          No exam sessions yet
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {sessions.map((s) => (
            <div key={s.uuid} className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">{s.skill}</h2>
                  <p className="text-sm text-gray-400">{fmt(s.exam_time)}</p>
                  <p className="text-xs text-gray-500">
                    Total score {s.total_score} · pass at {s.pass_score}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs ${statusCls[s.status]}`}>{s.status}</span>
                  <select
                    value={s.status}
                    onChange={(e) => changeStatus(s.uuid, e.target.value as ExamSession["status"])}
                    className="rounded border border-gray-700 bg-gray-800 p-1 text-xs text-gray-200"
                  >
                    <option value="open">open</option>
                    <option value="closed">closed</option>
                    <option value="finished">finished</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggle(s.uuid)}
                className="mt-3 flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200"
              >
                <ChevronDown size={14} className={openUuid === s.uuid ? "rotate-180" : ""} />
                {s.booking_count} booking{s.booking_count === 1 ? "" : "s"}
              </button>

              {openUuid === s.uuid && (
                <ul className="mt-3 divide-y divide-gray-800 text-sm">
                  {bookings.length === 0 && <li className="py-2 text-gray-500">No bookings</li>}

                  {bookings.map((b) => (
                    <li key={b.uuid} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div>
                        <span className="text-gray-100">{b.username}</span>
                        <span
                          className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                            b.verified
                              ? "bg-emerald-900/60 text-emerald-300"
                              : b.checked_in
                                ? "bg-amber-900/50 text-amber-300"
                                : "bg-gray-800 text-gray-400"
                          }`}
                        >
                          {b.verified ? "Attended" : b.checked_in ? "Checked in" : "Not checked in"}
                        </span>
                        {b.assessed && (
                          <span className="ml-2 rounded-full bg-blue-900/60 px-2 py-0.5 text-xs text-blue-300">
                            Assessed
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={!b.checked_in || b.assessed}
                        onClick={() => verify(b)}
                        className="rounded border border-gray-700 px-3 py-1 text-xs text-gray-200 hover:bg-gray-800 disabled:opacity-40"
                      >
                        {b.verified ? "Unverify" : "Verify"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
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