import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "RankVault — JEE/NEET Prep, Scored Like Exam Day",
  description:
    "Chapter practice, mock tests and progress tracking for JEE & NEET aspirants — designed around how the exam actually scores you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-ink text-[#EDEEF5] font-body">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
