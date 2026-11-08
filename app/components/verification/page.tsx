import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { AssessmentData, AttemptData } from "@/app/lib/api";

const badge = {
  pass: { label: "Passed", cls: "bg-emerald-900/60 text-emerald-300 ring-1 ring-emerald-500/50", Icon: CheckCircle2 },
  fail: { label: "Not passed", cls: "bg-red-900/50 text-red-300 ring-1 ring-red-500/40", Icon: XCircle },
  pending: { label: "Pending", cls: "bg-gray-800 text-gray-300", Icon: Clock },
} as const;

const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString() : "-");

type VerificationProps = {
  items: AssessmentData[];
  loading: boolean;
};

export default function Verification({ items, loading }: VerificationProps) {
  if (loading) {
    return <p className="mt-24 text-center text-gray-400">Loading...</p>;
  }

  return (
    <div className="mx-auto mt-12 w-full max-w-3xl px-4">
      <h1 className="mb-6 text-2xl font-semibold text-white">Skill verification</h1>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center text-gray-400">
          No assessments yet
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((a) => {
            const b = badge[a.status] ?? badge.pending;
            const best = a.attemps.reduce<AttemptData | null>(
              (m, t) => (!m || t.score / t.total_score > m.score / m.total_score ? t : m),
              null,
            );

            return (
              <div key={a.uuid} className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{a.assessment_skill}</h2>
                    <p className="text-sm text-gray-400">{a.assessment_skill_category}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ${b.cls}`}>
                    <b.Icon size={14} />
                    {b.label}
                  </span>
                </div>

                <p className="mt-3 text-xs text-gray-500">
                  {a.total_attempt} attempt{a.total_attempt === 1 ? "" : "s"}
                  {best && ` · best ${best.score}/${best.total_score}`}
                </p>

                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer text-gray-400 hover:text-gray-200">
                    Attempt history
                  </summary>

                  {a.attemps.length === 0 ? (
                    <p className="mt-3 text-gray-500">No attempts yet</p>
                  ) : (
                    <ul className="mt-3 divide-y divide-gray-800">
                      {a.attemps.map((t) => (
                        <li key={t.id} className="flex items-center justify-between py-2">
                          <span className="text-gray-300">
                            #{t.round_attempt} · {t.score}/{t.total_score}
                            <span className="ml-2 text-xs text-gray-500">{fmt(t.create_date)}</span>
                          </span>
                          <span className={t.status === "pass" ? "text-emerald-400" : "text-red-400"}>
                            {t.status === "pass" ? "Pass" : "Fail"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </details>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}