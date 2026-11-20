"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import { ApiResponse, isSuccess, PhoneData } from "@/app/lib/api";

type PhoneButtonProps = {
  load: () => Promise<ApiResponse<PhoneData>>;
};

export default function PhoneButton({ load }: PhoneButtonProps) {
  const [phone, setPhone] = useState<string | null>(null);
  const [shown, setShown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setError("");
    setLoading(true);
    const res = await load();
    setLoading(false);

    if (isSuccess(res)) {
      setPhone(res.data?.phone ?? null);
      setShown(true);
    } else {
      setError(res.message);
    }
  }

  if (shown) {
    return phone ? (
      <a
        href={`tel:${phone}`}
        className="inline-flex items-center gap-1.5 rounded bg-emerald-900/60 px-4 py-1.5 text-sm text-emerald-300 hover:bg-emerald-900"
      >
        <Phone size={14} />
        {phone}
      </a>
    ) : (
      <span className="text-sm text-gray-500">No phone number</span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={loading}
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 rounded bg-emerald-600 px-4 py-1.5 text-sm text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        <Phone size={14} />
        {loading ? "Loading..." : "View phone"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}