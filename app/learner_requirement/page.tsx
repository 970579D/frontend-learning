"use client";

import { useRouter } from "next/navigation";
import QuestionWizard from "@/app/components/requirement/page";
import { useGuestOnly } from "@/app/lib/guest";
import { QUESTIONS, Requirement, saveRequirement } from "@/app/lib/requirement";

export default function LearnerRequirementPage() {
  const router = useRouter();
  const blocked = useGuestOnly();

  function handleFinish(answers: Requirement) {
    saveRequirement(answers);
    router.push("/learner_register");
  }

  if (blocked) {
    return <p className="mt-24 text-center text-gray-400">Loading...</p>;
  }

  return (
    <QuestionWizard title="Tell us what you need" questions={QUESTIONS} onFinish={handleFinish} />
  );
}