"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft } from "lucide-react";
import CustomSelect from "@/app/components/custom_select/page";
import type { Question } from "@/app/lib/requirement";

type WizardProps<T extends Record<string, string>> = {
  title: string;
  questions: Question[];
  onFinish: (answers: T) => void;
};

const SEARCH_AFTER = 8;

const fieldClass =
  "w-full rounded-lg border border-gray-700 bg-gray-800 p-3.5 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-blue-500";

function isValid(question: Question, value: string): boolean {
  if (question.type === "text") return value.trim() !== "";
  if (question.type === "number") {
    const n = Number(value);
    return (
      value !== "" &&
      Number.isInteger(n) &&
      n >= 0 &&
      n <= (question.max ?? Number.MAX_SAFE_INTEGER)
    );
  }
  return value !== "";
}

export default function QuestionWizard<T extends Record<string, string>>({
  title,
  questions,
  onFinish,
}: WizardProps<T>) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const question = questions[step];
  const value = answers[question.key] ?? "";
  const options = question.options ?? [];
  const isLast = step === questions.length - 1;
  const searchable = options.length > SEARCH_AFTER;
  const valid = isValid(question, value);

  function choose(next: string) {
    setAnswers({ ...answers, [question.key]: next });
  }

  function handleNext(e: FormEvent) {
    e.preventDefault();
    if (!valid) return;

    if (isLast) {
      const cleaned = Object.fromEntries(
        Object.entries(answers).map(([key, text]) => [key, text.trim()]),
      );
      onFinish(cleaned as T);
      return;
    }
    setStep(step + 1);
  }

  return (
    <form
      onSubmit={handleNext}
      className="mx-auto mt-16 w-full max-w-[550px] rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-lg shadow-black/40"
    >
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="mt-1 text-sm text-gray-400">
        Question {step + 1} of {questions.length}
      </p>

      <h3 className="mt-6 text-lg font-medium text-gray-100">
        {step + 1}. {question.title}
      </h3>

      {question.type === "text" ? (
        <div key={question.key} className="mt-4">
          <textarea
            value={value}
            rows={6}
            maxLength={question.max}
            placeholder={question.placeholder}
            onChange={(e) => choose(e.target.value)}
            autoFocus
            className={`${fieldClass} resize-none`}
          />
          {question.max && (
            <p className="mt-1 text-right text-xs text-gray-500">
              {value.length}/{question.max}
            </p>
          )}
        </div>
      ) : question.type === "number" ? (
        <div key={question.key} className="mt-4 flex items-center gap-3">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={question.max}
            step={1}
            value={value}
            placeholder={question.placeholder}
            onChange={(e) => choose(e.target.value)}
            autoFocus
            className={fieldClass}
          />
          {question.unit && <span className="whitespace-nowrap text-sm text-gray-400">{question.unit}</span>}
        </div>
      ) : searchable ? (
        <div className="mt-4">
          <CustomSelect
            key={question.key}
            options={options}
            value={value}
            onChange={choose}
            placeholder="Select an option"
            ariaLabel={question.title}
          />
        </div>
      ) : (
        <div key={question.key} role="radiogroup" aria-label={question.title} className="mt-3">
          {options.map((o, i) => {
            const selected = value === o.value;
            return (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => choose(o.value)}
                className={`my-2.5 block w-full rounded-lg border p-3.5 text-left text-sm transition ${
                  selected
                    ? "border-blue-500 bg-blue-500/15 text-white"
                    : "border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-500 hover:bg-gray-800"
                }`}
              >
                <span className="mr-2 font-medium text-gray-500">{String.fromCharCode(65 + i)}.</span>
                {o.label}
              </button>
            );
          })}
        </div>
      )}

      <button
        type="submit"
        disabled={!valid}
        className="mt-5 w-full rounded-lg bg-blue-600 p-3.5 font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
      >
        {isLast ? "Finish" : "Next Question →"}
      </button>

      {step > 0 && (
        <button
          type="button"
          onClick={() => setStep(step - 1)}
          className="mx-auto mt-3 flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200"
        >
          <ArrowLeft size={14} />
          Previous question
        </button>
      )}
    </form>
  );
}