import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUsuarioId } from "@/lib/usuario";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST() {
  const id_usuario = await getUsuarioId();
  if (!id_usuario) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario },
    select: { xpPoints: true, level: true, xpMultiplierExpiresAt: true },
  });

  if (!usuario) {
    return NextResponse.json(
      { error: "Usuário não encontrado" },
      { status: 404 },
    );
  }

  const session = await getServerSession(authOptions);
  const nextUser = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true },
      })
    : null;
  const isAdmin = nextUser?.role === "USER_ADMIN";

  if (!isAdmin && usuario.level < 2) {
    return NextResponse.json({ error: "Requer nível 2" }, { status: 400 });
  }

  const cost = 300;
  if (!isAdmin && usuario.xpPoints < cost) {
    return NextResponse.json({ error: "XP insuficiente" }, { status: 400 });
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const updatedUsuario = await prisma.usuario.update({
    where: { id_usuario },
    data: {
      xpPoints: isAdmin ? usuario.xpPoints : usuario.xpPoints - cost,
      xpMultiplierExpiresAt: expiresAt,
    },
    select: { xpPoints: true, level: true, xpMultiplierExpiresAt: true },
  });

  return NextResponse.json({
    success: true,
    xpPoints: updatedUsuario.xpPoints,
    level: updatedUsuario.level,
    xpMultiplierExpiresAt: updatedUsuario.xpMultiplierExpiresAt,
  });
}
