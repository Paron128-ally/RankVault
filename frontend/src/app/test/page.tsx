"use client";

import { useEffect, useRef, useState } from "react";
import Protected from "@/components/Protected";
import { api } from "@/lib/api";

type Question = { id: number; subject: string; text: string; options: string[] };
type ReviewItem = {
  id: number; text: string; options: string[]; answer: number; selected: number | null;
};
type Result = {
  score: number; max_score: number; correct: number; incorrect: number;
  unattempted: number; review: ReviewItem[];
};

function formatTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function TestBody() {
  const [phase, setPhase] = useState<"intro" | "running" | "result">("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [testName, setTestName] = useState("");
  const [duration, setDuration] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    api
      .testEngine()
      .then((res) => {
        setQuestions(res.questions);
        setTestName(res.test_name);
        setDuration(res.duration_sec);
        setTimeLeft(res.duration_sec);
      })
      .catch((e) => setError(e.message));
  }, []);

  function startTest() {
    setPhase("running");
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  async function handleSubmit() {
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const res = await api.submitTest(answers);
      setResult(res);
      setPhase("result");
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  if (error) return <p className="text-coral text-sm">{error}</p>;

  if (phase === "intro") {
    return (
      <div className="max-w-lg">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-body mb-2">Test Engine</p>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight mb-3">{testName || "Loading test…"}</h1>
        <div className="bg-ink-2 border border-black/10 rounded-2xl p-5 space-y-2 text-sm text-mute">
          <p>{questions.length} questions · {formatTime(duration)} duration</p>
          <p>Marking scheme: <span className="text-verified font-body">+4</span> correct, <span className="text-coral font-body">−1</span> incorrect, 0 unattempted.</p>
        </div>
        <button
          onClick={startTest}
          disabled={questions.length === 0}
          className="mt-5 bg-gold text-deep font-semibold text-sm rounded-lg px-6 py-2.5 hover:brightness-110 transition disabled:opacity-60"
        >
          Begin test
        </button>
      </div>
    );
  }

  if (phase === "running") {
    const q = questions[current];
    const answeredCount = Object.values(answers).filter((v) => v !== null && v !== undefined).length;
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-mute">Question {current + 1} of {questions.length}</p>
          <span className={`font-body text-sm px-3 py-1 rounded-full border ${timeLeft < 60 ? "border-coral text-coral" : "border-black/10 text-mute"}`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        <div className="bg-ink-2 border border-black/10 rounded-2xl p-6 max-w-xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-body mb-3">{q.subject}</p>
          <p className="text-sm md:text-base mb-5">{q.text}</p>
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const picked = answers[String(q.id)] === i;
              return (
                <button
                  key={i}
                  onClick={() => setAnswers((a) => ({ ...a, [String(q.id)]: i }))}
                  className={`w-full text-left text-sm rounded-lg border px-4 py-2.5 transition-colors ${
                    picked ? "border-gold bg-gold-soft text-deep" : "border-black/10 text-mute hover:border-black/20"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between max-w-xl mt-5">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="text-xs text-mute disabled:opacity-40"
          >
            ← Previous
          </button>
          <span className="text-[11px] font-body text-mute">{answeredCount}/{questions.length} answered</span>
          {current < questions.length - 1 ? (
            <button onClick={() => setCurrent((c) => c + 1)} className="text-xs text-gold font-semibold">
              Next →
            </button>
          ) : (
            <button onClick={handleSubmit} className="text-xs bg-gold text-deep font-semibold rounded-md px-4 py-1.5">
              Submit test
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-6 max-w-xl">
          {questions.map((qq, i) => {
            const done = answers[String(qq.id)] !== undefined && answers[String(qq.id)] !== null;
            return (
              <button
                key={qq.id}
                onClick={() => setCurrent(i)}
                className={`w-7 h-7 rounded-md text-[11px] font-body border transition-colors ${
                  i === current ? "border-gold text-gold" : done ? "border-verified/50 text-verified" : "border-black/10 text-mute"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (phase === "result" && result) {
    return (
      <div className="max-w-2xl">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-body mb-2">Result</p>
        <h1 className="font-display text-4xl tracking-tight mb-6">
          {result.score} <span className="text-mute text-2xl">/ {result.max_score}</span>
        </h1>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-ink-2 border border-black/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-display text-verified">{result.correct}</p>
            <p className="text-[10px] uppercase tracking-widest text-mute font-body mt-1">Correct</p>
          </div>
          <div className="bg-ink-2 border border-black/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-display text-coral">{result.incorrect}</p>
            <p className="text-[10px] uppercase tracking-widest text-mute font-body mt-1">Incorrect</p>
          </div>
          <div className="bg-ink-2 border border-black/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-display text-mute">{result.unattempted}</p>
            <p className="text-[10px] uppercase tracking-widest text-mute font-body mt-1">Skipped</p>
          </div>
        </div>

        <p className="text-xs uppercase tracking-[0.2em] text-mute font-body mb-3">Review</p>
        <div className="space-y-3">
          {result.review.map((r) => (
            <div key={r.id} className="border border-black/10 rounded-xl p-4 bg-ink-2">
              <p className="text-sm mb-2">{r.text}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                {r.options.map((opt, i) => {
                  let cls = "text-mute";
                  if (i === r.answer) cls = "text-verified";
                  else if (i === r.selected) cls = "text-coral";
                  return (
                    <span key={i} className={cls}>
                      {opt}{i < r.options.length - 1 ? " ·" : ""}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export default function TestPage() {
  return (
    <Protected>
      <TestBody />
    </Protected>
  );
}
