"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, UserRound } from "lucide-react";
import ConfirmModal from "@/app/components/confirm/page";
import Modal from "@/app/components/modal/page";
import { useAuth } from "@/app/lib/auth";
import { roleTheme } from "@/app/lib/theme";
import { api, CategoryData, imageUrl, isSuccess, LearnerRequest, SkillData } from "@/app/lib/api";

type Notice = { type: "success" | "error"; message: string } | null;

const fmt = (iso: string) => new Date(iso).toLocaleDateString();

export default function LearnerSkillPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [requests, setRequests] = useState<LearnerRequest[]>([]);
  const [target, setTarget] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "learner") {
      router.replace("/learner_login");
      return;
    }

    let cancelled = false;

    Promise.all([
      api.catalog_categories(),
      api.catalog_skills(),
      api.request_mine(user.username),
    ]).then(([c, s, r]) => {
      if (cancelled) return;
      if (isSuccess(c)) setCategories(c.data ?? []);
      if (isSuccess(s)) setSkills(s.data ?? []);
      if (isSuccess(r)) setRequests(r.data ?? []);
      else setNotice({ type: "error", message: r.message });
    });

    return () => {
      cancelled = true;
    };
  }, [ready, user, router, tick]);

  function closeConfirm() {
    setTarget(null);
    setDescription("");
  }

  async function confirm() {
    if (!user || !target) return;

    setSending(true);
    const res = await api.request_create(user.username, target, description.trim());
    setSending(false);

    closeConfirm();
    setNotice({ type: isSuccess(res) ? "success" : "error", message: res.message });
    if (isSuccess(res)) setTick((t) => t + 1);
  }

  if (!ready || !user || user.role !== "learner") {
    return <p className="mt-24 text-center text-gray-400">Loading...</p>;
  }

  const requested = new Set(requests.map((r) => r.skill));

  const groups = categories
    .map((c) => ({ category: c, items: skills.filter((s) => s.category_name === c.category_name) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto mt-10 w-full max-w-5xl px-4 pb-16">
      <h1 className="text-2xl font-semibold text-white">Learn a skill</h1>
      <p className="mb-6 mt-1 text-sm text-gray-400">
        Choose a skill you want to learn. Coaches who passed it will see your request and can respond.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          {groups.length === 0 ? (
            <p className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center text-gray-400">
              No skills yet
            </p>
          ) : (
            groups.map(({ category, items }) => (
              <div key={category.id} className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
                <h2 className="text-lg font-semibold text-white">{category.category_name}</h2>
                <div className="mt-4 flex flex-wrap gap-2 px-1">
                  {items.map((s) => {
                    const done = requested.has(s.skill_name);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        disabled={done}
                        onClick={() => setTarget(s.skill_name)}
                        title={done ? "Already requested" : "Request a coach for this skill"}
                        className={`inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-sm transition ${
                          done
                            ? "bg-emerald-900/40 text-emerald-300"
                            : "bg-gray-800/60 text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                        }`}
                      >
                        {done && <Check size={14} />}
                        {s.skill_name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
            <h2 className="text-lg font-semibold text-white">My requests</h2>

            {requests.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                You have not requested a skill yet
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-gray-800">
                {requests.map((r) => (
                  <li key={r.uuid} className="py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-gray-100">{r.skill}</p>
                      {r.responses.length === 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-900/50 px-3 py-1 text-xs text-amber-300">
                          <Clock size={12} />
                          Waiting for coach response
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-900/60 px-3 py-1 text-xs text-emerald-300">
                          {r.responses.length} coach{r.responses.length === 1 ? "" : "es"} responded
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500">{fmt(r.create_date)}</p>
                    {r.description && <p className="mt-2 text-sm text-gray-400">{r.description}</p>}

                    {r.responses.length > 0 && (
                      <ul className="mt-3 flex flex-col gap-2">
                        {r.responses.map((c) => {
                          const photo = imageUrl(c.image_path);
                          return (
                            <li
                              key={c.uuid}
                              className="flex items-center gap-3 rounded-lg bg-gray-800/50 p-2.5"
                            >
                              <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-white ${roleTheme.coach.solid}`}
                              >
                                {photo ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={photo} alt="" className="h-full w-full object-cover" />
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
                              <span className="text-xs text-gray-500">{fmt(c.create_date)}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!target}
        title={`Learn ${target ?? ""}?`}
        message="Do you want to learn this skill? Coaches who passed it will see your request and can respond."
        confirmLabel="Yes, request a coach"
        loading={sending}
        onConfirm={confirm}
        onCancel={closeConfirm}
      >
        <textarea
          value={description}
          maxLength={500}
          rows={3}
          placeholder="Tell the coach what you want to learn (optional)"
          onChange={(e) => setDescription(e.target.value)}
          className="w-full resize-none rounded border border-gray-700 bg-gray-800 p-2 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-blue-500"
        />
      </ConfirmModal>

      <Modal
        open={!!notice}
        type={notice?.type ?? "error"}
        message={notice?.message ?? ""}
        onClose={() => setNotice(null)}
      />
    </div>
  );
}