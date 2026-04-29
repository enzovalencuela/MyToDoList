import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUsuario } from "@/lib/usuario";

export async function DELETE() {
  const usuario = await getOrCreateUsuario();
  if (!usuario) return NextResponse.json({ error: "NÃ£o autorizado" }, { status: 401 });

  await prisma.tarefa.deleteMany({
    where: { id_usuario: usuario.id_usuario, estado_tarefa: "Finalizada" },
  });

  return NextResponse.json({ success: true });
}
