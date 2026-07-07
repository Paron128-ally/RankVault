"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api, getToken, setToken, clearToken } from "./api";

type Student = {
  id: string;
  name: string;
  enrollment: string;
  grade: number;
  track: string;
  centre: string;
};

type AuthState = {
  student: Student | null;
  loading: boolean;
  login: (enrollment: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then((res) => setStudent(res.student))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(enrollment: string, password: string) {
    const res = await api.login(enrollment, password);
    setToken(res.token);
    setStudent(res.student);
    router.push("/dashboard");
  }

  async function logout() {
    try {
      await api.logout();
    } catch {
      /* token may already be dead — proceed anyway */
    }
    clearToken();
    setStudent(null);
    router.push("/");
  }

  return (
    <AuthContext.Provider value={{ student, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
