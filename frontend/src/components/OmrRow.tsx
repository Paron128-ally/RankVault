"use client";

import { motion } from "framer-motion";

/**
 * The signature visual: a 10-bubble OMR (answer-sheet) row standing in
 * for a progress bar. Each bubble = one decile. Filled bubbles are
 * "shaded in pencil" the way you'd mark a real answer sheet — a small
 * nod to what this whole product is actually for.
 */
export default function OmrRow({
  value,
  className = "",
  animate = true,
}: {
  value: number; // 0-100
  className?: string;
  animate?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const bubbles = Array.from({ length: 10 }, (_, i) => {
    const threshold = (i + 1) * 10;
    const prevThreshold = i * 10;
    if (pct >= threshold) return "filled";
    if (pct > prevThreshold) return "partial";
    return "empty";
  });

  return (
    <span className={`omr-row ${className}`} aria-label={`${pct}% filled`}>
      {bubbles.map((state, i) => (
        <motion.span
          key={i}
          className={`omr-bubble ${state}`}
          initial={animate ? { scale: 0.4, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: animate ? i * 0.03 : 0, duration: 0.25 }}
        />
      ))}
    </span>
  );
}
