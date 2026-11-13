"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, UserRound } from "lucide-react";
import Modal from "@/app/components/modal/page";
import { useAuth } from "@/app/lib/auth";
import { roleTheme } from "@/app/lib/theme";
import { api, CategoryData, imageUrl, isSuccess, SkillCoach, SkillData } from "@/app/lib/api";

type Notice = { type: "success" | "error"; message: string } | null;

function CoachRow({ coach, rank }: { coach: SkillCoach; rank: number }) {
  const photo = imageUrl(coach.image_path);
  const passed = coach.status === "pass";

  return (
    <li className="flex items-center gap-3 py-3">
      <span className="w-6 text-right text-sm text-gray-500">{rank}.</span>

      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-white ${roleTheme.coach.solid}`}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="h-full w-full object-cover" />
        ) : (
          <UserRound size={18} />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-100">
          {coach.firstname} {coach.lastname}
        </p>
        <p className="truncate text-xs text-gray-500">
          {coach.username} · {coach.total_attempt} attempt{coach.total_attempt === 1 ? "" : "s"}
        </p>
      </div>

      <div className="text-right">
        <p className={`flex items-center justify-end gap-1 text-sm ${passed ? "text-emerald-300" : "text-gray-300"}`}>
          {passed && <BadgeCheck size={14} />}
          {coach.best_score}/{coach.best_total_score}
        </p>
        <p className="text-xs text-gray-500">{coach.best_percent}%</p>
      </div>
    </li>
  );
}

export default function LearnerSkillPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const latest = useRef("");
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [coaches, setCoaches] = useState<SkillCoach[]>([]);
  const [loadingCoaches, setLoadingCoaches] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "learner") {
      router.replace("/learner_login");
      return;
    }
    Promise.all([api.catalog_categories(), api.catalog_skills()]).then(([c, s]) => {
      if (isSuccess(c)) setCategories(c.data ?? []);
      if (isSuccess(s)) setSkills(s.data ?? []);
    });
  }, [ready, user, router]);

  async function selectSkill(name: string) {
    latest.current = name;
    setSelected(name);
    setCoaches([]);
    setLoadingCoaches(true);

    const res = await api.skill_coaches(name);
    if (latest.current !== name) return;

    setLoadingCoaches(false);
    if (isSuccess(res)) setCoaches(res.data ?? []);
    else setNotice({ type: "error", message: res.message });
  }

  if (!ready || !user || user.role !== "learner") {
    return <p className="mt-24 text-center text-gray-400">Loading...</p>;
  }

  const groups = categories
    .map((c) => ({ category: c, items: skills.filter((s) => s.category_name === c.category_name) }))
    .filter((g) => g.items.length > 0);

  const passedList = coaches.filter((c) => c.status === "pass");
  const triedList = coaches.filter((c) => c.status !== "pass");

  return (
    <div className="mx-auto mt-10 w-full max-w-5xl px-4 pb-16">
      <h1 className="mb-6 text-2xl font-semibold text-white">Find a coach</h1>

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
                  {items.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => selectSkill(s.skill_name)}
                      className={`rounded-full px-4 py-1.5 text-sm transition ${
                        selected === s.skill_name
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800/60 text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      {s.skill_name}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
            {!selected ? (
              <p className="py-8 text-center text-sm text-gray-500">Choose a skill to see its coaches</p>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-white">Coaches for {selected}</h2>

                {loadingCoaches ? (
                  <p className="py-8 text-center text-sm text-gray-400">Loading...</p>
                ) : coaches.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">
                    No coach has taken the exam for this skill yet
                  </p>
                ) : (
                  <>
                    <h3 className="mt-4 text-sm text-gray-400">Passed the exam</h3>
                    {passedList.length === 0 ? (
                      <p className="py-3 text-sm text-gray-600">No coach has passed yet</p>
                    ) : (
                      <ul className="divide-y divide-gray-800">
                        {passedList.map((c, i) => (
                          <CoachRow key={c.username} coach={c} rank={i + 1} />
                        ))}
                      </ul>
                    )}

                    {triedList.length > 0 && (
                      <>
                        <h3 className="mt-5 text-sm text-gray-400">Took the exam, not passed yet</h3>
                        <ul className="divide-y divide-gray-800">
                          {triedList.map((c, i) => (
                            <CoachRow key={c.username} coach={c} rank={i + 1} />
                          ))}
                        </ul>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={!!notice}
        type={notice?.type ?? "error"}
        message={notice?.message ?? ""}
        onClose={() => setNotice(null)}
      />
    </div>
  );
}