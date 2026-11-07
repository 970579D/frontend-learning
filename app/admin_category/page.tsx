"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/app/components/modal/page";
import { useAuth } from "@/app/lib/auth";
import { api, CategoryData, isSuccess } from "@/app/lib/api";

const inputClass =
  "rounded border border-gray-700 bg-gray-800 p-2 text-gray-100 outline-none focus:border-blue-500";

type Notice = { type: "success" | "error"; message: string } | null;

export default function AdminCategoryPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "admin") {
      router.replace("/admin_login");
      return;
    }
    api.catalog_categories().then((res) => {
      if (isSuccess(res)) setCategories(res.data ?? []);
    });
  }, [ready, user, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await api.catalog_create_category(name);
    setLoading(false);

    if (!isSuccess(res)) {
      setNotice({ type: "error", message: res.message });
      return;
    }

    setNotice({ type: "success", message: res.message });
    setName("");
    const list = await api.catalog_categories();
    if (isSuccess(list)) setCategories(list.data ?? []);
  }

  if (!ready || !user || user.role !== "admin") {
    return <p className="mt-24 text-center text-gray-400">Loading...</p>;
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-2xl px-4 pb-16">
      <h1 className="mb-6 text-2xl font-semibold text-white">Category</h1>

      <form
        onSubmit={handleSubmit}
        className="mb-8 flex flex-col gap-3 rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:flex-row sm:items-end"
      >
        <label className="flex flex-1 flex-col gap-1 text-sm text-gray-400">
          Category name
          <input
            className={inputClass}
            value={name}
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
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

      {categories.length === 0 ? (
        <p className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center text-gray-400">
          No categories yet
        </p>
      ) : (
        <ul className="divide-y divide-gray-800 rounded-2xl border border-gray-800 bg-gray-900">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <span className="text-gray-100">{c.category_name}</span>
              <span className="text-xs text-gray-500">{new Date(c.create_date).toLocaleDateString()}</span>
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