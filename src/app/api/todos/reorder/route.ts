import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const usuario = await prisma.usuario.findUnique({ where: { email: session.user.email } });
  if (!usuario) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { orderedIds } = await req.json();
  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: "orderedIds é obrigatório" }, { status: 400 });
  }

  const updates = orderedIds.map((id: string, index: number) =>
    prisma.tarefa.updateMany({
      where: { id_tarefa: Number(id), id_usuario: usuario.id_usuario },
      data: { ordem: index },
    })
  );

  await Promise.all(updates);
  return NextResponse.json({ success: true });
}
