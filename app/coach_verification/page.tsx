"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Verification from "@/app/components/verification/page";
import Modal from "@/app/components/modal/page";
import { useAuth } from "@/app/lib/auth";
import { api, AssessmentData, isSuccess } from "@/app/lib/api";

export default function CoachVerificationPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [items, setItems] = useState<AssessmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "coach") {
      router.replace("/coach_login");
      return;
    }
    api.get_coach_assessment(user.username).then((res) => {
      if (isSuccess(res)) setItems(res.data ?? []);
      else setErrorMessage(res.message);
      setLoading(false);
    });
  }, [ready, user, router]);

  return (
    <>
      <Verification items={items} loading={loading} />
      <Modal open={!!errorMessage} type="error" message={errorMessage} onClose={() => setErrorMessage("")} />
    </>
  );
}