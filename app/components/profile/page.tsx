import { UserRound } from "lucide-react";
import type { ProfileData } from "@/app/lib/api";

type ProfileProps = {
  title: string;
  profile: ProfileData | null;
  loading: boolean;
};

const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString() : "-");

export default function Profile({ title, profile, loading }: ProfileProps) {
  if (loading) {
    return <p className="mt-24 text-center text-gray-400">Loading profile...</p>;
  }
  
  if (!profile) {
    return <p className="mt-24 text-center text-gray-400">No profile data</p>;
  }

  const rows: [string, string][] = [
    ["Username", profile.username],
    ["First name", profile.firstname],
    ["Last name", profile.lastname],
    ...(profile.status ? [["Status", profile.status] as [string, string]] : []),
    ["Created", fmt(profile.create_date)],
    ["Last update", fmt(profile.last_update)],
  ];

  return (
    <div className="mx-auto mt-12 w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-lg shadow-black/40">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white">
          <UserRound size={48} strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-semibold text-white">
          {profile.firstname} {profile.lastname}
        </h1>
        <p className="text-sm text-gray-400">{title}</p>
      </div>

      <dl className="mt-8 divide-y divide-gray-800">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between py-3 text-sm">
            <dt className="text-gray-400">{label}</dt>
            <dd className="text-gray-100">{value}</dd>
          </div>
        ))}
      </dl>

      {profile.skills && (
        <div className="mt-6">
          <h2 className="mb-2 text-sm text-gray-400">Skills</h2>
          {profile.skills.length === 0 ? (
            <p className="text-sm text-gray-500">No skills yet</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s, i) => (
                <span key={i} className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-200">
                  {s.skill_name ?? "-"}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}