/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextAuthOptions } from "next-auth";
import { Adapter, AdapterUser, AdapterSession } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function PrismaAdapterCustom(): Adapter {
  return {
    async createUser(data: any) {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name ?? null,
          image: data.image ?? null,
          emailVerified: data.emailVerified ?? null,
        },
      });
      return user as AdapterUser;
    },
    async getUser(id: string) {
      const user = await prisma.user.findUnique({ where: { id } });
      return (user as AdapterUser) ?? null;
    },
    async getUserByEmail(email: string) {
      const user = await prisma.user.findUnique({ where: { email } });
      return (user as AdapterUser) ?? null;
    },
    async getUserByAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
      const account = await prisma.account.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId } },
      });
      if (!account) return null;
      const user = await prisma.user.findUnique({ where: { id: account.userId } });
      return (user as AdapterUser) ?? null;
    },
    async updateUser(data: any) {
      const user = await prisma.user.update({
        where: { id: data.id },
        data: {
          name: data.name ?? undefined,
          email: data.email ?? undefined,
          image: data.image ?? undefined,
          emailVerified: data.emailVerified ?? undefined,
        },
      });
      return user as AdapterUser;
    },
    async deleteUser(id: string) {
      await prisma.user.delete({ where: { id } });
    },
    async linkAccount(data: any) {
      await prisma.account.create({
        data: {
          userId: data.userId,
          type: data.type,
          provider: data.provider,
          providerAccountId: data.providerAccountId,
          refresh_token: data.refresh_token ?? null,
          access_token: data.access_token ?? null,
          expires_at: data.expires_at ?? null,
          token_type: data.token_type ?? null,
          scope: data.scope ?? null,
          id_token: data.id_token ?? null,
          session_state: data.session_state ?? null,
        },
      });
    },
    async unlinkAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
      await prisma.account.delete({
        where: { provider_providerAccountId: { provider, providerAccountId } },
      });
    },
    async createSession(data: any) {
      const session = await prisma.session.create({
        data: {
          sessionToken: data.sessionToken,
          userId: data.userId,
          expires: data.expires,
        },
      });
      return session as AdapterSession;
    },
    async getSessionAndUser(sessionToken: string) {
      const session = await prisma.session.findUnique({ where: { sessionToken } });
      if (!session) return null;
      const user = await prisma.user.findUnique({ where: { id: session.userId } });
      if (!user) return null;
      return { session: session as AdapterSession, user: user as AdapterUser };
    },
    async updateSession(data: any) {
      const session = await prisma.session.update({
        where: { sessionToken: data.sessionToken },
        data: { expires: data.expires ?? undefined },
      });
      return session as AdapterSession;
    },
    async deleteSession(sessionToken: string) {
      await prisma.session.delete({ where: { sessionToken } });
    },
    async createVerificationToken(data: any) {
      const token = await prisma.verificationToken.create({
        data: { identifier: data.identifier, token: data.token, expires: data.expires },
      });
      return token;
    },
    async useVerificationToken({ identifier, token }: { identifier: string; token: string }) {
      try {
        const vt = await prisma.verificationToken.delete({
          where: { identifier_token: { identifier, token } },
        });
        return vt;
      } catch {
        return null;
      }
    },
  };
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapterCustom(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Email ou senha inválidos");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Email ou senha inválidos");
        }

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
  },
};
