"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, User, Settings, LogOut, HelpCircle, Info } from "lucide-react";
import ThemeSwitch from "./ThemeSwitch";
import NexgenLogo from "./NexgenLogo";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navItems = [
    { label: "Perfil", href: "/profile", icon: User },
    { label: "Configurações", href: "/settings", icon: Settings },
    { label: "Sobre", href: "/about", icon: Info },
    { label: "Ajuda", href: "/help", icon: HelpCircle },
  ];

  function SidebarContent({ mobile = false }: { mobile?: boolean }) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <NexgenLogo variant="icon" className="h-9 w-9" />
            <div>
              <p className="text-sm font-bold text-[var(--text)]">Nexgen Tasks</p>
              <p className="text-xs text-[var(--subText)]">Organize melhor seu dia</p>
            </div>
          </div>
          {mobile && (
            <button onClick={onClose} className="rounded-full p-1 text-[var(--text)] hover:bg-[var(--subbackground)] transition">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="mx-4 rounded-3xl border border-[var(--subbackground)] bg-[var(--background)] px-4 py-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[var(--subbackground)] text-[var(--text)]">
              {session?.user?.image ? (
                <img src={session.user.image} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <User className="h-7 w-7" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[var(--text)]">
                {session?.user?.name || "Usuário"}
              </p>
              <p className="truncate text-xs text-[var(--subText)]">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-5 space-y-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={mobile ? onClose : undefined}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                  active
                    ? "bg-[var(--subbackground)] text-[var(--primary)] shadow-sm"
                    : "text-[var(--text)] hover:bg-[var(--subbackground)]"
                }`}
              >
                <item.icon className={`h-5 w-5 ${active ? "text-[var(--primary)]" : "text-[var(--subText)] group-hover:text-[var(--text)]"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[var(--subbackground)] p-4 space-y-3">
          <div className="rounded-2xl bg-[var(--background)] px-2 py-2 text-[var(--text)]">
            <ThemeSwitch />
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-red-500 transition-all hover:bg-red-500/10"
          >
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-[290px] lg:border-r lg:border-[var(--subbackground)] lg:bg-[var(--bgcard)] lg:shadow-xl">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="fixed right-0 top-0 z-50 h-full w-[290px] bg-[var(--bgcard)] shadow-2xl lg:hidden"
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
