"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import OmrRow from "@/components/OmrRow";

type RosterEntry = {
  id: string;
  enrollment: string;
  name: string;
  grade: number;
  track: string;
  centre: string;
};

export default function LandingPage() {
  const { student, loading, login } = useAuth();
  const router = useRouter();

  const [enrollment, setEnrollment] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [demoPassword, setDemoPassword] = useState("");

  useEffect(() => {
    if (!loading && student) router.replace("/dashboard");
  }, [loading, student, router]);

  useEffect(() => {
    api
      .roster()
      .then((res) => {
        setRoster(res.roster.slice(0, 6));
        setDemoPassword(res.demo_password);
      })
      .catch(() => {
        /* API may be cold-starting on a free tier — form still works manually */
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(enrollment, password);
    } catch (err: any) {
      setError(err.message || "Could not sign in. Check your enrollment ID and password.");
    } finally {
      setBusy(false);
    }
  }

  function quickFill(entry: RosterEntry) {
    setEnrollment(entry.enrollment);
    setPassword(demoPassword);
    setError("");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="mx-auto w-full max-w-6xl px-5 pt-8 flex items-center justify-between">
        <span className="font-display text-xl">RankVault</span>
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-mono border border-gold/40 rounded-full px-3 py-1">
          Admit Card Enclosed
        </span>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-5 py-10 md:py-16 grid md:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        {/* Left: pitch + login */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-4xl md:text-5xl leading-[1.08] tracking-tight text-[#EDEEF5]"
          >
            Prep like the exam
            <br />
            is already scoring you.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-mute text-base md:text-lg max-w-md"
          >
            Chapter-wise practice, full mock tests with real +4/&minus;1 marking,
            and a syllabus map that tells you exactly which micro-concept is
            costing you rank — built for JEE &amp; NEET aspirants.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="mt-8 max-w-sm bg-ink-2 border border-white/10 rounded-2xl p-6"
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-mute font-mono mb-4">
              Student sign-in
            </p>
            <label className="block text-xs text-mute mb-1">Enrollment ID</label>
            <input
              value={enrollment}
              onChange={(e) => setEnrollment(e.target.value)}
              placeholder="AP24-1182"
              className="w-full font-mono text-sm bg-ink border border-white/10 rounded-lg px-3 py-2.5 mb-4 outline-none focus:border-gold/60 transition-colors"
              autoComplete="username"
            />
            <label className="block text-xs text-mute mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full font-mono text-sm bg-ink border border-white/10 rounded-lg px-3 py-2.5 mb-4 outline-none focus:border-gold/60 transition-colors"
              autoComplete="current-password"
            />
            {error && <p className="text-coral text-xs mb-3">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-gold text-ink font-semibold text-sm rounded-lg py-2.5 hover:brightness-110 transition disabled:opacity-60"
            >
              {busy ? "Checking hall ticket…" : "Enter exam hall"}
            </button>

            {roster.length > 0 && (
              <div className="mt-5 pt-5 border-t border-white/10">
                <p className="text-[10px] uppercase tracking-[0.2em] text-mute font-mono mb-2">
                  Or try a demo profile
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {roster.map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => quickFill(r)}
                      className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-ink border border-white/10 text-mute hover:text-gold hover:border-gold/40 transition-colors"
                    >
                      {r.name.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.form>
        </div>

        {/* Right: the hall-ticket signature visual */}
        <motion.div
          initial={{ opacity: 0, rotate: -4, y: 30 }}
          animate={{ opacity: 1, rotate: -2, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="rounded-2xl bg-paper text-[#241C0E] shadow-2xl shadow-black/40 border border-black/5 p-6 rotate-2">
            <div className="flex items-center justify-between border-b border-dashed border-[color:var(--rule-paper)] pb-3 mb-4">
              <span className="font-display text-lg">Admit Card</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-mute-2">
                RV / 2026
              </span>
            </div>
            <div className="flex gap-4">
              <div className="w-16 h-20 rounded-md bg-[color:var(--paper-dim)] border border-black/10 flex items-center justify-center text-[9px] text-mute-2 font-mono text-center leading-tight">
                candidate
                <br />
                photo
              </div>
              <div className="flex-1 text-sm space-y-1.5">
                <p className="font-medium">Aarav Mehta</p>
                <p className="font-mono text-xs text-mute-2">Roll No. AP24-1182</p>
                <p className="font-mono text-xs text-mute-2">Track: JEE Main &amp; Advanced</p>
                <p className="font-mono text-xs text-mute-2">Centre: Kandivali</p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-dashed border-[color:var(--rule-paper)]">
              <p className="text-[10px] uppercase tracking-[0.18em] text-mute-2 font-mono mb-2">
                Chapter accuracy — this week
              </p>
              <div className="space-y-2 text-[#241C0E]">
                {[
                  { name: "Rotational Mechanics", pct: 92 },
                  { name: "Current Electricity", pct: 58 },
                  { name: "Ionic Equilibrium", pct: 74 },
                ].map((c) => (
                  <div key={c.name} className="flex items-center justify-between gap-3">
                    <span className="text-xs">{c.name}</span>
                    <OmrRow value={c.pct} className="text-[#8A5A1E]" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute -bottom-4 -right-4 w-full h-full rounded-2xl bg-ink-3 -z-10 rotate-6" />
        </motion.div>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-5 pb-8 text-xs text-mute">
        Frontend Battle 2026 submission — RankVault, an exam-prep platform for
        JEE/NEET aspirants.
      </footer>
    </div>
  );
}
