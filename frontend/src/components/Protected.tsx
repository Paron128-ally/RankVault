"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Nav from "./Nav";

export default function Protected({ children }: { children: React.ReactNode }) {
  const { student, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !student) router.replace("/");
  }, [loading, student, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-mute font-body text-sm">
        Issuing hall ticket…
      </div>
    );
  }
  if (!student) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 mx-auto w-full max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
