"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Search, UserRound } from "lucide-react";
import Modal from "@/app/components/modal/page";
import { useAuth } from "@/app/lib/auth";
import { roleTheme } from "@/app/lib/theme";
import { formatDateTime, formatDayString } from "@/app/lib/utils";
import { AdminSpecialRequest, api, imageUrl, isSuccess, SpecialStatus } from "@/app/lib/api";

type Notice = { type: "success" | "error"; message: string } | null;

const statusCls: Record<SpecialStatus, string> = {
  waiting: "bg-amber-900/50 text-amber-300",
  finding_coach: "bg-blue-900/50 text-blue-300",
  approved: "bg-emerald-900/60 text-emerald-300",
  rejected: "bg-red-900/50 text-red-300",
};

const statusLabel: Record<SpecialStatus, string> = {
  waiting: "waiting",
  finding_coach: "Finding a coach",
  approved: "approved",
  rejected: "rejected",
};

export default function AdminRequestedSkillPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [items, setItems] = useState<AdminSpecialRequest[]>([]);
  const [notice, setNotice] = useState<Notice>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "admin") {
      router.replace("/admin_login");
      return;
    }

    let cancelled = false;

    api.special_all().then((res) => {
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

  async function findCoach(uuid: string) {
    const res = await api.special_finding(uuid);
    if (!isSuccess(res)) {
      setNotice({ type: "error", message: res.message });
      return;
    }
    setTick((t) => t + 1);
  }

  if (!ready || !user || user.role !== "admin") {
    return <p className="mt-24 text-center text-gray-400">Loading...</p>;
  }

  const waiting = items.filter((i) => i.status === "waiting").length;

  return (
    <div className="mx-auto mt-10 w-full max-w-3xl px-4 pb-16">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Requested skills</h1>
          <p className="mt-1 text-sm text-gray-400">
            Skills learners asked for that are not in the list yet · {waiting} waiting
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
          No special skill requests yet
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((r) => {
            const photo = imageUrl(r.image_path);

            return (
              <li key={r.uuid} className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{r.skill_name}</h2>
                    <p className="text-sm text-gray-400">Category: {r.category}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs ${statusCls[r.status]}`}>
                    {statusLabel[r.status]}
                  </span>
                </div>

                {r.description && <p className="mt-3 text-sm text-gray-300">{r.description}</p>}

                <div className="mt-4 flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-white ${roleTheme.learner.solid}`}
                  >
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <UserRound size={16} />
                    )}
                  </span>
                  <div>
                    <p className="text-sm text-gray-100">
                      {r.firstname} {r.lastname}
                    </p>
                    <p className="text-xs text-gray-500">
                      {r.username} · {formatDateTime(r.create_date)}
                    </p>
                  </div>
                </div>

                {r.status === "waiting" && (
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => findCoach(r.uuid)}
                      className={`inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-sm font-medium text-white transition hover:brightness-110 ${roleTheme.admin.solid}`}
                    >
                      <Search size={14} />
                      Find a coach
                    </button>
                  </div>
                )}

                {(r.status === "finding_coach" || r.interests.length > 0) && (
                  <div className="mt-4 border-t border-gray-800 pt-4">
                    <p className="text-xs text-gray-500">Interested coaches ({r.interests.length})</p>

                    {r.interests.length === 0 ? (
                      <p className="mt-2 text-sm text-gray-600">No coach has shown interest yet</p>
                    ) : (
                      <ul className="mt-2 flex flex-col gap-2">
                        {r.interests.map((c) => {
                          const coachPhoto = imageUrl(c.image_path);
                          return (
                            <li
                              key={c.username}
                              className="flex items-center gap-3 rounded-lg bg-gray-800/50 p-2.5"
                            >
                              <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-white ${roleTheme.coach.solid}`}
                              >
                                {coachPhoto ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={coachPhoto} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <UserRound size={16} />
                                )}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm text-gray-100">
                                  {c.firstname} {c.lastname}
                                </p>
                                <p className="truncate text-xs text-gray-500">{c.username}</p>
                              </div>
                              <p className="text-sm text-gray-300">
                                {formatDayString(c.date)} {c.time}
                              </p>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
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