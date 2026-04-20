import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Senhas são obrigatórias" }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: "Nova senha deve ter no mínimo 6 caracteres" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.password) {
    return NextResponse.json({ error: "Conta não usa login por senha" }, { status: 400 });
  }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

  return NextResponse.json({ success: true });
}
