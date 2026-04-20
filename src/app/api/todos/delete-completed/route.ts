import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const usuario = await prisma.usuario.findUnique({ where: { email: session.user.email } });
  if (!usuario) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  await prisma.tarefa.deleteMany({
    where: { id_usuario: usuario.id_usuario, estado_tarefa: "Finalizada" },
  });

  return NextResponse.json({ success: true });
}
