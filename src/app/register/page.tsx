"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, UserIcon } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    router.push("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold gradient-text">Criar Conta</h1>
          <p className="mt-2 text-[var(--subText)] font-medium">Comece a organizar suas tarefas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-full bg-red-100 px-4 py-2.5 text-sm text-red-600 text-center font-semibold">
              {error}
            </div>
          )}

          <div className="relative">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--subText)]" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome"
              className="w-full pl-12 pr-4 py-3 rounded-full bg-[var(--subbackground)] text-[var(--text)]
                placeholder:text-[var(--subText)] outline-none focus:ring-2 focus:ring-[var(--primary)] transition"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--subText)]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full pl-12 pr-4 py-3 rounded-full bg-[var(--subbackground)] text-[var(--text)]
                placeholder:text-[var(--subText)] outline-none focus:ring-2 focus:ring-[var(--primary)] transition"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--subText)]" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha (mín. 6 caracteres)"
              className="w-full pl-12 pr-12 py-3 rounded-full bg-[var(--subbackground)] text-[var(--text)]
                placeholder:text-[var(--subText)] outline-none focus:ring-2 focus:ring-[var(--primary)] transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--subText)]"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full font-bold text-white
              bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]
              hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 transition-all"
          >
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--subText)]">
          Já tem conta?{" "}
          <Link href="/login" className="gradient-text font-bold hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
