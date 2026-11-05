"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Profile from "@/app/components/profile/page";
import Modal from "@/app/components/modal/page";
import { useAuth } from "@/app/lib/auth";
import { removeAvatar, saveAvatar } from "@/app/lib/avatar";
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
      if (isSuccess(res)) {
        const d = res.data as ProfileData | ProfileData[];
        const p = Array.isArray(d) ? d[0] ?? null : d;
        setProfile(p);

        // the DB is the source of truth: copy its photo to the local cache so the header shows it too
        try {
          if (p?.image_path) saveAvatar("learner", p.username, p.image_path);
          else if (p) removeAvatar("learner", p.username);
        } catch { /* storage full: the profile still shows the DB value on next load */ }
      } else {
        setErrorMessage(res.message);
      }
      setLoading(false);
    });
  }, [ready, user, router]);

  async function handleImage(blob: Blob | null) {
    if (!profile) return;

    const res = blob
      ? await api.image_learner(profile.username, blob)
      : await api.remove_image_learner(profile.username);

    if (!isSuccess(res)) {
      setErrorMessage(res.message);
      return;
    }

    const name = res.data?.image_path ?? null;
    setProfile({ ...profile, image_path: name });
    if (name) saveAvatar("learner", profile.username, name);
    else removeAvatar("learner", profile.username);
  }

  return (
    <>
      <Profile title="Learner" role="learner" profile={profile} loading={loading} onImageChange={handleImage} />
      <Modal open={!!errorMessage} type="error" message={errorMessage} onClose={() => setErrorMessage("")} />
    </>
  );
}