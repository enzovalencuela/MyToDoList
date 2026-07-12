"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import type { GamificationStats } from "@/lib/gamification";

type Props = {
  stats?: GamificationStats | null;
};

export default function GamificationProgress({ stats: externalStats }: Props) {
  const [stats, setStats] = useState<GamificationStats | null>(externalStats ?? null);
  const [loading, setLoading] = useState(!externalStats);

  useEffect(() => {
    if (externalStats) {
      setStats(externalStats);
      setLoading(false);
    }
  }, [externalStats]);

  useEffect(() => {
    if (externalStats) return;

    fetch("/api/gamification")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [externalStats]);

  useEffect(() => {
    function onUpdate(e: Event) {
      setStats((e as CustomEvent<GamificationStats>).detail);
    }

    window.addEventListener("gamification:update", onUpdate);
    return () => window.removeEventListener("gamification:update", onUpdate);
  }, []);

  if (loading) {
    return (
      <div className="mt-4 space-y-3 border-t border-[var(--subbackground)] pt-4">
        <div className="h-4 w-20 animate-pulse rounded bg-[var(--subbackground)]" />
        <div className="h-2 w-full animate-pulse rounded-full bg-[var(--subbackground)]" />
      </div>
    );
  }

  if (!stats) return null;

  const hasStreak = stats.streakCount > 0;

  return (
    <div className="mt-4 space-y-3 border-t border-[var(--subbackground)] pt-4">
      <div className="flex items-center gap-2">
        <Flame
          className={`h-4 w-4 ${
            hasStreak ? "text-orange-500" : "text-[var(--subText)] opacity-40"
          }`}
        />
        <span
          className={`text-xs font-semibold ${
            hasStreak ? "text-[var(--text)]" : "text-[var(--subText)]"
          }`}
        >
          {hasStreak ? `${stats.streakCount} ${stats.streakCount === 1 ? "dia" : "dias"}` : "0 dias"}
        </span>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--primary)]">Nv. {stats.level}</span>
          <span className="text-[var(--subText)]">
            {stats.xpInCurrentLevel} / {stats.xpForNextLevel} XP
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--subbackground)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] transition-all duration-500"
            style={{ width: `${stats.progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
