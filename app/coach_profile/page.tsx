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

        try {
          if (p?.image_path) saveAvatar("coach", p.username, p.image_path);
          else if (p) removeAvatar("coach", p.username);
        } catch {}
      } else {
        setErrorMessage(res.message);
      }
      setLoading(false);
    });
  }, [ready, user, router]);

  async function handleImage(blob: Blob | null) {
    if (!profile) return;

    const res = blob
      ? await api.image_coach(profile.username, blob)
      : await api.remove_image_coach(profile.username);

    if (!isSuccess(res)) {
      setErrorMessage(res.message);
      return;
    }

    const name = res.data?.image_path ?? null;
    setProfile({ ...profile, image_path: name });
    if (name) saveAvatar("coach", profile.username, name);
    else removeAvatar("coach", profile.username);
  }

  async function handleName(data: { firstname: string; lastname: string }) {
    if (!profile) return false;

    const res = await api.name_coach(profile.username, data);
    if (!isSuccess(res)) {
      setErrorMessage(res.message);
      return false;
    }

    setProfile({
      ...profile,
      firstname: res.data?.firstname ?? data.firstname,
      lastname: res.data?.lastname ?? data.lastname,
    });
    return true;
  }

  return (
    <>
      <Profile
        title="Coach"
        role="coach"
        profile={profile}
        loading={loading}
        onImageChange={handleImage}
        onNameChange={handleName}
      />
      <Modal open={!!errorMessage} type="error" message={errorMessage} onClose={() => setErrorMessage("")} />
    </>
  );
}