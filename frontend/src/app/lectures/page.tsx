"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { api } from "@/lib/api";

type Lecture = {
  id: string; youtube_url: string; subject: string; chapter: string;
  title: string; faculty: string; duration: string; watched: number; recordedOn: string;
};

function parseDuration(d: string): number {
  const parts = d.split(":").map(Number);
  return parts.reduce((acc, p) => acc * 60 + p, 0);
}

function LectureRow({ lec, onToggle }: { lec: Lecture; onToggle: (id: string, done: boolean) => void }) {
  const total = parseDuration(lec.duration);
  const done = lec.watched >= total && total > 0;
  const pct = total > 0 ? Math.min(100, Math.round((lec.watched / total) * 100)) : 0;

  return (
    <div className="border border-white/10 rounded-xl bg-ink-2 p-4 flex items-center gap-4">
      <button
        onClick={() => onToggle(lec.id, !done)}
        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs transition-colors ${
          done ? "bg-verified border-verified text-ink" : "border-white/25 text-transparent"
        }`}
        aria-label={done ? "Mark unwatched" : "Mark watched"}
      >
        ✓
      </button>
      <div className="flex-1 min-w-0">
        <a href={lec.youtube_url} target="_blank" rel="noreferrer" className="text-sm font-medium hover:text-gold transition-colors">
          {lec.title}
        </a>
        <p className="text-[11px] text-mute mt-0.5">
          {lec.subject} · {lec.chapter} · {lec.faculty} · {lec.duration}
        </p>
        <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="text-[10px] font-mono text-mute flex-shrink-0">{lec.recordedOn}</span>
    </div>
  );
}

function LecturesBody() {
  const [lectures, setLectures] = useState<Lecture[] | null>(null);
  const [filter, setFilter] = useState<string>("All");
  const [error, setError] = useState("");

  useEffect(() => {
    api.lectures().then((res) => setLectures(res.lectures)).catch((e) => setError(e.message));
  }, []);

  async function handleToggle(id: string, done: boolean) {
    const lec = lectures?.find((l) => l.id === id);
    if (!lec) return;
    const total = parseDuration(lec.duration);
    const watched = done ? total : 0;
    setLectures((prev) => prev!.map((l) => (l.id === id ? { ...l, watched } : l)));
    try {
      await api.saveLectureProgress(id, watched);
    } catch {
      setLectures((prev) => prev!.map((l) => (l.id === id ? { ...l, watched: lec.watched } : l)));
    }
  }

  if (error) return <p className="text-coral text-sm">{error}</p>;
  if (!lectures) return <p className="text-mute text-sm font-mono">Loading recorded lectures…</p>;

  const subjects = ["All", ...Array.from(new Set(lectures.map((l) => l.subject)))];
  const filtered = filter === "All" ? lectures : lectures.filter((l) => l.subject === filter);

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-mono mb-2">Recorded Lectures</p>
      <h1 className="font-display text-3xl md:text-4xl tracking-tight mb-6">Catch up at your own pace.</h1>

      <div className="flex gap-2 mb-6">
        {subjects.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              filter === s ? "bg-gold text-ink border-gold" : "border-white/10 text-mute hover:text-[#EDEEF5]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((lec) => (
          <LectureRow key={lec.id} lec={lec} onToggle={handleToggle} />
        ))}
      </div>
    </div>
  );
}

export default function LecturesPage() {
  return (
    <Protected>
      <LecturesBody />
    </Protected>
  );
}
