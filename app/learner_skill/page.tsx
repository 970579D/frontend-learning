"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Clock, Lightbulb } from "lucide-react";
import ConfirmModal from "@/app/components/confirm/page";
import Modal from "@/app/components/modal/page";
import SpecialRequestModal, { SpecialRequestForm } from "@/app/components/special_request/page";
import { useAuth } from "@/app/lib/auth";
import { roleTheme } from "@/app/lib/theme";
import {
  api, CategoryData, isSuccess, LearnerRequest, SkillData, SpecialRequest,
} from "@/app/lib/api";

type Notice = { type: "success" | "error"; message: string } | null;

const fmt = (iso: string) => new Date(iso).toLocaleDateString();

const specialCls = {
  waiting: "bg-amber-900/50 text-amber-300",
  finding_coach: "bg-blue-900/50 text-blue-300",
  approved: "bg-emerald-900/60 text-emerald-300",
  rejected: "bg-red-900/50 text-red-300",
} as const;

const specialLabel = {
  waiting: "Waiting for admin",
  finding_coach: "Finding a coach",
  approved: "Approved",
  rejected: "Rejected",
} as const;

export default function LearnerSkillPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [requests, setRequests] = useState<LearnerRequest[]>([]);
  const [special, setSpecial] = useState<SpecialRequest[]>([]);
  const [target, setTarget] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);
  const [specialOpen, setSpecialOpen] = useState(false);
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
      api.special_mine(user.username),
    ]).then(([c, s, r, sp]) => {
      if (cancelled) return;
      if (isSuccess(c)) setCategories(c.data ?? []);
      if (isSuccess(s)) setSkills(s.data ?? []);
      if (isSuccess(r)) setRequests(r.data ?? []);
      else setNotice({ type: "error", message: r.message });
      if (isSuccess(sp)) setSpecial(sp.data ?? []);
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

  async function sendSpecial(data: SpecialRequestForm) {
    if (!user) return;

    setSending(true);
    const res = await api.special_create({ username: user.username, ...data });
    setSending(false);

    if (isSuccess(res)) setSpecialOpen(false);
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
        Choose a skill you want to learn. Coaches who passed it are listed on your Match page.
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

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-400">
                Can&apos;t find the skill you want to learn? You can request a special skill.
              </p>
              <button
                type="button"
                onClick={() => setSpecialOpen(true)}
                className={`inline-flex items-center gap-1.5 rounded px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 ${roleTheme.learner.solid}`}
              >
                <Lightbulb size={16} />
                Request a special skill
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">My requests</h2>
              {requests.length > 0 && (
                <Link href="/learner_match" className="text-sm text-blue-400 hover:underline">
                  View matching coaches →
                </Link>
              )}
            </div>

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
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-900/50 px-3 py-1 text-xs text-amber-300">
                        <Clock size={12} />
                        Requested
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{fmt(r.create_date)}</p>
                    {r.description && <p className="mt-2 text-sm text-gray-400">{r.description}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {special.length > 0 && (
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <h2 className="text-lg font-semibold text-white">My special requests</h2>
              <ul className="mt-2 divide-y divide-gray-800">
                {special.map((s) => (
                  <li key={s.uuid} className="py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-gray-100">{s.skill_name}</p>
                      <span className={`rounded-full px-3 py-1 text-xs ${specialCls[s.status]}`}>
                        {specialLabel[s.status]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {s.category} · {fmt(s.create_date)}
                    </p>
                    {s.description && <p className="mt-2 text-sm text-gray-400">{s.description}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={!!target}
        title={`Learn ${target ?? ""}?`}
        message="Do you want to learn this skill? Matching coaches will be listed on your Match page."
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

      <SpecialRequestModal
        open={specialOpen}
        categories={categories.map((c) => c.category_name)}
        loading={sending}
        onSubmit={sendSpecial}
        onCancel={() => setSpecialOpen(false)}
      />

      <Modal
        open={!!notice}
        type={notice?.type ?? "error"}
        message={notice?.message ?? ""}
        onClose={() => setNotice(null)}
      />
    </div>
  );
}