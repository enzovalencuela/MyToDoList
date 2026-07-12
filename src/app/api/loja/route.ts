import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUsuarioId } from "@/lib/usuario";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const id_usuario = await getUsuarioId();
  if (!id_usuario) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { item } = await req.json();

  if (item !== "streak-shield") {
    return NextResponse.json({ error: "Item inválido" }, { status: 400 });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario },
    select: { xpPoints: true, streakShields: true },
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

  const cost = 500;

  if (!isAdmin && usuario.xpPoints < cost) {
    return NextResponse.json({ error: "XP insuficiente" }, { status: 400 });
  }

  const updatedUsuario = await prisma.usuario.update({
    where: { id_usuario },
    data: {
      xpPoints: isAdmin ? usuario.xpPoints : usuario.xpPoints - cost,
      streakShields: usuario.streakShields + 1,
    },
    select: { xpPoints: true, streakShields: true },
  });

  return NextResponse.json({
    success: true,
    item,
    xpPoints: updatedUsuario.xpPoints,
    streakShields: updatedUsuario.streakShields,
  });
}
