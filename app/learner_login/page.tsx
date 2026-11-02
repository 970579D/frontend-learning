"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Login from "@/app/components/login/page";
import Modal from "@/app/components/modal/page";
import { api, isSuccess, LoginRequest } from "@/app/lib/api";

export default function LearnerLoginPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(body: LoginRequest) {
    setLoading(true);
    const res = await api.login_learner(body);
    setLoading(false);

    if (isSuccess(res)) {
      if (res.data?.login_id) localStorage.setItem("login_id", String(res.data.login_id));
      router.push("/learner");
    } else {
      setErrorMessage(res.message);
    }
  }

  return (
    <>
      <Login
        title="Learner Login"
        registerHref="/learner_register"
        onSubmit={handleLogin}
        loading={loading}
      />
      <Modal
        open={!!errorMessage}
        type="error"
        message={errorMessage}
        onClose={() => setErrorMessage("")}
      />
    </>
  );
}