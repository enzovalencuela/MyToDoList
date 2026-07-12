import { NextResponse } from "next/server";
import { buildGamificationStats } from "@/lib/gamification";
import { prisma } from "@/lib/prisma";
import { getUsuarioId } from "@/lib/usuario";

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
      lastAiQueryAt: true,
    },
  });

  if (!usuario) {
    return NextResponse.json(
      { error: "Usuário não encontrado" },
      { status: 404 },
    );
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
    lastAiQueryAt: usuario.lastAiQueryAt,
  });
}
