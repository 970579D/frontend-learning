"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import Modal from "@/app/components/modal/page";
import { useAuth } from "@/app/lib/auth";
import { api, CategoryData, isSuccess, SkillData } from "@/app/lib/api";

const inputClass =
  "rounded border border-gray-700 bg-gray-800 p-2 text-gray-100 outline-none focus:border-blue-500";

type Notice = { type: "success" | "error"; message: string } | null;

export default function AdminSkillPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [form, setForm] = useState({ skill_name: "", category_name: "" });
  const [openNames, setOpenNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "admin") {
      router.replace("/admin_login");
      return;
    }
    Promise.all([api.catalog_categories(), api.catalog_skills()]).then(([c, s]) => {
      if (isSuccess(c)) setCategories(c.data ?? []);
      if (isSuccess(s)) setSkills(s.data ?? []);
    });
  }, [ready, user, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await api.catalog_create_skill(form.skill_name, form.category_name);
    setLoading(false);

    if (!isSuccess(res)) {
      setNotice({ type: "error", message: res.message });
      return;
    }

    setNotice({ type: "success", message: res.message });
    setOpenNames((names) => (names.includes(form.category_name) ? names : [...names, form.category_name]));
    setForm({ ...form, skill_name: "" });
    const list = await api.catalog_skills();
    if (isSuccess(list)) setSkills(list.data ?? []);
  }

  function toggle(name: string) {
    setOpenNames((names) =>
      names.includes(name) ? names.filter((n) => n !== name) : [...names, name],
    );
  }

  if (!ready || !user || user.role !== "admin") {
    return <p className="mt-24 text-center text-gray-400">Loading...</p>;
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-4xl px-4 pb-16">
      <h1 className="mb-6 text-2xl font-semibold text-white">Skill</h1>

      {categories.length === 0 ? (
        <p className="mb-8 rounded-2xl border border-gray-800 bg-gray-900 p-6 text-center text-gray-400">
          Create a category first.{" "}
          <Link href="/admin_category" className="text-blue-400 hover:underline">
            Go to Category
          </Link>
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mb-8 flex flex-col gap-3 rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:flex-row sm:items-end"
        >
          <label className="flex flex-1 flex-col gap-1 text-sm text-gray-400">
            Category
            <select
              className={inputClass}
              value={form.category_name}
              onChange={(e) => setForm({ ...form, category_name: e.target.value })}
              required
            >
              <option value="">Choose a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.category_name}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-1 flex-col gap-1 text-sm text-gray-400">
            Skill name
            <input
              className={inputClass}
              value={form.skill_name}
              maxLength={100}
              onChange={(e) => setForm({ ...form, skill_name: e.target.value })}
              required
            />
          </label>

          <button
            disabled={loading}
            className="rounded bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      )}

      {categories.length === 0 ? null : (
        <div className="flex flex-col gap-4">
          {categories.map((c) => {
            const group = skills.filter((s) => s.category_name === c.category_name);
            const isOpen = openNames.includes(c.category_name);

            return (
              <div key={c.id} className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-white">{c.category_name}</h2>
                  <span className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300">
                    {group.length} skill{group.length === 1 ? "" : "s"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggle(c.category_name)}
                  className="mt-3 flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200"
                >
                  <ChevronDown size={14} className={isOpen ? "rotate-180" : ""} />
                  Skills
                </button>

                {isOpen && (
                  <div className="mt-4 flex flex-wrap gap-2 px-1">
                    {group.length === 0 && <span className="px-2 text-sm text-gray-600">No skills yet</span>}

                    {group.map((s) => (
                      <span
                        key={s.id}
                        title={new Date(s.create_date).toLocaleDateString()}
                        className="rounded-full bg-gray-800/60 px-4 py-1.5 text-sm text-gray-400"
                      >
                        {s.skill_name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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