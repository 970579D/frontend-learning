"use client";

import { useMemo, useSyncExternalStore } from "react";

export type RequirementKey =
  | "level"
  | "learning_for"
  | "day"
  | "time"
  | "priority"
  | "learning_mode"
  | "place_to_learn"
  | "province";

export type Requirement = Record<RequirementKey, string>;

type Option = { value: string; label: string };

export type Question = {
  key: RequirementKey;
  title: string;
  options: Option[];
};

const PROVINCES = [
  "Amnat Charoen", "Ang Thong", "Bangkok", "Bueng Kan", "Buriram", "Chachoengsao", "Chai Nat",
  "Chaiyaphum", "Chanthaburi", "Chiang Mai", "Chiang Rai", "Chonburi", "Chumphon", "Kalasin",
  "Kamphaeng Phet", "Kanchanaburi", "Khon Kaen", "Krabi", "Lampang", "Lamphun", "Loei", "Lopburi",
  "Mae Hong Son", "Maha Sarakham", "Mukdahan", "Nakhon Nayok", "Nakhon Pathom", "Nakhon Phanom",
  "Nakhon Ratchasima", "Nakhon Sawan", "Nakhon Si Thammarat", "Nan", "Narathiwat", "Nong Bua Lamphu",
  "Nong Khai", "Nonthaburi", "Pathum Thani", "Pattani", "Phang Nga", "Phatthalung", "Phayao",
  "Phetchabun", "Phetchaburi", "Phichit", "Phitsanulok", "Phra Nakhon Si Ayutthaya", "Phrae", "Phuket",
  "Prachinburi", "Prachuap Khiri Khan", "Ranong", "Ratchaburi", "Rayong", "Roi Et", "Sa Kaeo",
  "Sakon Nakhon", "Samut Prakan", "Samut Sakhon", "Samut Songkhram", "Saraburi", "Satun", "Sing Buri",
  "Sisaket", "Songkhla", "Sukhothai", "Suphan Buri", "Surat Thani", "Surin", "Tak", "Trang", "Trat",
  "Ubon Ratchathani", "Udon Thani", "Uthai Thani", "Uttaradit", "Yala", "Yasothon",
];

export const QUESTIONS: Question[] = [
  {
    key: "level",
    title: "What is your learning level?",
    options: [
      { value: "junior_elementary", label: "Junior elementary" },
      { value: "senior_elementary", label: "Senior elementary" },
      { value: "junior_high", label: "Junior high" },
      { value: "senior_high", label: "Senior high" },
      { value: "university", label: "University" },
      { value: "working", label: "Working" },
    ],
  },
  {
    key: "learning_for",
    title: "What are you learning for?",
    options: [
      { value: "exam_preparation", label: "Exam preparation" },
      { value: "skill_development", label: "Skill development" },
      { value: "project_based", label: "Project based learning" },
    ],
  },
  {
    key: "day",
    title: "Which days can you learn?",
    options: [
      { value: "weekdays", label: "Monday - Friday" },
      { value: "weekend", label: "Saturday - Sunday" },
      { value: "everyday", label: "Everyday" },
    ],
  },
  {
    key: "time",
    title: "What time of day suits you?",
    options: [
      { value: "morning", label: "Morning" },
      { value: "afternoon", label: "Afternoon" },
      { value: "evening", label: "Evening" },
      { value: "night", label: "Night" },
      { value: "anytime", label: "Everytime" },
    ],
  },
  {
    key: "priority",
    title: "How soon do you want to start?",
    options: [
      { value: "normal", label: "Normal" },
      { value: "quick", label: "Quick" },
      { value: "urgent", label: "Urgent" },
    ],
  },
  {
    key: "learning_mode",
    title: "How do you want to learn?",
    options: [
      { value: "online", label: "Online" },
      { value: "personal", label: "Personal" },
    ],
  },
  {
    key: "place_to_learn",
    title: "Where do you want to learn?",
    options: [
      { value: "wherever", label: "Wherever" },
      { value: "public", label: "Public" },
      { value: "learner_home", label: "Learner home" },
      { value: "class", label: "Class" },
    ],
  },
  {
    key: "province",
    title: "Which province are you in?",
    options: PROVINCES.map((p) => ({ value: p, label: p })),
  },
];

const KEY = "learner_requirement";
const EVENT = "requirement-change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

function getSnapshot(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

const noopSubscribe = () => () => {};

export function saveRequirement(data: Requirement) {
  sessionStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(EVENT));
}

export function clearRequirement() {
  sessionStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function useRequirement() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const requirement = useMemo<Requirement | null>(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Requirement;
    } catch {
      return null;
    }
  }, [raw]);

  return { requirement, ready };
}