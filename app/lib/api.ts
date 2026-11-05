export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type LoginRequest = {
  username: string;
  password: string;
};

export type RegisterRequest = LoginRequest & {
  firstname: string;
  lastname: string;
};

export type ApiResponse<T = unknown> = {
  status: "success" | "error";
  message: string;
  data: T | null;
};

export type LoginData = {
  id: number;                    // row id, not used by the frontend
  username: string;
  session: string;               // uuid, used to log out
  login_date: string;
  logout_date: string | null;
};

export type ProfileData = {
  id?: number;
  username: string;
  firstname: string;
  lastname: string;
  status?: string;          // coach only
  create_date: string;
  update_date: string;
  image_path: string | null;
  skills?: { skill_name: string; status: string }[];   // coach only
};

export type AttemptData = {
  id: number;
  assessment_uuid: string;
  assessment_skill: string;
  round_attempt: number;
  score: number;
  status: "pass" | "fail";
  create_date: string;
  update_date: string;
};

export type AssessmentData = {
  id: number;
  uuid: string;
  assessment_skill: string;
  assessment_skill_category: string;
  status: "pending" | "pass" | "fail";
  total_attempt: number;
  attemps: AttemptData[];
};

// success only counts when the server also returned data
export const isSuccess = (res: ApiResponse<unknown>) =>
  res.status === "success" && res.data !== null;

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    // server down, wrong URL, or blocked by CORS
    return { status: "error", message: "Cannot reach the server", data: null };
  }

  const body = await res.json().catch(() => null);

  // your backend envelope: { status, message, data }
  if (body && typeof body.status === "string") {
    return body as ApiResponse<T>;
  }

  // FastAPI default errors: { detail: "..." } or [{ msg }] for 422
  if (!res.ok) {
    const detail = body?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((d: { msg: string }) => d.msg).join(", ")
          : `Request failed (${res.status})`;   // status shows what really happened, e.g. 500
    return { status: "error", message, data: null };
  }

  return { status: "success", message: "OK", data: body as T };
}

  

export const api = {
  login_coach: (body: LoginRequest) =>
    request<LoginData>("/login/coach", { method: "POST", body: JSON.stringify(body) }),

  login_learner: (body: LoginRequest) =>
    request<LoginData>("/login/learner", { method: "POST", body: JSON.stringify(body) }),

  register_coach: (body: RegisterRequest) =>
    request<unknown>("/coach", { method: "POST", body: JSON.stringify(body) }),

  register_learner: (body: RegisterRequest) =>
    request<unknown>("/learner", { method: "POST", body: JSON.stringify(body) }),

  logout_coach: (session: string) =>
    request<unknown>("/login/logout/coach", { method: "PUT", body: JSON.stringify({ session }) }),

  logout_learner: (session: string) =>
    request<unknown>("/login/logout/learner", { method: "PUT", body: JSON.stringify({ session }) }),

  get_coach: (username: string) =>
    request<ProfileData>(`/coach/${encodeURIComponent(username)}`, { method: "GET" }),

  get_learner: (username: string) =>
    request<ProfileData>(`/learner/${encodeURIComponent(username)}`, { method: "GET" }),

  image_coach: (username: string, imagePath: string | null) =>
    request<{ username: string; image_path: string | null }>("/coach/image", {
      method: "PUT",
      body: JSON.stringify({ username, image_path: imagePath }),
    }),

  image_learner: (username: string, imagePath: string | null) =>
    request<{ username: string; image_path: string | null }>("/learner/image", {
      method: "PUT",
      body: JSON.stringify({ username, image_path: imagePath }),
    }),

  get_coach_assessment: (username: string) =>
    request<AssessmentData[]>(`/coach/assessment/${encodeURIComponent(username)}`, { method: "GET" }),
};