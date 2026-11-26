"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, UserRound } from "lucide-react";
import Modal from "@/app/components/modal/page";
import PhoneButton from "@/app/components/phone_button/page";
import { useAuth } from "@/app/lib/auth";
import { labelOf, RequirementKey } from "@/app/lib/requirement";
import { roleTheme } from "@/app/lib/theme";
import { api, imageUrl, isSuccess, MatchRequest } from "@/app/lib/api";
import { formatDateTime } from "../lib/utils";

type Notice = { type: "success" | "error"; message: string } | null;

const FIELDS: { key: RequirementKey; label: string }[] = [
  { key: "level", label: "Level" },
  { key: "learning_for", label: "Learning for" },
  { key: "day", label: "Days" },
  { key: "time", label: "Time" },
  { key: "priority", label: "Priority" },
  { key: "learning_mode", label: "Mode" },
  { key: "place_to_learn", label: "Place" },
  { key: "province", label: "Province" },
];

export default function CoachMatchPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [items, setItems] = useState<MatchRequest[]>([]);
  const [notice, setNotice] = useState<Notice>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "coach") {
      router.replace("/coach_login");
      return;
    }

    let cancelled = false;

    api.request_match(user.username).then((res) => {
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

  if (!ready || !user || user.role !== "coach") {
    return <p className="mt-24 text-center text-gray-400">Loading...</p>;
  }

  const username = user.username;

  return (
    <div className="mx-auto mt-10 w-full max-w-3xl px-4 pb-16">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Match</h1>
          <p className="mt-1 text-sm text-gray-400">Learners looking for a coach in your skills</p>
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
          No learners are looking for your skills yet
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((r) => {
            const photo = imageUrl(r.learner.image_path);

            return (
              <li key={r.uuid} className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full text-white ${roleTheme.learner.solid}`}
                    >
                      {photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <UserRound size={20} />
                      )}
                    </span>
                    <div>
                      <p className="font-semibold text-white">
                        {r.learner.firstname} {r.learner.lastname}
                      </p>
                      <p className="text-xs text-gray-500">requested {formatDateTime(r.create_date)}</p>
                    </div>
                  </div>

                  <span className="rounded-full bg-blue-900/50 px-3 py-1 text-xs text-blue-300">{r.skill}</span>
                </div>

                {r.description && <p className="mt-3 text-sm text-gray-300">{r.description}</p>}

                {r.requirement ? (
                  <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
                    {FIELDS.map(({ key, label }) => (
                      <div key={key}>
                        <dt className="text-xs text-gray-500">{label}</dt>
                        <dd className="text-gray-100">{labelOf(key, r.requirement![key])}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-4 text-xs text-gray-600">This learner has no requirement answers</p>
                )}

                <div className="mt-4 flex justify-end">
                  <PhoneButton load={() => api.request_learner_phone(username, r.uuid)} />
                </div>
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