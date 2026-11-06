import type { Role } from "@/app/lib/auth";

export const roleTheme: Record<Role, { gradient: string; solid: string; ring: string }> = {
  coach: {
    gradient: "from-blue-500 to-indigo-600",
    solid: "bg-blue-600",
    ring: "ring-blue-500",
  },
  learner: {
    gradient: "from-emerald-500 to-teal-600",
    solid: "bg-emerald-600",
    ring: "ring-emerald-500",
  },
  admin: {
    gradient: "from-violet-500 to-purple-600",
    solid: "bg-violet-600",
    ring: "ring-violet-500",
  },
};