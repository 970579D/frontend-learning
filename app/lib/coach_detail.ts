"use client";

import { createDraftStore } from "@/app/lib/draft";
import { Question, QUESTIONS, RequirementKey } from "@/app/lib/requirement";

const optionsOf = (key: RequirementKey) => QUESTIONS.find((q) => q.key === key)?.options ?? [];

export type CoachDetailKey =
  | "about_coach"
  | "course_description"
  | "cost"
  | "place_to_coach"
  | "coaching_mode";

export type CoachDetail = Record<CoachDetailKey, string>;

export const COACH_QUESTIONS: Question[] = [
  {
    key: "about_coach",
    title: "Tell learners about yourself",
    type: "text",
    placeholder: "Your experience, teaching style and what learners can expect",
    max: 1000,
  },
  {
    key: "cost",
    title: "What cost do you expect for coaching?",
    type: "number",
    unit: "THB per hour",
    placeholder: "e.g. 500",
    max: 100000,
  },
  {
    key: "course_description",
    title: "Describe the course you will teach",
    type: "text",
    placeholder: "What you will teach, the lesson plan, how long it takes and what learners need to prepare",
    max: 2000,
  },
  {
    key: "place_to_coach",
    title: "Where do you want to coach?",
    options: optionsOf("place_to_learn"),
  },
  {
    key: "coaching_mode",
    title: "How do you want to coach?",
    options: optionsOf("learning_mode"),
  },
];

const store = createDraftStore<CoachDetail>("coach_detail");

export const saveCoachDetail = store.save;
export const clearCoachDetail = store.clear;
export const useCoachDetail = store.useDraft;