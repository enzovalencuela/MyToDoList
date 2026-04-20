import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const email = session.user.email;

  // Delete tarefas from the legacy table too
  if (email) {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (usuario) {
      await prisma.tarefa.deleteMany({ where: { id_usuario: usuario.id_usuario } });
      await prisma.usuario.delete({ where: { id_usuario: usuario.id_usuario } });
    }
  }

  // Delete NextAuth user (cascades to accounts, sessions)
  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ success: true });
}
