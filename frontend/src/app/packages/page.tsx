"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Protected from "@/components/Protected";
import OmrRow from "@/components/OmrRow";
import { api } from "@/lib/api";

type Chapter = {
  id: string; name: string; status: "active" | "expired" | "upcoming";
  accuracy: number; progress: number; cppDone: number; cppTotal: number;
  microConcepts: { name: string; accuracy: number }[];
};
type Subject = { name: string; color: string; chapters: Chapter[] };
type CppBank = Record<string, {
  subjective: { id: string; marks: number; text: string }[];
  objective: { id: string; text: string; options: string[]; answer: number; solution: string }[];
}>;

function ObjectiveQuestion({ q }: { q: CppBank[string]["objective"][number] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  return (
    <div className="border border-white/10 rounded-xl p-4 bg-ink">
      <p className="text-sm mb-3">{q.text}</p>
      <div className="grid sm:grid-cols-2 gap-2">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.answer;
          const isPicked = i === selected;
          let cls = "border-white/10 text-mute hover:border-white/30";
          if (answered && isCorrect) cls = "border-verified/60 bg-verified-soft text-[#EDEEF5]";
          else if (answered && isPicked && !isCorrect) cls = "border-coral/60 bg-coral-soft text-[#EDEEF5]";
          return (
            <button
              key={i}
              onClick={() => setSelected(i)}
              disabled={answered}
              className={`text-left text-xs rounded-lg border px-3 py-2 transition-colors ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {answered && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-mute mt-3 leading-relaxed"
          >
            {q.solution}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function SubjectiveQuestion({
  q, chapterId, practiced, onToggle,
}: {
  q: { id: string; marks: number; text: string };
  chapterId: string;
  practiced: boolean;
  onToggle: (done: boolean) => void;
}) {
  return (
    <div className="border border-white/10 rounded-xl p-4 bg-ink flex gap-3">
      <button
        onClick={() => onToggle(!practiced)}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-[10px] transition-colors ${
          practiced ? "bg-verified border-verified text-ink" : "border-white/25 text-transparent"
        }`}
        aria-label={practiced ? "Marked practiced" : "Mark as practiced"}
      >
        ✓
      </button>
      <div>
        <p className={`text-sm ${practiced ? "text-mute line-through decoration-white/20" : ""}`}>{q.text}</p>
        <p className="text-[10px] font-mono text-gold mt-1">{q.marks} marks</p>
      </div>
    </div>
  );
}

function ChapterCard({
  chapter, subjectColor, bank, practicedSet, onTogglePracticed,
}: {
  chapter: Chapter;
  subjectColor: string;
  bank: CppBank[string] | undefined;
  practicedSet: Set<string>;
  onTogglePracticed: (chapterId: string, problemId: string, done: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"subjective" | "objective">("subjective");
  const locked = chapter.status === "upcoming";

  return (
    <div className="border border-white/10 rounded-2xl bg-ink-2 overflow-hidden">
      <button
        onClick={() => !locked && setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
        disabled={locked}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ background: subjectColor }} />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{chapter.name}</p>
            <p className="text-[11px] text-mute font-mono">
              {locked ? "Unlocks when live in class" : `${chapter.cppDone}/${chapter.cppTotal} CPP done`}
            </p>
          </div>
        </div>
        {!locked && (
          <div className="flex items-center gap-3 flex-shrink-0">
            <OmrRow value={chapter.accuracy} className={chapter.accuracy >= 70 ? "text-verified" : "text-coral"} />
            <span className="font-mono text-xs w-9 text-right text-mute">{chapter.accuracy}%</span>
            <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-mute text-xs">▾</motion.span>
          </div>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && !locked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10"
          >
            <div className="p-5">
              {!bank ? (
                <p className="text-xs text-mute">No subjective/objective set published yet for this chapter.</p>
              ) : (
                <>
                  <div className="flex gap-1 mb-4">
                    {(["subjective", "objective"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-md capitalize transition-colors ${
                          tab === t ? "bg-ink-3 text-[#EDEEF5]" : "text-mute"
                        }`}
                      >
                        {t} ({bank[t].length})
                      </button>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {tab === "subjective"
                      ? bank.subjective.map((q) => (
                          <SubjectiveQuestion
                            key={q.id}
                            q={q}
                            chapterId={chapter.id}
                            practiced={practicedSet.has(`${chapter.id}:${q.id}`)}
                            onToggle={(done) => onTogglePracticed(chapter.id, q.id, done)}
                          />
                        ))
                      : bank.objective.map((q) => <ObjectiveQuestion key={q.id} q={q} />)}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PackagesBody() {
  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [cppBank, setCppBank] = useState<CppBank>({});
  const [practicedSet, setPracticedSet] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .packages()
      .then((res) => {
        setSubjects(res.subjects);
        setCppBank(res.cpp_bank);
        setPracticedSet(new Set(res.practiced as string[]));
      })
      .catch((e) => setError(e.message));
  }, []);

  async function handleToggle(chapterId: string, problemId: string, done: boolean) {
    const key = `${chapterId}:${problemId}`;
    setPracticedSet((prev) => {
      const next = new Set(prev);
      if (done) next.add(key); else next.delete(key);
      return next;
    });
    try {
      await api.togglePracticed(chapterId, problemId, done);
    } catch {
      // best-effort — revert on failure
      setPracticedSet((prev) => {
        const next = new Set(prev);
        if (done) next.delete(key); else next.add(key);
        return next;
      });
    }
  }

  if (error) return <p className="text-coral text-sm">{error}</p>;
  if (!subjects) return <p className="text-mute text-sm font-mono">Loading chapter practice…</p>;

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-mono mb-2">Chapter Practice Problems</p>
      <h1 className="font-display text-3xl md:text-4xl tracking-tight mb-2">
        Every chapter, scored like the real thing.
      </h1>
      <p className="text-mute max-w-xl mb-8">
        Subjective sets to work through on paper, objective sets that grade
        themselves. Progress is saved to your account, not just this browser.
      </p>

      <div className="space-y-10">
        {subjects.map((subj) => (
          <div key={subj.name}>
            <h2 className="text-xs uppercase tracking-[0.2em] font-mono text-mute mb-3">{subj.name}</h2>
            <div className="space-y-3">
              {subj.chapters.map((ch) => (
                <ChapterCard
                  key={ch.id}
                  chapter={ch}
                  subjectColor={subj.color}
                  bank={cppBank[ch.id]}
                  practicedSet={practicedSet}
                  onTogglePracticed={handleToggle}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PackagesPage() {
  return (
    <Protected>
      <PackagesBody />
    </Protected>
  );
}
