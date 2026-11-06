"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import type { LoginRequest } from "@/app/lib/api";

type LoginProps = {
  title: string;
  registerHref?: string;
  onSubmit: (data: LoginRequest) => void | Promise<void>;
  loading?: boolean;
};

const inputClass =
  "rounded border border-gray-700 bg-gray-800 p-2 text-gray-100 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

export default function Login({ title, registerHref, onSubmit, loading }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit({ username, password });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-24 flex w-full max-w-sm flex-col gap-4 rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-lg shadow-black/40"
    >
      <h1 className="text-2xl font-semibold text-white">{title}</h1>

      <input
        className={inputClass}
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        className={inputClass}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-blue-600 p-2 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Login"}
      </button>

      {registerHref && (
        <p className="text-center text-sm text-gray-400">
          No account yet?{" "}
          <Link href={registerHref} className="text-blue-400 hover:underline">
            Register
          </Link>
        </p>
      )}
    </form>
  );
}