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
  id: number;
  username: string;
  session: string;
  login_date: string;
  logout_date: string | null;
};

export type ProfileData = {
  id?: number;
  username: string;
  firstname: string;
  lastname: string;
  status?: string;
  image_path?: string | null;
  create_date: string;
  update_date: string;
  skills?: { skill_name: string; status: "active" | "inactive" }[];
};

export type ImageData = {
  username: string;
  image_path: string | null;
};

export type AttemptData = {
  id: number;
  assessment_uuid: string;
  assessment_skill: string;
  round_attempt: number;
  score: number;
  total_score: number;
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

export type CategoryData = {
  id: number;
  category_name: string;
  create_date: string;
};

export type SkillData = {
  id: number;
  skill_name: string;
  category_name: string;
  create_date: string;
};

export type ExamSession = {
  uuid: string;
  exam_time: string;
  skill: string;
  total_score: number;
  pass_percent: number;
  pass_score: number;
  status: "open" | "closed" | "finished";
  booking_count: number;
  booked: boolean;
  passed: boolean;
};

export type ExamBooking = {
  uuid: string;
  username: string;
  session_uuid: string;
  skill: string;
  exam_time: string;
  session_status: "open" | "closed" | "finished";
  checked_in: boolean;
  verified: boolean;
  assessed: boolean;
};

export type ExamResult = {
  username: string;
  skill: string;
  round_attempt: number;
  score: number;
  total_score: number;
  status: "pass" | "fail";
};

export type ExamAssessment = {
  booking_uuid: string;
  username: string;
  skill: string;
  exam_time: string;
  total_score: number;
  pass_score: number;
  assessed: boolean;
  round_attempt: number | null;
  score: number | null;
  result: "pass" | "fail" | null;
};

export const isSuccess = (res: ApiResponse<unknown>) =>
  res.status === "success" && res.data !== null;

export const imageUrl = (path?: string | null) =>
  !path ? null : path.startsWith("data:") ? path : `${API_URL}/uploads/avatars/${path}`;

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const isForm = options.body instanceof FormData;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: isForm ? options.headers : { "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    return { status: "error", message: "Cannot reach the server", data: null };
  }

  const body = await res.json().catch(() => null);

  if (body && typeof body.status === "string") {
    return body as ApiResponse<T>;
  }

  if (!res.ok) {
    const detail = body?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((d: { msg: string }) => d.msg).join(", ")
          : `Request failed (${res.status})`;
    return { status: "error", message, data: null };
  }

  return { status: "success", message: "OK", data: body as T };
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  body: JSON.stringify(body),
});

const upload = (file: Blob): RequestInit => {
  const form = new FormData();
  form.append("file", file, "avatar.jpg");
  return { method: "PUT", body: form };
};

const enc = encodeURIComponent;

export const api = {
  login_coach: (body: LoginRequest) => request<LoginData>("/login/coach", json("POST", body)),
  login_learner: (body: LoginRequest) => request<LoginData>("/login/learner", json("POST", body)),
  login_admin: (body: LoginRequest) => request<LoginData>("/login/admin", json("POST", body)),

  logout_coach: (session: string) => request<unknown>("/login/logout/coach", json("PUT", { session })),
  logout_learner: (session: string) => request<unknown>("/login/logout/learner", json("PUT", { session })),
  logout_admin: (session: string) => request<unknown>("/login/logout/admin", json("PUT", { session })),

  register_coach: (body: RegisterRequest) => request<unknown>("/coach", json("POST", body)),
  register_learner: (body: RegisterRequest) => request<unknown>("/learner", json("POST", body)),

  get_coach: (username: string) => request<ProfileData>(`/coach/${enc(username)}`, { method: "GET" }),
  get_learner: (username: string) => request<ProfileData>(`/learner/${enc(username)}`, { method: "GET" }),

  image_coach: (username: string, file: Blob) =>
    request<ImageData>(`/coach/image/${enc(username)}`, upload(file)),
  image_learner: (username: string, file: Blob) =>
    request<ImageData>(`/learner/image/${enc(username)}`, upload(file)),
  remove_image_coach: (username: string) =>
    request<ImageData>(`/coach/image/${enc(username)}`, { method: "DELETE" }),
  remove_image_learner: (username: string) =>
    request<ImageData>(`/learner/image/${enc(username)}`, { method: "DELETE" }),

  get_coach_assessment: (username: string) =>
    request<AssessmentData[]>(`/coach/assessment/${enc(username)}`, { method: "GET" }),

  catalog_categories: () => request<CategoryData[]>("/skill/category"),
  catalog_create_category: (category_name: string) =>
    request<CategoryData>("/skill/category", json("POST", { category_name })),
  catalog_skills: () => request<SkillData[]>("/skill"),
  catalog_create_skill: (skill_name: string, category_name: string) =>
    request<SkillData>("/skill", json("POST", { skill_name, category_name })),

  exam_create_session: (body: { skill: string; exam_time: string; total_score: number; pass_percent: number }) =>
    request<ExamSession>("/exam/session", json("POST", body)),
  exam_sessions: () => request<ExamSession[]>("/exam/session"),
  exam_set_status: (uuid: string, status: ExamSession["status"]) =>
    request<ExamSession>(`/exam/session/${uuid}/status`, json("PUT", { status })),
  exam_session_bookings: (uuid: string) =>
    request<ExamBooking[]>(`/exam/session/${uuid}/booking`),
  exam_verify: (bookingUuid: string, verify: boolean) =>
    request<ExamBooking>(`/exam/check-in/${bookingUuid}/verify`, json("PUT", { verify })),
  exam_assessments: () => request<ExamAssessment[]>("/exam/assessment"),
  exam_result: (bookingUuid: string, score: number) =>
    request<ExamResult>("/exam/result", json("POST", { booking_uuid: bookingUuid, score })),

  exam_open: (username: string) => request<ExamSession[]>(`/exam/open/${enc(username)}`),
  exam_my_bookings: (username: string) => request<ExamBooking[]>(`/exam/booking/${enc(username)}`),
  exam_book: (username: string, sessionUuid: string) =>
    request<ExamBooking>("/exam/booking", json("POST", { username, session_uuid: sessionUuid })),
  exam_check_in: (username: string, bookingUuid: string) =>
    request<ExamBooking>("/exam/check-in", json("POST", { username, booking_uuid: bookingUuid })),
};