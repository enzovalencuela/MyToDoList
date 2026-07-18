import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getOrCreateUsuario() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  let usuario = await prisma.usuario.findUnique({
    where: { email: session.user.email },
  });

  // sync role from NextAuth User table (single source of truth for auth)
  const nextAuthUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  const roleToSet = nextAuthUser?.role ?? "USER_DEFAULT";

  if (!usuario) {
    usuario = await prisma.usuario.create({
      data: {
        email: session.user.email,
        name: session.user.name ?? null,
        lastActiveAt: new Date(),
        role: roleToSet,
      },
    });
  } else {
    usuario = await prisma.usuario.update({
      where: { id_usuario: usuario.id_usuario },
      data: { lastActiveAt: new Date(), role: roleToSet },
    });
  }

  return usuario;
}

export async function getUsuarioId() {
  const usuario = await getOrCreateUsuario();
  return usuario?.id_usuario ?? null;
}
