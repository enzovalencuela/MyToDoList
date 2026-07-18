import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUsuarioId } from "@/lib/usuario";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const id_usuario = await getUsuarioId();
  if (!id_usuario) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { theme } = await req.json();
  if (theme !== "emerald") {
    return NextResponse.json({ error: "Tema inválido" }, { status: 400 });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario },
    select: {
      xpPoints: true,
      unlockedThemes: true,
      currentTheme: true,
      role: true,
    },
  });

  if (!usuario) {
    return NextResponse.json(
      { error: "Usuário não encontrado" },
      { status: 404 },
    );
  }

  const adminModeCookie =
    (await cookies()).get("admin_mode_enabled")?.value === "true";
  const isAdmin = usuario.role === "USER_ADMIN" && adminModeCookie;

  const cost = 1000;
  if (!isAdmin && usuario.xpPoints < cost) {
    return NextResponse.json({ error: "XP insuficiente" }, { status: 400 });
  }

  const unlockedThemes = new Set(usuario.unlockedThemes ?? []);
  unlockedThemes.add(theme);

  const updatedUsuario = await prisma.usuario.update({
    where: { id_usuario },
    data: {
      xpPoints: isAdmin ? usuario.xpPoints : usuario.xpPoints - cost,
      unlockedThemes: Array.from(unlockedThemes),
      currentTheme: usuario.currentTheme ?? theme,
    },
    select: { xpPoints: true, unlockedThemes: true, currentTheme: true },
  });

  return NextResponse.json({
    success: true,
    xpPoints: updatedUsuario.xpPoints,
    unlockedThemes: updatedUsuario.unlockedThemes,
    currentTheme: updatedUsuario.currentTheme,
  });
}
