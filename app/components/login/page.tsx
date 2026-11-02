"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type LoginProps = {
  title: string;       // heading text, e.g. "Coach Login"
  endpoint: string;    // API path, e.g. "/coach/login"
  redirectTo: string;  // page to open after a successful login
};

export default function Login({ title, endpoint, redirectTo }: LoginProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // FastAPI returns a string for HTTPException, a list for validation errors
        throw new Error(typeof data.detail === "string" ? data.detail : "Login failed");
      }

      if (data.login_id) localStorage.setItem("login_id", String(data.login_id)); // needed for logout
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-24 flex w-full max-w-sm flex-col gap-4 rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-lg shadow-black/40"
    >
      <h1 className="text-2xl font-semibold text-white">{title}</h1>

      <input
        className="rounded border border-gray-700 bg-gray-800 p-2 text-gray-100 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        className="rounded border border-gray-700 bg-gray-800 p-2 text-gray-100 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-blue-600 p-2 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Login"}
      </button>
    </form>
  );
}