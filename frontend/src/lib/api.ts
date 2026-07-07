// Thin fetch wrapper for the RankVault Flask API.
// Token lives in localStorage — simple by design for a hackathon demo
// (see conversation: cross-origin session cookies were more friction
// than value here). Swap for httpOnly cookies + refresh tokens for prod.

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
const TOKEN_KEY = "rankvault_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.error || message;
    } catch {
      /* noop */
    }
    if (res.status === 401) clearToken();
    throw new ApiError(message, res.status);
  }
  return res.json() as Promise<T>;
}

export const api = {
  roster: () => apiFetch<{ roster: any[]; demo_password: string }>("/api/auth/roster"),
  login: (enrollment: string, password: string) =>
    apiFetch<{ token: string; student: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ enrollment, password }),
    }),
  logout: () => apiFetch<{ ok: true }>("/api/auth/logout", { method: "POST" }),
  me: () => apiFetch<{ student: any }>("/api/auth/me"),
  dashboard: () => apiFetch<any>("/api/dashboard"),
  packages: () => apiFetch<any>("/api/packages"),
  togglePracticed: (chapterId: string, problemId: string, done: boolean) =>
    apiFetch<any>("/api/packages/practiced", {
      method: "POST",
      body: JSON.stringify({ chapterId, problemId, done }),
    }),
  lectures: () => apiFetch<any>("/api/lectures"),
  saveLectureProgress: (lectureId: string, watchedSec: number) =>
    apiFetch<any>("/api/lectures/progress", {
      method: "POST",
      body: JSON.stringify({ lectureId, watchedSec }),
    }),
  myplan: () => apiFetch<any>("/api/myplan"),
  testEngine: () => apiFetch<any>("/api/test-engine"),
  submitTest: (answers: Record<string, number | null>) =>
    apiFetch<any>("/api/test-engine/submit", {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),
  testHistory: () => apiFetch<any>("/api/test-engine/history"),
};
