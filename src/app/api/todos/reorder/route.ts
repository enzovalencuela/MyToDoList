import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUsuario } from "@/lib/usuario";

export async function PUT(req: Request) {
  const usuario = await getOrCreateUsuario();
  if (!usuario) return NextResponse.json({ error: "NÃ£o autorizado" }, { status: 401 });

  const { orderedIds } = await req.json();
  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: "orderedIds Ã© obrigatÃ³rio" }, { status: 400 });
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
