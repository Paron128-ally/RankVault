"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Protected from "@/components/Protected";
import OmrRow from "@/components/OmrRow";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

type WeakChapter = { chapter: string; subject: string; accuracy: number; chapterId: string };
type DashboardData = {
  stats: { streak: number; avgAccuracy: number; syllabusPct: number };
  weak_chapters: WeakChapter[];
  test_name: string;
  last_attempt: any;
};

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="bg-ink-2 border border-white/10 rounded-2xl p-5">
      <p className="text-[10px] uppercase tracking-[0.2em] text-mute font-mono mb-2">{label}</p>
      <p className="font-display text-3xl" style={accent ? { color: accent } : undefined}>
        {value}
      </p>
      {sub && <p className="text-xs text-mute mt-1">{sub}</p>}
    </div>
  );
}

function DashboardBody() {
  const { student } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .dashboard()
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <p className="text-coral text-sm">{error}</p>;
  }
  if (!data) {
    return <p className="text-mute text-sm font-mono">Fetching your scoreboard…</p>;
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-mono mb-2">
          Welcome back
        </p>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight">
          {student?.name?.split(" ")[0]}, here&apos;s today&apos;s scoreboard.
        </h1>
        <p className="text-mute mt-2 max-w-xl">
          Grade {student?.grade} · {student?.track} · {student?.centre}
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-3 gap-4 mt-8">
        <StatCard label="Study streak" value={`${data.stats.streak} days`} />
        <StatCard
          label="Average accuracy"
          value={`${data.stats.avgAccuracy}%`}
          accent={data.stats.avgAccuracy >= 70 ? "var(--verified)" : "var(--coral)"}
        />
        <StatCard label="Syllabus covered" value={`${data.stats.syllabusPct}%`} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-ink-2 border border-white/10 rounded-2xl p-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-mute font-mono mb-4">
            Weakest chapters right now
          </p>
          <div className="space-y-4">
            {data.weak_chapters.map((c) => (
              <div key={c.chapterId} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm">{c.chapter}</p>
                  <p className="text-[11px] text-mute">{c.subject}</p>
                </div>
                <div className="flex items-center gap-2">
                  <OmrRow value={c.accuracy} className="text-coral" />
                  <span className="font-mono text-xs text-coral w-9 text-right">{c.accuracy}%</span>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/packages"
            className="inline-block mt-5 text-xs font-semibold text-gold hover:underline"
          >
            Practice these chapters →
          </Link>
        </div>

        <div className="bg-ink-2 border border-white/10 rounded-2xl p-6 flex flex-col">
          <p className="text-[10px] uppercase tracking-[0.2em] text-mute font-mono mb-4">
            Upcoming test
          </p>
          <p className="font-display text-xl leading-snug">{data.test_name}</p>
          <p className="text-xs text-mute mt-2">Marking: +4 correct / −1 incorrect, NTA pattern.</p>
          {data.last_attempt ? (
            <p className="text-xs text-mute mt-3 font-mono">
              Last attempt: {data.last_attempt.score}/{data.last_attempt.max_score}
            </p>
          ) : (
            <p className="text-xs text-mute mt-3 font-mono">No attempts yet.</p>
          )}
          <Link
            href="/test"
            className="mt-auto inline-block text-center bg-gold text-ink font-semibold text-sm rounded-lg py-2.5 hover:brightness-110 transition mt-5"
          >
            Start test
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Protected>
      <DashboardBody />
    </Protected>
  );
}
