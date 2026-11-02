"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Register from "@/app/components/register/page";
import Modal from "@/app/components/modal/page";
import { api, ApiResponse, isSuccess, RegisterRequest } from "@/app/lib/api";

export default function LearnerRegisterPage() {
  const router = useRouter();
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const ok = result ? isSuccess(result) : false;

  async function handleRegister(body: RegisterRequest) {
    setLoading(true);
    const res = await api.register_learner(body);
    setLoading(false);
    setResult(res);
  }

  function handleClose() {
    setResult(null);
    if (ok) router.push("/learner_login");
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