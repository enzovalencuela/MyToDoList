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

  if (!usuario) {
    usuario = await prisma.usuario.create({
      data: {
        email: session.user.email,
        name: session.user.name ?? null,
      },
    });
  }

  return usuario;
}

export async function getUsuarioId() {
  const usuario = await getOrCreateUsuario();
  return usuario?.id_usuario ?? null;
}
