"use server";

import { prisma } from "@/lib/prisma";
import { getUsuarioId } from "@/lib/usuario";

const VALID_THEMES = ["default", "emerald", "cyberpunk", "dracula"] as const;

export async function purchaseTheme(theme: string) {
  const id_usuario = await getUsuarioId();
  if (!id_usuario) {
    return { success: false, error: "Não autorizado" };
  }

  if (!VALID_THEMES.includes(theme as (typeof VALID_THEMES)[number])) {
    return { success: false, error: "Tema inválido" };
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario },
    select: { xpPoints: true, unlockedThemes: true, currentTheme: true },
  });

  if (!usuario) {
    return { success: false, error: "Usuário não encontrado" };
  }

  const cost =
    theme === "emerald"
      ? 1000
      : theme === "cyberpunk"
        ? 1200
        : theme === "dracula"
          ? 800
          : 0;
  if (cost > 0 && usuario.xpPoints < cost) {
    return { success: false, error: "XP insuficiente" };
  }

  const unlockedThemes = new Set(usuario.unlockedThemes ?? []);
  unlockedThemes.add(theme);

  const updatedUsuario = await prisma.usuario.update({
    where: { id_usuario },
    data: {
      xpPoints: usuario.xpPoints - cost,
      unlockedThemes: Array.from(unlockedThemes),
      currentTheme: theme,
    },
    select: { xpPoints: true, unlockedThemes: true, currentTheme: true },
  });

  return {
    success: true,
    xpPoints: updatedUsuario.xpPoints,
    unlockedThemes: updatedUsuario.unlockedThemes,
    currentTheme: updatedUsuario.currentTheme,
  };
}

export async function equipTheme(theme: string) {
  const id_usuario = await getUsuarioId();
  if (!id_usuario) {
    return { success: false, error: "Não autorizado" };
  }

  if (!VALID_THEMES.includes(theme as (typeof VALID_THEMES)[number])) {
    return { success: false, error: "Tema inválido" };
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario },
    select: { unlockedThemes: true },
  });

  if (!usuario) {
    return { success: false, error: "Usuário não encontrado" };
  }

  if (!usuario.unlockedThemes?.includes(theme)) {
    return { success: false, error: "Tema não desbloqueado" };
  }

  const updatedUsuario = await prisma.usuario.update({
    where: { id_usuario },
    data: { currentTheme: theme },
    select: { currentTheme: true },
  });

  return { success: true, currentTheme: updatedUsuario.currentTheme };
}

export async function purchaseStreakFreeze() {
  const id_usuario = await getUsuarioId();
  if (!id_usuario) {
    return { success: false, error: "Não autorizado" };
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario },
    select: { xpPoints: true, streakFrozenUntil: true },
  });

  if (!usuario) {
    return { success: false, error: "Usuário não encontrado" };
  }

  const cost = 800;
  if (usuario.xpPoints < cost) {
    return { success: false, error: "XP insuficiente" };
  }

  const now = new Date();
  const baseDate =
    usuario.streakFrozenUntil && usuario.streakFrozenUntil > now
      ? usuario.streakFrozenUntil
      : now;
  const frozenUntil = new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000);

  const updatedUsuario = await prisma.usuario.update({
    where: { id_usuario },
    data: {
      xpPoints: usuario.xpPoints - cost,
      streakFrozenUntil: frozenUntil,
    },
    select: { xpPoints: true, streakFrozenUntil: true },
  });

  return {
    success: true,
    xpPoints: updatedUsuario.xpPoints,
    streakFrozenUntil: updatedUsuario.streakFrozenUntil,
  };
}

export async function purchaseAdvancedAi() {
  const id_usuario = await getUsuarioId();
  if (!id_usuario) {
    return { success: false, error: "Não autorizado" };
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario },
    select: {
      xpPoints: true,
      advancedAiUses: true,
      purchasedAiQueries: true,
    },
  });

  if (!usuario) {
    return { success: false, error: "Usuário não encontrado" };
  }

  const cost = 150;
  if (usuario.xpPoints < cost) {
    return { success: false, error: "XP insuficiente" };
  }

  const updatedUsuario = await prisma.usuario.update({
    where: { id_usuario },
    data: {
      xpPoints: usuario.xpPoints - cost,
      advancedAiUses: (usuario.advancedAiUses ?? 0) + 1,
      purchasedAiQueries: (usuario.purchasedAiQueries ?? 0) + 1,
    },
    select: {
      xpPoints: true,
      advancedAiUses: true,
      purchasedAiQueries: true,
    },
  });

  return {
    success: true,
    xpPoints: updatedUsuario.xpPoints,
    advancedAiUses: updatedUsuario.advancedAiUses,
    purchasedAiQueries: updatedUsuario.purchasedAiQueries,
  };
}
