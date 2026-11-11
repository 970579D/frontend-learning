"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Login from "@/app/components/login/page";
import Modal from "@/app/components/modal/page";
import { useAuth } from "@/app/lib/auth";
import { api, isSuccess, LoginRequest } from "@/app/lib/api";
import { useGuestOnly } from "../lib/guest";

export default function LearnerLoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const blocked = useGuestOnly();

  async function handleLogin(body: LoginRequest) {
    setLoading(true);
    const res = await api.login_learner(body);
    setLoading(false);

    if (isSuccess(res) && res.data) {
      signIn({ username: res.data.username, role: "learner", session: res.data.session });
      router.push("/learner_profile");
    } else {
      setErrorMessage(res.message);
    }
  }

  if (blocked) {
    return <p className="mt-24 text-center text-gray-400">Loading...</p>;
  }

  return (
    <>
      <Login
        title="Learner"
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