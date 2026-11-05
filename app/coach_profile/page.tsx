"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Profile from "@/app/components/profile/page";
import Modal from "@/app/components/modal/page";
import { useAuth } from "@/app/lib/auth";
import { removeAvatar, saveAvatar } from "@/app/lib/avatar";
import { api, isSuccess, ProfileData } from "@/app/lib/api";

export default function CoachProfilePage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "coach") {
      router.replace("/coach_login");
      return;
    }
    api.get_coach(user.username).then((res) => {
      if (isSuccess(res)) {
        const d = res.data as ProfileData | ProfileData[];
        const p = Array.isArray(d) ? d[0] ?? null : d;
        setProfile(p);

        // the DB is the source of truth: copy its photo to the local cache so the header shows it too
        try {
          if (p?.image_path) saveAvatar("coach", p.username, p.image_path);
          else if (p) removeAvatar("coach", p.username);
        } catch { /* storage full: the profile still shows the DB value on next load */ }
      } else {
        setErrorMessage(res.message);
      }
      setLoading(false);
    });
  }, [ready, user, router]);

  async function handleImage(dataUrl: string | null) {
    if (!profile) return;

    const res = await api.image_coach(profile.username, dataUrl);
    if (!isSuccess(res)) {
      setErrorMessage(res.message);
      return;
    }

    setProfile({ ...profile, image_path: dataUrl });
    if (dataUrl) saveAvatar("coach", profile.username, dataUrl);
    else removeAvatar("coach", profile.username);
  }

  return (
    <>
      <Profile title="Coach" role="coach" profile={profile} loading={loading} onImageChange={handleImage} />
      <Modal open={!!errorMessage} type="error" message={errorMessage} onClose={() => setErrorMessage("")} />
    </>
  );
}