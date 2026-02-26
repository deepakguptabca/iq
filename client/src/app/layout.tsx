import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InterviewIQ — AI-Powered Mock Interview Platform",
  description: "Ace your next interview with autonomous AI-powered mock interviews tailored to your resume, target role, and experience level.",
  keywords: ["AI interview", "mock interview", "interview prep", "career"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  );
}
