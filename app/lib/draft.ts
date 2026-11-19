"use client";

import { useMemo, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

export function createDraftStore<T>(key: string) {
  const event = `${key}-change`;

  function subscribe(onChange: () => void) {
    window.addEventListener("storage", onChange);
    window.addEventListener(event, onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(event, onChange);
    };
  }

  function getSnapshot(): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function save(data: T) {
    sessionStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new Event(event));
  }

  function clear() {
    sessionStorage.removeItem(key);
    window.dispatchEvent(new Event(event));
  }

  function useDraft() {
    const raw = useSyncExternalStore(subscribe, getSnapshot, () => null);
    const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);

    const value = useMemo<T | null>(() => {
      if (!raw) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    }, [raw]);

    return { value, ready };
  }

  return { save, clear, useDraft };
}