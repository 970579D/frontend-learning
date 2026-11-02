"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Profile from "@/app/components/profile/page";
import Modal from "@/app/components/modal/page";
import { useAuth } from "@/app/lib/auth";
import { api, isSuccess, ProfileData } from "@/app/lib/api";

export default function LearnerProfilePage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "learner") {
      router.replace("/learner_login");
      return;
    }
    api.get_learner(user.username).then((res) => {
      if (isSuccess(res)) setProfile(res.data);
      else setErrorMessage(res.message);
      setLoading(false);
    });
  }, [ready, user, router]);

  return (
    <>
      <Profile title="Learner" profile={profile} loading={loading} />
      <Modal open={!!errorMessage} type="error" message={errorMessage} onClose={() => setErrorMessage("")} />
    </>
  );
}