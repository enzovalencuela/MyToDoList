import { prisma } from "@/lib/prisma";

export const XP_PER_TASK_COMPLETION = 10;
export const XP_PER_LEVEL = 100;

export type GamificationStats = {
  streakCount: number;
  longestStreak: number;
  xpPoints: number;
  level: number;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
};

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function dateKeyToDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function differenceInCalendarDays(fromDateKey: string, toDateKey: string) {
  const [fromYear, fromMonth, fromDay] = fromDateKey.split("-").map(Number);
  const [toYear, toMonth, toDay] = toDateKey.split("-").map(Number);
  const fromTime = Date.UTC(fromYear, fromMonth - 1, fromDay);
  const toTime = Date.UTC(toYear, toMonth - 1, toDay);

  return Math.round((toTime - fromTime) / 86_400_000);
}

export function buildGamificationStats(input: {
  streakCount: number;
  longestStreak: number;
  xpPoints: number;
  level: number;
}): GamificationStats {
  const xpInCurrentLevel = input.xpPoints % XP_PER_LEVEL;

  return {
    streakCount: input.streakCount,
    longestStreak: input.longestStreak,
    xpPoints: input.xpPoints,
    level: input.level,
    xpInCurrentLevel,
    xpForNextLevel: XP_PER_LEVEL,
    progressPercent: Math.min(
      100,
      Math.round((xpInCurrentLevel / XP_PER_LEVEL) * 100),
    ),
  };
}

export async function applyTaskCompletionReward(userId: number) {
  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario: userId },
    select: {
      streakCount: true,
      longestStreak: true,
      xpPoints: true,
      lastActiveDay: true,
    },
  });

  if (!usuario) return null;

  const todayKey = getDateKey(new Date());
  const todayDate = dateKeyToDate(todayKey);
  const lastActiveDayKey = usuario.lastActiveDay
    ? getDateKey(usuario.lastActiveDay)
    : null;
  const daysSinceLastActivity = lastActiveDayKey
    ? differenceInCalendarDays(lastActiveDayKey, todayKey)
    : null;

  const isFirstTaskOfDay =
    daysSinceLastActivity === null || daysSinceLastActivity !== 0;

  let nextStreakCount = usuario.streakCount;

  if (daysSinceLastActivity === 0) {
    nextStreakCount = Math.max(1, usuario.streakCount);
  } else if (daysSinceLastActivity === 1) {
    nextStreakCount = usuario.streakCount + 1;
  } else {
    nextStreakCount = 1;
  }

  const nextXpPoints = usuario.xpPoints + XP_PER_TASK_COMPLETION;
  const nextLevel = Math.floor(nextXpPoints / XP_PER_LEVEL) + 1;
  const nextLongestStreak = Math.max(usuario.longestStreak, nextStreakCount);

  const updatedUsuario = await prisma.usuario.update({
    where: { id_usuario: userId },
    data: {
      streakCount: nextStreakCount,
      longestStreak: nextLongestStreak,
      xpPoints: nextXpPoints,
      level: nextLevel,
      lastActiveDay: todayDate,
    },
    select: {
      streakCount: true,
      longestStreak: true,
      xpPoints: true,
      level: true,
    },
  });

  if (isFirstTaskOfDay) {
    await prisma.streakHistory.upsert({
      where: {
        userId_activityDate: {
          userId,
          activityDate: todayDate,
        },
      },
      update: {
        xpEarned: {
          increment: XP_PER_TASK_COMPLETION,
        },
      },
      create: {
        userId,
        activityDate: todayDate,
        xpEarned: XP_PER_TASK_COMPLETION,
      },
    });
  }

  return buildGamificationStats(updatedUsuario);
}
