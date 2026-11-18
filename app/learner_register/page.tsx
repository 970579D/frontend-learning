"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Register from "@/app/components/register/page";
import Modal from "@/app/components/modal/page";
import { api, ApiResponse, isSuccess, RegisterRequest } from "@/app/lib/api";
import { useGuestOnly } from "@/app/lib/guest";
import { clearRequirement, useRequirement } from "@/app/lib/requirement";

export default function LearnerRegisterPage() {
  const router = useRouter();
  const blocked = useGuestOnly();
  const { requirement, ready } = useRequirement();
  const finished = useRef(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const ok = result ? isSuccess(result) : false;

  useEffect(() => {
    if (ready && !requirement && !finished.current) router.replace("/learner_requirement");
  }, [ready, requirement, router]);

  async function handleRegister(body: RegisterRequest) {
    if (!requirement) return;
    setLoading(true);
    const res = await api.register_learner({ ...body, requirement });
    setLoading(false);
    setResult(res);
  }

  function handleClose() {
    setResult(null);
    if (ok) {
      finished.current = true;
      clearRequirement();
      router.push("/learner_login");
    }
  }

  if (blocked || !ready || !requirement) {
    return <p className="mt-24 text-center text-gray-400">Loading...</p>;
  }

  return (
    <>
      <Register
        title="Learner Register"
        loginHref="/learner_login"
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