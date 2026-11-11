"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { homeOf, useAuth } from "@/app/lib/auth";

export function useGuestOnly() {
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (ready && user) router.replace(homeOf(user.role));
  }, [ready, user, router]);

  return !ready || !!user;
}