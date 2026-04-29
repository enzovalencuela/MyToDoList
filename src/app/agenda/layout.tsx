import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agenda Semanal",
  robots: { index: false, follow: false },
};

export default function AgendaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
