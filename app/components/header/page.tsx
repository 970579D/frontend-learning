"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, LogOut, UserRound, Landmark } from "lucide-react";
import { useAuth } from "@/app/lib/auth";
import { useAvatar } from "@/app/lib/avatar";
import { roleTheme } from "@/app/lib/theme";
import Modal from "@/app/components/modal/page";
import { api } from "@/app/lib/api";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, ready, signOut } = useAuth();
  const avatar = useAvatar(user?.role, user?.username);
  const theme = roleTheme[user?.role ?? "coach"];
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleLogout() {
    if (!user) return;

    // old stored login without a session: nothing to close on the server
    if (user.session) {
      const res =
        user.role === "coach"
          ? await api.logout_coach(user.session)
          : await api.logout_learner(user.session);

      // logout has no data to return, so check only the status
      if (res.status !== "success") {
        setResult({ type: "error", message: res.message });
        return;   // stay logged in: no signOut, no redirect
      }

      setResult({ type: "success", message: res.message });
    }

    signOut();
    router.push("/");
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-950/90 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-3">
          {/* left: back button + logo */}
          <div className="flex items-center gap-2">
            {/* {pathname !== "/" && (
              <button
                type="button"
                onClick={() => router.back()}
                aria-label="Go back"
                title="Back"
                className="rounded-full p-2 text-gray-300 transition hover:bg-gray-800 hover:text-white"
              >
                <ArrowLeft size={20} />
              </button>
            )} */}

            {(!user && pathname != "/") && <Link href="/" className="text-lg font-semibold text-white">
              <Landmark size={30} opacity={0.7}/>
            </Link>}
          </div>

          {ready && user && (
            <div className="group relative">
              {/* trigger */}
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-gray-700 bg-gray-900 py-1 pl-1 pr-3 text-sm text-gray-100 hover:border-gray-500"
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center overflow-hidden rounded-full text-white ${theme.solid}`}
                >
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <UserRound size={16} />
                  )}
                </span>
                {user.username}
                <ChevronDown
                  size={14}
                  className="text-gray-400 transition group-hover:rotate-180 group-focus-within:rotate-180"
                />
              </button>

              {/* dropdown: pt-2 keeps the hover area connected to the button */}
              <div className="invisible absolute right-0 top-full z-50 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="w-44 overflow-hidden rounded-xl border border-gray-800 bg-gray-900 py-1 shadow-lg shadow-black/50">
                  <Link
                    href={`/${user.role}_profile`}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
                  >
                    <UserRound size={16} />
                    Profile
                  </Link>
                  {user?.role == "coach" &&
                    <Link
                    href={`/${user.role}_verification`}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
                  >
                    <UserRound size={16} />
                    Verification
                  </Link>
                  }
                  {user?.role == "learner" &&
                    <Link
                    href={`/${user.role}_verification`}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
                  >
                    <UserRound size={16} />
                    Class
                  </Link>
                  }
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

      <Modal
        open={!!result}
        type={result?.type ?? "error"}
        message={result?.message ?? ""}
        onClose={() => setResult(null)}
      />
    </>
  );
}