"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, UserRoundCog } from "lucide-react";
import { useAuth } from "@/app/lib/auth";

const menus = [
  {
    href: "/learner_login",
    title: "Learner",
    desc: "Learn new skills with a coach",
    Icon: GraduationCap,
    color: "from-emerald-500 to-teal-600",
  },
  {
    href: "/coach_login",
    title: "Coach",
    desc: "Manage your skills and learners",
    Icon: UserRoundCog,
    color: "from-blue-500 to-indigo-600",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { user, ready } = useAuth();

  // already logged in: go to the profile page of that role
  useEffect(() => {
    if (ready && user) router.replace(`/${user.role}_profile`);
  }, [ready, user, router]);

  // wait for the stored user to be read, and avoid a flash of the menu while redirecting
  if (!ready || user) {
    return <p className="mt-24 text-center text-gray-400">Loading...</p>;
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-4xl flex-col items-center justify-center gap-10 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white">Learning App</h1>
        <p className="mt-2 text-gray-400">Choose how you want to continue</p>
      </div>

      <div className="grid w-full gap-6 sm:grid-cols-2">
        {menus.map(({ href, title, desc, Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col items-center gap-4 rounded-2xl border border-gray-800 bg-gray-900 p-10 text-center shadow-lg shadow-black/40 transition hover:-translate-y-1 hover:border-gray-600"
          >
            <div className={`rounded-full bg-gradient-to-br ${color} p-6 text-white transition group-hover:scale-110`}>
              <Icon size={56} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-semibold text-white">{title}</h2>
            <p className="text-sm text-gray-400">{desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}