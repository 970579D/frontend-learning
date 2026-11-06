"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Login from "@/app/components/login/page";
import Modal from "@/app/components/modal/page";
import { api, isSuccess, LoginRequest } from "@/app/lib/api";
import { useAuth } from "../lib/auth";

export default function CoachLoginPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  async function handleLogin(body: LoginRequest) {
    setLoading(true);
    const res = await api.login_coach(body);
    setLoading(false);

    if (isSuccess(res) && res.data) {
      signIn({ username: res.data.username, role: "coach", session: res.data.session });
      router.push("/coach_profile");
    } else {
      setErrorMessage(res.message);
    }
  }

  return (
    <>
      <Login title="Coach Login" registerHref="/coach_register" onSubmit={handleLogin} loading={loading} />
      <Modal
        open={!!errorMessage}
        type="error"
        message={errorMessage}
        onClose={() => setErrorMessage("")}
      />
    </>
  );
}