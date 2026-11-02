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
  login_id?: number;
  username: string;
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
          : "Request failed";
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

  logout: (loginId: number) =>
    request<unknown>("/logout", { method: "POST", body: JSON.stringify({ login_id: loginId }) }),
};