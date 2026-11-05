"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import type { RegisterRequest } from "@/app/lib/api";

type RegisterProps = {
  title: string;
  loginHref: string;
  onSubmit: (data: RegisterRequest) => void | Promise<void>;
  error?: string;
  loading?: boolean;
};

const inputClass =
  "rounded border border-gray-700 bg-gray-800 p-2 text-gray-100 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

export default function Register({ title, loginHref, onSubmit, error, loading }: RegisterProps) {
  const [form, setForm] = useState<RegisterRequest>({
    username: "",
    password: "",
    firstname: "",
    lastname: "",
  });

  const update = (key: keyof RegisterRequest) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit(form);   // just emit, the parent does the API call
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-16 flex w-full max-w-sm flex-col gap-4 rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-lg shadow-black/40"
    >
      <h1 className="text-2xl font-semibold text-white">{title}</h1>

      <input className={inputClass} placeholder="Username" value={form.username} onChange={update("username")} required />
      <input className={inputClass} type="password" placeholder="Password" value={form.password} onChange={update("password")} required />
      <input className={inputClass} placeholder="First name" value={form.firstname} onChange={update("firstname")} required />
      <input className={inputClass} placeholder="Last name" value={form.lastname} onChange={update("lastname")} required />
      
      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-blue-600 p-2 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Register"}
      </button>

      <p className="text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link href={loginHref} className="text-blue-400 hover:underline">
          Back to login
        </Link>
      </p>
    </form>
  );
}