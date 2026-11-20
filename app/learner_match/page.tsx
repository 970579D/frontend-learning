"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, RefreshCw, UserRound } from "lucide-react";
import Modal from "@/app/components/modal/page";
import PhoneButton from "@/app/components/phone_button/page";
import { useAuth } from "@/app/lib/auth";
import { labelOf } from "@/app/lib/requirement";
import { roleTheme } from "@/app/lib/theme";
import { api, imageUrl, isSuccess, LearnerMatch, MatchCoach } from "@/app/lib/api";

type Notice = { type: "success" | "error"; message: string } | null;

const fmt = (iso: string) => new Date(iso).toLocaleDateString();

function CoachCard({ coach, rank, learner }: { coach: MatchCoach; rank: number; learner: string }) {
  const photo = imageUrl(coach.image_path);
  const hasDetail = coach.about_coach !== null;

  return (
    <li className="py-5">
      <div className="flex items-center gap-3">
        <span className="w-6 text-right text-sm text-gray-500">{rank}.</span>

        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full text-white ${roleTheme.coach.solid}`}
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" className="h-full w-full object-cover" />
          ) : (
            <UserRound size={20} />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white">
            {coach.firstname} {coach.lastname}
          </p>
          <p className="truncate text-xs text-gray-500">
            {coach.username} · {coach.total_attempt} attempt{coach.total_attempt === 1 ? "" : "s"}
          </p>
        </div>

        <div className="text-right">
          <p className="flex items-center justify-end gap-1 text-sm text-emerald-300">
            <BadgeCheck size={14} />
            {coach.best_score}/{coach.best_total_score}
          </p>
          <p className="text-xs text-gray-500">{coach.best_percent}%</p>
        </div>
      </div>

      {hasDetail ? (
        <div className="mt-3 pl-9">
          <p className="text-sm text-gray-300">{coach.about_coach}</p>

          {coach.course_description && (
            <div className="mt-3">
              <p className="text-xs text-gray-500">Course</p>
              <p className="text-sm text-gray-300">{coach.course_description}</p>
            </div>
          )}

          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-gray-500">Cost</dt>
              <dd className="text-gray-100">
                {coach.cost !== null ? `${coach.cost.toLocaleString()} THB per hour` : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Place</dt>
              <dd className="text-gray-100">
                {coach.place_to_coach ? labelOf("place_to_learn", coach.place_to_coach) : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Mode</dt>
              <dd className="text-gray-100">
                {coach.coaching_mode ? labelOf("learning_mode", coach.coaching_mode) : "-"}
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        <p className="mt-3 pl-9 text-xs text-gray-600">This coach has not added details yet</p>
      )}

      <div className="mt-4 flex justify-end">
        <PhoneButton load={() => api.request_coach_phone(learner, coach.username)} />
      </div>
    </li>
  );
}

export default function LearnerMatchPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [items, setItems] = useState<LearnerMatch[]>([]);
  const [notice, setNotice] = useState<Notice>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "learner") {
      router.replace("/learner_login");
      return;
    }

    let cancelled = false;

    api.request_match_learner(user.username).then((res) => {
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

  if (!ready || !user || user.role !== "learner") {
    return <p className="mt-24 text-center text-gray-400">Loading...</p>;
  }

  const username = user.username;

  return (
    <div className="mx-auto mt-10 w-full max-w-3xl px-4 pb-16">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Match</h1>
          <p className="mt-1 text-sm text-gray-400">Coaches who passed the skills you requested</p>
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
          You have not requested a skill yet.{" "}
          <Link href="/learner_skill" className="text-blue-400 hover:underline">
            Choose a skill
          </Link>
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((r) => (
            <section key={r.uuid} className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-white">{r.skill}</h2>
                <span className="text-xs text-gray-500">requested {fmt(r.create_date)}</span>
              </div>

              {r.description && <p className="mt-2 text-sm text-gray-400">{r.description}</p>}

              {r.coaches.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">
                  No coach has passed this skill yet. Check again later.
                </p>
              ) : (
                <ul className="mt-2 divide-y divide-gray-800">
                  {r.coaches.map((c, i) => (
                    <CoachCard key={c.username} coach={c} rank={i + 1} learner={username} />
                  ))}
                </ul>
              )}
            </section>
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