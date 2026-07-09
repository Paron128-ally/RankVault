"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/packages", label: "Chapter Practice" },
  { href: "/lectures", label: "Lectures" },
  { href: "/myplan", label: "myPlan" },
  { href: "/test", label: "Test Engine" },
];

export default function Nav() {
  const pathname = usePathname();
  const { student, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <span className="font-display text-xl tracking-tight text-[#EDEEF5]">
              RankVault
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {LINKS.map((l) => {
              const active = pathname?.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-ink-3 text-[#EDEEF5]"
                      : "text-mute hover:text-[#EDEEF5]"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {student && (
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-xs text-[#EDEEF5]">{student.name}</span>
                <span className="text-[10px] font-mono text-mute">
                  {student.enrollment}
                </span>
              </div>
            )}
            <button
              onClick={logout}
              className="text-xs font-medium text-mute hover:text-coral border border-white/10 hover:border-coral/40 rounded-md px-3 py-1.5 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>

        <nav className="md:hidden flex gap-1 overflow-x-auto pb-2 -mt-1">
          {LINKS.map((l) => {
            const active = pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  active ? "bg-ink-3 text-[#EDEEF5]" : "text-mute"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
