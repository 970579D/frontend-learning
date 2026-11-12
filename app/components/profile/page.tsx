"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { BadgeCheck, Camera, Pencil, Trash2, UserRound } from "lucide-react";
import Modal from "@/app/components/modal/page";
import { imageUrl, ProfileData } from "@/app/lib/api";
import type { Role } from "@/app/lib/auth";
import { fileToAvatar, useAvatar } from "@/app/lib/avatar";
import { roleTheme } from "@/app/lib/theme";

type NameForm = { firstname: string; lastname: string };
type Field = "firstname" | "lastname";

type ProfileProps = {
  title: string;
  role: Role;
  profile: ProfileData | null;
  loading: boolean;
  onImageChange: (blob: Blob | null) => void | Promise<void>;
  onNameChange: (data: NameForm) => Promise<boolean>;
};

const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString() : "-");
const MAX_SIZE = 5 * 1024 * 1024;
const inputClass =
  "w-44 rounded border border-gray-700 bg-gray-800 p-1.5 text-right text-sm text-gray-100 outline-none focus:border-blue-500";

export default function Profile({ title, role, profile, loading, onImageChange, onNameChange }: ProfileProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const avatar = imageUrl(useAvatar(role, profile?.username));
  const theme = roleTheme[role];
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Field | null>(null);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !profile) return;

    if (!file.type.startsWith("image/")) return setError("Please choose an image file");
    if (file.size > MAX_SIZE) return setError("Image must be smaller than 5 MB");

    try {
      await onImageChange(await fileToAvatar(file));
    } catch {
      setError("Could not save this image");
    }
  }

  function startEdit(field: Field) {
    if (!profile) return;
    setValue(profile[field]);
    setEditing(field);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!profile || !editing) return;

    const next = value.trim();
    if (!next) {
      setError("This field is required");
      return;
    }

    const data: NameForm = {
      firstname: editing === "firstname" ? next : profile.firstname,
      lastname: editing === "lastname" ? next : profile.lastname,
    };

    setSaving(true);
    const ok = await onNameChange(data);
    setSaving(false);
    if (ok) setEditing(null);
  }

  if (loading) {
    return <p className="mt-24 text-center text-gray-400">Loading profile...</p>;
  }
  if (!profile) {
    return <p className="mt-24 text-center text-gray-400">No profile data</p>;
  }

  const rows: { label: string; value: string; field?: Field }[] = [
    { label: "Username", value: profile.username },
    { label: "First name", value: profile.firstname, field: "firstname" },
    { label: "Last name", value: profile.lastname, field: "lastname" },
    ...(profile.status ? [{ label: "Status", value: profile.status }] : []),
    { label: "Created", value: fmt(profile.create_date) },
    { label: "Last update", value: fmt(profile.update_date) },
  ];

  return (
    <div className="mx-auto mt-12 w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-lg shadow-black/40">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="relative">
          <div
            className={`flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br text-white ${theme.gradient}`}
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <UserRound size={48} strokeWidth={1.5} />
            )}
          </div>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Upload photo"
            title="Upload photo"
            className={`absolute bottom-0 right-0 rounded-full border-2 border-gray-900 p-2 text-white hover:brightness-110 ${theme.solid}`}
          >
            <Camera size={16} />
          </button>

          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </div>

        {avatar && (
          <button
            type="button"
            onClick={() => onImageChange(null)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400"
          >
            <Trash2 size={12} />
            Remove photo
          </button>
        )}

        <h1 className="text-2xl font-semibold text-white">
          {profile.firstname} {profile.lastname}
        </h1>
        <p className="text-sm text-gray-400">{title}</p>
      </div>

      <dl className="mt-8 divide-y divide-gray-800">
        {rows.map(({ label, value: text, field }) => (
          <div key={label} className="flex min-h-12 items-center justify-between gap-3 py-2 text-sm">
            <dt className="flex items-center gap-1 text-gray-400">
              {label}
              {field && editing !== field && (
                <button
                  type="button"
                  onClick={() => startEdit(field)}
                  aria-label={`Edit ${label.toLowerCase()}`}
                  title={`Edit ${label.toLowerCase()}`}
                  className="rounded-full p-1 text-gray-500 hover:bg-gray-800 hover:text-white"
                >
                  <Pencil size={13} />
                </button>
              )}
            </dt>

            <dd className="text-right text-gray-100">
              {field && editing === field ? (
                <form onSubmit={handleSave} className="flex items-center justify-end gap-2">
                  <input
                    className={inputClass}
                    value={value}
                    maxLength={50}
                    onChange={(e) => setValue(e.target.value)}
                    autoFocus
                    required
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-500 disabled:opacity-50"
                  >
                    {saving ? "..." : "Save"}
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setEditing(null)}
                    className="rounded border border-gray-700 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                text
              )}
            </dd>
          </div>
        ))}
      </dl>

      {profile.skills && (
        <div className="mt-6">
          <h2 className="mb-2 text-sm text-gray-400">Skills</h2>
          {profile.skills.length === 0 ? (
            <p className="text-sm text-gray-500">No skills yet</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((s) => {
                  const passed = s.status === "active";
                  return (
                    <span
                      key={s.skill_name}
                      title={passed ? "Exam passed" : "Exam not passed yet"}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ${
                        passed
                          ? "bg-emerald-900/60 text-emerald-300 ring-1 ring-emerald-500/50"
                          : "bg-gray-800 text-gray-300"
                      }`}
                    >
                      {passed && <BadgeCheck size={12} />}
                      {s.skill_name}
                    </span>
                  );
                })}
              </div>
              <p className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Passed
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-gray-500" />   passed yet
                </span>
              </p>
            </>
          )}
        </div>
      )}

      <Modal open={!!error} type="error" message={error} onClose={() => setError("")} />
    </div>
  );
}