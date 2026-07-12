import { NextResponse } from "next/server";
import { buildGamificationStats } from "@/lib/gamification";
import { prisma } from "@/lib/prisma";
import { getUsuarioId } from "@/lib/usuario";

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function GET() {
  const id_usuario = await getUsuarioId();

  if (!id_usuario) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario },
    select: {
      streakCount: true,
      longestStreak: true,
      xpPoints: true,
      level: true,
      streakShields: true,
      streakFrozenUntil: true,
      xpMultiplierExpiresAt: true,
      unlockedThemes: true,
      currentTheme: true,
      advancedAiUses: true,
      freeAiQueriesUsedToday: true,
      purchasedAiQueries: true,
      lastAiResponse: true,
      lastAiQueryAt: true,
      email: true,
    },
  });

  if (!usuario) {
    return NextResponse.json(
      { error: "Usuário não encontrado" },
      { status: 404 },
    );
  }

  const todayKey = getLocalDateKey(new Date());
  const lastAiResponse =
    usuario.lastAiQueryAt &&
    getLocalDateKey(new Date(usuario.lastAiQueryAt)) === todayKey
      ? usuario.lastAiResponse
      : null;

  // detect admin role from NextAuth User table using the usuario email
  let isAdmin = false;
  if (usuario.email) {
    const nextUser = await prisma.user.findUnique({
      where: { email: usuario.email },
      select: { role: true },
    });
    isAdmin = nextUser?.role === "USER_ADMIN";
  }

  return NextResponse.json({
    ...buildGamificationStats(usuario),
    streakShields: usuario.streakShields,
    streakFrozenUntil: usuario.streakFrozenUntil,
    xpMultiplierExpiresAt: usuario.xpMultiplierExpiresAt,
    unlockedThemes: usuario.unlockedThemes,
    currentTheme: usuario.currentTheme,
    advancedAiUses: usuario.advancedAiUses,
    freeAiQueriesUsedToday: usuario.freeAiQueriesUsedToday,
    purchasedAiQueries: usuario.purchasedAiQueries,
    lastAiResponse,
    lastAiQueryAt: usuario.lastAiQueryAt,
    isAdmin,
  });
}
