import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUsuarioId } from "@/lib/usuario";

export async function GET() {
  const id_usuario = await getUsuarioId();
  if (!id_usuario) {
    return NextResponse.json({ currentTheme: "default" });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario },
    select: { currentTheme: true },
  });

  return NextResponse.json({
    currentTheme: usuario?.currentTheme ?? "default",
  });
}
