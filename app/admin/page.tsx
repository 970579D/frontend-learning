"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth";

export default function AdminPage() {
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (ready && (!user || user.role !== "admin")) router.replace("/admin_login");
  }, [ready, user, router]);

  if (!ready || !user || user.role !== "admin") {
    return <p className="mt-24 text-center text-gray-400">Loading...</p>;
  }

  return (
    <main className="mt-24 text-center">
      <h1 className="text-3xl font-semibold text-white">Welcome admin</h1>
    </main>
  );
}