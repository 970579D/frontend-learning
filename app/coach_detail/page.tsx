"use client";

import { useRouter } from "next/navigation";
import QuestionWizard from "@/app/components/requirement/page";
import { COACH_QUESTIONS, CoachDetail, saveCoachDetail } from "@/app/lib/coach_detail";
import { useGuestOnly } from "@/app/lib/guest";

export default function CoachDetailPage() {
  const router = useRouter();
  const blocked = useGuestOnly();

  function handleFinish(answers: CoachDetail) {
    saveCoachDetail(answers);
    router.push("/coach_register");
  }

  if (blocked) {
    return <p className="mt-24 text-center text-gray-400">Loading...</p>;
  }

  return (
    <QuestionWizard title="Tell learners about you" questions={COACH_QUESTIONS} onFinish={handleFinish} />
  );
}