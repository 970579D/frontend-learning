"use client";

import { useSyncExternalStore } from "react";
import type { Role } from "@/app/lib/auth";

const EVENT = "avatar-change";
const keyOf = (role: Role, username: string) => `avatar:${role}:${username}`;

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

// returns a data URL (a string, so the snapshot is stable) or null
export function useAvatar(role?: Role, username?: string): string | null {
  return useSyncExternalStore(
    subscribe,
    () => (role && username ? safeGet(keyOf(role, username)) : null),
    () => null,
  );
}

// throws if the browser storage is full, the caller shows the error
export function saveAvatar(role: Role, username: string, dataUrl: string) {
  localStorage.setItem(keyOf(role, username), dataUrl);
  window.dispatchEvent(new Event(EVENT));
}

export function removeAvatar(role: Role, username: string) {
  localStorage.removeItem(keyOf(role, username));
  window.dispatchEvent(new Event(EVENT));
}

// crop the center square and shrink it, so it fits in localStorage (about 20-40 KB)
export function fileToAvatar(file: File, size = 512): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      URL.revokeObjectURL(url);

      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Cannot encode image"))),
        "image/jpeg",
        0.85,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Cannot read image"));
    };

    img.src = url;
  });
}

