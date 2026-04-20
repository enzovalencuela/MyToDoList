import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { orderedIds } = await req.json();

  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: "orderedIds é obrigatório" }, { status: 400 });
  }

  const updates = orderedIds.map((id: string, index: number) =>
    prisma.todo.updateMany({ where: { id, userId }, data: { order: index } })
  );

  await Promise.all(updates);
  return NextResponse.json({ success: true });
}
