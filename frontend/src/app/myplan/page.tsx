"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import OmrRow from "@/components/OmrRow";
import { api } from "@/lib/api";

type Chapter = {
  id: string; name: string; status: "active" | "expired" | "upcoming";
  microConcepts: { name: string; accuracy: number }[];
};
type Subject = { name: string; color: string; chapters: Chapter[] };
type ChapterStat = { accuracy: number; progress: number; status: string };

const STATUS_LABEL: Record<string, string> = {
  active: "In progress", expired: "Completed", upcoming: "Not yet live",
};

function MyPlanBody() {
  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [chapterStats, setChapterStats] = useState<Record<string, ChapterStat>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .myplan()
      .then((res) => {
        setSubjects(res.subjects);
        setChapterStats(res.stats.chapterStats);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-coral text-sm">{error}</p>;
  if (!subjects) return <p className="text-mute text-sm font-body">Mapping your syllabus…</p>;

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-body mb-2">myPlan</p>
      <h1 className="font-display text-3xl md:text-4xl tracking-tight mb-2">
        The whole syllabus, one map.
      </h1>
      <p className="text-mute max-w-xl mb-8">
        Tap a chapter to see which micro-concept inside it is actually
        dragging your accuracy down.
      </p>

      <div className="space-y-8">
        {subjects.map((subj) => (
          <div key={subj.name}>
            <h2 className="text-xs uppercase tracking-[0.2em] font-body text-mute mb-3">{subj.name}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {subj.chapters.map((ch) => {
                const stat = chapterStats[ch.id];
                const isOpen = expanded === ch.id;
                const locked = ch.status === "upcoming";
                return (
                  <div key={ch.id} className="border border-black/10 rounded-2xl bg-ink-2 p-4">
                    <button
                      onClick={() => !locked && setExpanded(isOpen ? null : ch.id)}
                      disabled={locked}
                      className="w-full text-left flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{ch.name}</p>
                        <p className="text-[11px] text-mute">{STATUS_LABEL[ch.status]}</p>
                      </div>
                      {!locked && stat && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <OmrRow value={stat.progress} className="text-gold" />
                          <span className="font-body text-[11px] text-mute w-9 text-right">{stat.progress}%</span>
                        </div>
                      )}
                    </button>
                    {isOpen && (
                      <div className="mt-3 pt-3 border-t border-black/10 space-y-2">
                        {ch.microConcepts.map((mc) => (
                          <div key={mc.name} className="flex items-center justify-between gap-3">
                            <span className="text-xs text-mute">{mc.name}</span>
                            <div className="flex items-center gap-2">
                              <OmrRow
                                value={mc.accuracy}
                                className={mc.accuracy >= 70 ? "text-verified" : "text-coral"}
                                animate={false}
                              />
                              <span className="font-body text-[11px] text-mute w-9 text-right">{mc.accuracy}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MyPlanPage() {
  return (
    <Protected>
      <MyPlanBody />
    </Protected>
  );
}
