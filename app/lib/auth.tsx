"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";

export type Role = "coach" | "learner";
export type AuthUser = { username: string; role: Role; session?: string };

type AuthContextType = {
  user: AuthUser | null;
  ready: boolean;                 // false on the server and during hydration
  signIn: (user: AuthUser) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const KEY = "auth_user";
const EVENT = "auth-change";   // the "storage" event only fires in OTHER tabs, so we fire our own

// ---- external store: localStorage ----

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);   // another tab changed it
  window.addEventListener(EVENT, onChange);       // this tab changed it
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

// must return a stable value: a string (or null) compares by value, so no infinite loop
function getSnapshot(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;   // no localStorage on the server
}

// ---- hydration flag ----

const noopSubscribe = () => () => {};

// ---- actions (plain functions, so they never change between renders) ----

function signIn(user: AuthUser) {
  localStorage.setItem(KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(EVENT));
}

function signOut() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

// ---- provider ----

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // false on the server and the first client render, true afterwards
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const user = useMemo<AuthUser | null>(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;   // broken data in storage
    }
  }, [raw]);

  const value = useMemo(() => ({ user, ready, signIn, signOut }), [user, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

