"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Register from "@/app/components/register/page";
import Modal from "@/app/components/modal/page";
import { api, ApiResponse, isSuccess, RegisterRequest } from "@/app/lib/api";
import { clearCoachDetail, useCoachDetail } from "@/app/lib/coach_detail";
import { useGuestOnly } from "@/app/lib/guest";

export default function CoachRegisterPage() {
  const router = useRouter();
  const blocked = useGuestOnly();
  const { value: detail, ready } = useCoachDetail();
  const finished = useRef(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const ok = result ? isSuccess(result) : false;

  useEffect(() => {
    if (ready && !detail && !finished.current) router.replace("/coach_detail");
  }, [ready, detail, router]);

  async function handleRegister(body: RegisterRequest) {
    if (!detail) return;
    setLoading(true);
    const res = await api.register_coach({
      ...body,
      detail: { ...detail, cost: Number(detail.cost) },
    });
    setLoading(false);
    setResult(res);
  }

  function handleClose() {
    setResult(null);
    if (ok) {
      finished.current = true;
      clearCoachDetail();
      router.push("/coach_login");
    }
  }

  if (blocked || !ready || !detail) {
    return <p className="mt-24 text-center text-gray-400">Loading...</p>;
  }

  return (
    <>
      <Register
        title="Coach Register"
        loginHref="/coach_login"
        onSubmit={handleRegister}
        loading={loading}
      />
      <Modal
        open={!!result}
        type={ok ? "success" : "error"}
        message={result?.message ?? ""}
        onClose={handleClose}
      />
    </>
  );
}