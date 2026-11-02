"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/app/lib/auth";
import { api } from "@/app/lib/api";

export default function Header() {
  const router = useRouter();
  const { user, ready, signOut } = useAuth();

  async function handleLogout() {
    if (user?.loginId) await api.logout(user.loginId);   // sets logout_time on the server
    signOut();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-950/90 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-3">
        <Link href="/" className="text-lg font-semibold text-white">
          Learning App
        </Link>

        {ready && user && (
          <div className="group relative">
            {/* trigger */}
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-gray-700 bg-gray-900 py-1 pl-1 pr-3 text-sm text-gray-100 hover:border-gray-500"
            >
              <span className="rounded-full bg-blue-600 p-1.5 text-white">
                <UserRound size={16} />
              </span>
              {user.username}
              <ChevronDown
                size={14}
                className="text-gray-400 transition group-hover:rotate-180 group-focus-within:rotate-180"
              />
            </button>

            {/* dropdown: pt-2 keeps the hover area connected to the button, so it does not close in the gap */}
            <div className="invisible absolute right-0 top-full z-50 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="w-44 overflow-hidden rounded-xl border border-gray-800 bg-gray-900 py-1 shadow-lg shadow-black/50">
                <Link
                  href={`/${user.role}_profile`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
                >
                  <UserRound size={16} />
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}