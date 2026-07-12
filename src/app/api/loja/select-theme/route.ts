import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUsuarioId } from "@/lib/usuario";

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
    select: { unlockedThemes: true },
  });

  if (!usuario) {
    return NextResponse.json(
      { error: "Usuário não encontrado" },
      { status: 404 },
    );
  }

  if (!usuario.unlockedThemes?.includes(theme)) {
    return NextResponse.json(
      { error: "Tema não desbloqueado" },
      { status: 400 },
    );
  }

  const updatedUsuario = await prisma.usuario.update({
    where: { id_usuario },
    data: { currentTheme: theme },
    select: { currentTheme: true },
  });

  return NextResponse.json({
    success: true,
    currentTheme: updatedUsuario.currentTheme,
  });
}
